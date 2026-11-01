import axios from "axios";

const DEFAULT_TIMEOUT = 15000;
const SLOW_TIMEOUT = 45000;
const MAX_TIMEOUT = 60000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 400;

const SLOW_PATH_PATTERNS = [
  /\/rate(\?|$)/,
  /\/rate-analysis/,
  /\/analytics\//,
  /\/export-sauda/,
  /\/sauda-descriptions/,
  /\/ratehistory/,
];

const RETRYABLE_METHODS = new Set(["get", "head", "options"]);

const inflightGets = new Map();

const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const resolveTimeout = (config) => {
  if (config.timeout && config.timeout !== DEFAULT_TIMEOUT) return config.timeout;

  const url = `${config.url || ""}${config.params ? "?" : ""}`;
  return SLOW_PATH_PATTERNS.some((pattern) => pattern.test(url))
    ? SLOW_TIMEOUT
    : DEFAULT_TIMEOUT;
};

const shouldRetry = (error) => {
  const config = error?.config;
  if (!config) return false;
  if ((config.__retryCount || 0) >= MAX_RETRIES) return false;
  if (axios.isCancel(error)) return false;

  const method = (config.method || "get").toLowerCase();
  if (!RETRYABLE_METHODS.has(method)) return false;

  if (!error.response) return error.code !== "ERR_CANCELED";
  return error.response.status >= 500;
};

axiosInstance.interceptors.request.use((config) => {
  config.__retryCount = config.__retryCount || 0;

  if (!config.__timeoutResolved) {
    config.timeout = resolveTimeout(config);
    config.__timeoutResolved = true;
  }

  if ((config.method || "get").toLowerCase() !== "get") {
    inflightGets.clear();
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!shouldRetry(error)) return Promise.reject(error);

    const config = error.config;
    config.__retryCount += 1;

    config.timeout = Math.min(
      (config.timeout || DEFAULT_TIMEOUT) * 2,
      MAX_TIMEOUT,
    );

    await sleep(RETRY_BASE_DELAY_MS * config.__retryCount);
    return axiosInstance(config);
  },
);

const originalGet = axiosInstance.get.bind(axiosInstance);

const buildGetKey = (url, params) => {
  const sorted = params ? JSON.stringify(params, Object.keys(params).sort()) : "";
  return `${url}::${sorted}`;
};

axiosInstance.get = function dedupedGet(url, config = {}) {
  if (config?.method && String(config.method).toLowerCase() !== "get") {
    return originalGet(url, config);
  }

  if (config?.signal) {
    return originalGet(url, config);
  }

  const key = buildGetKey(url, config?.params);

  const pending = inflightGets.get(key);
  if (pending) return pending;

  const request = originalGet(url, config).finally(() => {
    inflightGets.delete(key);
  });

  inflightGets.set(key, request);
  return request;
};

export default axiosInstance;
