import User from "@/models/User";

const MESSAGE_ENDPOINT = "/api/v1/messages/send";

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

const sendTemplateMessages = async (
  recipients,
  templateIdEnv,
  variables
) => {
  if (recipients.length === 0) return { sent: 0 };

  const config = getConfiguration(templateIdEnv);
  let sent = 0;

  for (const recipient of recipients) {
    const response = await fetch(`${config.baseUrl}${MESSAGE_ENDPOINT}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminUserId: config.adminUserId,
        adminPassword: config.adminPassword,
        templateName: config.templateId,
        language: recipient.language || "en",
        toUserId: recipient.toUserId,
        variables: {
          ...variables,
          name: recipient.name,
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    let result;
    try {
      result = await response.json();
    } catch (error) {
      if (response.ok) {
        throw new Error("Message API returned an invalid JSON response", {
          cause: error,
        });
      }
    }

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "1";
        throw new Error(
          result?.error ||
            `Message API rate limit reached; retry after ${retryAfter} seconds`
        );
      }
      throw new Error(
        result?.error || `Message API request failed with HTTP ${response.status}`
      );
    }

    sent += 1;
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

export const sendTemplateToConfiguredUser = async (
  templateIdEnv,
  recipientIdEnv,
  variables
) => {
  const toUserId = process.env[recipientIdEnv]?.trim();
  if (!toUserId) {
    throw new Error(`Missing message API configuration: ${recipientIdEnv}`);
  }

  return sendTemplateMessages(
    [{ toUserId, name: "", language: "en" }],
    templateIdEnv,
    variables
  );
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
