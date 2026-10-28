// Lambda: config  |  Trigger: API Gateway GET /config
const { AppConfigDataClient, StartConfigurationSessionCommand, GetLatestConfigurationCommand } = require("@aws-sdk/client-appconfigdata")

const client = new AppConfigDataClient({ region: process.env.AWS_REGION || "us-east-1" })

// Module-level cache — persists across warm invocations (key Lambda optimization)
let sessionToken = null
let cachedConfig = { maintenance_mode: false, show_new_banner: false }

async function startSession() {
  const command = new StartConfigurationSessionCommand({
    ApplicationIdentifier: process.env.APPCONFIG_APP || "CodeDynasty",
    EnvironmentIdentifier: process.env.APPCONFIG_ENV || "Production",
    ConfigurationProfileIdentifier: process.env.APPCONFIG_PROFILE || "CodeDynastyConfig",
  })
  const response = await client.send(command)
  sessionToken = response.InitialConfigurationToken
}

async function refreshConfig() {
  // Always ensure we have a valid session
  if (!sessionToken) await startSession()

  try {
    const command = new GetLatestConfigurationCommand({ ConfigurationToken: sessionToken })
    const response = await client.send(command)

    // Always update token — AppConfig rotates it on every call
    sessionToken = response.NextPollConfigurationToken

    // Empty configuration means nothing changed since last poll — keep cache
    if (response.Configuration && response.Configuration.length > 0) {
      const text = Buffer.from(response.Configuration).toString("utf-8")
      if (text.trim()) {
        cachedConfig = JSON.parse(text)
        console.log("Config refreshed:", cachedConfig)
      }
    }

  } catch (err) {
    // Token likely expired — reset so next invocation starts a fresh session
    console.warn("Session token invalid, resetting:", err.message)
    sessionToken = null
    throw err // re-throw so handler falls back to cachedConfig
  }
}

exports.handler = async () => {
  try {
    await refreshConfig()
  } catch (err) {
    // Degraded mode — serve last known good config
    // This keeps the app alive even if AppConfig is unreachable
    console.warn("AppConfig refresh failed, using cached config:", err.message)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(cachedConfig),
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  }
}