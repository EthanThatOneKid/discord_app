import type { RESTPostAPIApplicationCommandsJSONBody } from "./discord_api_types.ts";

/**
 * DISCORD_API_URL is the base URL for the Discord API.
 */
export const DISCORD_API_URL = "https://discord.com/api/v10";

/**
 * makeBotAuthorization makes the Authorization header for a bot.
 */
export function makeBotAuthorization(botToken: string) {
  return botToken.startsWith("Bot ") ? botToken : `Bot ${botToken}`;
}

/**
 * makeRegisterCommandsURL makes the URL to register a Discord application command.
 */
export function makeRegisterCommandsURL(
  clientID: string,
  base = DISCORD_API_URL,
) {
  return new URL(`${base}/applications/${clientID}/commands`);
}

/**
 * RegisterApplicationCommandOptions are the options for registering a Discord
 * application command.
 */
export interface RegisterApplicationCommandOptions {
  /**
   * applicationID is the ID of the Discord application.
   */
  applicationID: string;

  /**
   * token is the token of the Discord bot.
   */
  token: string;

  /**
   * applicationCommand is the Discord application command to register.
   */
  applicationCommand: RESTPostAPIApplicationCommandsJSONBody;
}

/**
 * registerApplicationCommand registers a Discord application command.
 */
export async function registerApplicationCommand(
  options: RegisterApplicationCommandOptions,
): Promise<void> {
  const url = makeRegisterCommandsURL(options.applicationID);
  const response = await fetch(url, {
    method: "POST",
    headers: new Headers([
      ["Content-Type", "application/json"],
      ["Authorization", makeBotAuthorization(options.token)],
    ]),
    body: JSON.stringify(options.applicationCommand),
  });
  if (!response.ok) {
    console.error("text:", await response.text());
    throw new Error(
      `Failed to register command: ${response.status} ${response.statusText}`,
    );
  }
}

// TODO: Expose more convenient functions for working with the Discord API.
