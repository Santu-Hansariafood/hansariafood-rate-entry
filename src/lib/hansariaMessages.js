import User from "@/models/User";

const MESSAGE_ENDPOINT = "/api/v1/messages/bulk";
const MAX_RECIPIENTS = 1000;
const MAX_REQUEST_BYTES = 2 * 1024 * 1024;

const getConfiguration = (templateIdEnv) => {
  const names = [
    "HANSARIA_API_BASE_URL",
    "HANSARIA_API_KEY",
    "HANSARIA_ADMIN_ID",
    "HANSARIA_ADMIN_PASSWORD",
    templateIdEnv,
  ];
  const config = Object.fromEntries(
    names.map((name) => [name, process.env[name]?.trim()])
  );
  const missing = names.filter((name) => !config[name]);

  if (missing.length > 0) {
    throw new Error(`Missing message API configuration: ${missing.join(", ")}`);
  }

  let baseUrl;
  try {
    baseUrl = new URL(config.HANSARIA_API_BASE_URL);
  } catch {
    throw new Error("HANSARIA_API_BASE_URL must be a valid HTTPS URL");
  }

  if (baseUrl.protocol !== "https:") {
    throw new Error("HANSARIA_API_BASE_URL must use HTTPS");
  }

  return {
    baseUrl: baseUrl.toString().replace(/\/$/, ""),
    apiKey: config.HANSARIA_API_KEY,
    adminUserId: config.HANSARIA_ADMIN_ID,
    adminPassword: config.HANSARIA_ADMIN_PASSWORD,
    templateId: config[templateIdEnv],
  };
};

const createRequestBody = (config, recipients, variables) =>
  JSON.stringify({
    adminUserId: config.adminUserId,
    adminPassword: config.adminPassword,
    templateId: config.templateId,
    recipients: recipients.map((recipient) => ({
      toUserId: recipient.toUserId,
      ...(recipient.language ? { language: recipient.language } : {}),
      variables: {
        ...variables,
        name: recipient.name,
      },
    })),
  });

const splitRecipientsIntoBatches = (recipients, config, variables) => {
  const batches = [];
  let batch = [];

  for (const recipient of recipients) {
    const candidate = [...batch, recipient];
    const candidateBody = createRequestBody(config, candidate, variables);
    const exceedsSize =
      Buffer.byteLength(candidateBody, "utf8") > MAX_REQUEST_BYTES;

    if (
      (candidate.length > MAX_RECIPIENTS || exceedsSize) &&
      batch.length > 0
    ) {
      batches.push(batch);
      batch = [recipient];
    } else {
      batch = candidate;
    }

    if (
      Buffer.byteLength(
        createRequestBody(config, batch, variables),
        "utf8"
      ) > MAX_REQUEST_BYTES
    ) {
      throw new Error("A single message request exceeds the 2 MB API limit");
    }
  }

  if (batch.length > 0) batches.push(batch);
  return batches;
};

const sendTemplateMessages = async (
  recipients,
  templateIdEnv,
  variables
) => {
  if (recipients.length === 0) return { sent: 0 };

  const config = getConfiguration(templateIdEnv);
  const batches = splitRecipientsIntoBatches(recipients, config, variables);
  let sent = 0;

  for (const batch of batches) {
    const body = createRequestBody(config, batch, variables);
    const response = await fetch(`${config.baseUrl}${MESSAGE_ENDPOINT}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body,
      signal: AbortSignal.timeout(15000),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After") || "1";
      throw new Error(
        `Message API rate limit reached; retry after ${retryAfter} seconds`
      );
    }

    if (!response.ok) {
      throw new Error(`Message API request failed with HTTP ${response.status}`);
    }

    const result = await response.json();
    if (!Number.isInteger(result?.sent) || result.sent < 0) {
      throw new Error("Message API returned an invalid sent count");
    }

    sent += result.sent;
  }

  return { sent };
};

export const sendTemplateToUser = async (user, templateIdEnv, variables) => {
  if (!user?.toUserId?.trim()) {
    return { sent: 0, skipped: 1 };
  }

  const result = await sendTemplateMessages(
    [
      {
        toUserId: user.toUserId.trim(),
        name: user.name || "",
        language: user.language || undefined,
      },
    ],
    templateIdEnv,
    variables
  );

  return { ...result, skipped: 0 };
};

export const sendTemplateToConfiguredUsers = async (
  templateIdEnv,
  recipientIdsEnv,
  recipientLanguagesEnv,
  variables
) => {
  const toUserIds = process.env[recipientIdsEnv]
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!toUserIds?.length) {
    throw new Error(`Missing message API configuration: ${recipientIdsEnv}`);
  }

  const languages = process.env[recipientLanguagesEnv]
    ?.split(",")
    .map((language) => language.trim().toLowerCase());
  if (
    languages &&
    (languages.length !== toUserIds.length || languages.some((language) => !language))
  ) {
    throw new Error(
      `${recipientLanguagesEnv} must contain one language per ${recipientIdsEnv} entry`
    );
  }

  const recipients = toUserIds.map((toUserId, index) => ({
    toUserId,
    name: "",
    ...(languages ? { language: languages[index] } : {}),
  }));

  return sendTemplateMessages(recipients, templateIdEnv, variables);
};

export const sendTemplateToRegisteredUsers = async (
  templateIdEnv,
  variables
) => {
  const users = await User.find({})
    .select("name toUserId language -_id")
    .lean();
  const recipients = users
    .filter((user) => typeof user.toUserId === "string" && user.toUserId.trim())
    .map((user) => ({
      toUserId: user.toUserId.trim(),
      name: user.name || "",
      language: user.language || undefined,
    }));

  if (recipients.length === 0) {
    return { sent: 0, skipped: users.length };
  }

  const result = await sendTemplateMessages(
    recipients,
    templateIdEnv,
    variables
  );
  return { ...result, skipped: users.length - recipients.length };
};
