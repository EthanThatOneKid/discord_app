import nacl from "tweetnacl";
import type { RESTPostAPIApplicationCommandsJSONBody } from "./discord_api_types.ts";

/**
 * DISCORD_API_URL is the base URL for the Discord API.
 */
export const DISCORD_API_URL = "https://discord.com/api/v10";

/**
 * makeBotAuthorization makes the Authorization header for a bot.
 */
export function makeBotAuthorization(botToken: string): string {
  return botToken.startsWith("Bot ") ? botToken : `Bot ${botToken}`;
}

/**
 * makeRegisterCommandsURL makes the URL to register a Discord application command.
 */
export function makeRegisterCommandsURL(
  applicationID: string,
  guildID?: string,
  base = DISCORD_API_URL,
): URL {
  return new URL(
    `${base}/applications/${applicationID}/commands${
      guildID !== undefined ? `/guilds/${guildID}` : ""
    }`,
  );
}

/**
 * InviteOptions are the options for the invite URL.
 */
export interface InviteOptions {
  /**
   * scopes are the OAuth2 scopes.
   */
  scopes?: string[];

  /**
   * permissions are the permissions for the application command.
   */
  permissions?: string[];
}

/**
 * makeInviteURL creates an invite URL for the application command.
 */
export function makeInviteURL(
  clientID: string,
  options: InviteOptions,
): URL {
  const inviteURL = new URL("https://discord.com/oauth2/authorize");
  inviteURL.searchParams.set("client_id", clientID);
  if (options.scopes !== undefined) {
    inviteURL.searchParams.set("scope", options.scopes.join(" "));
  }

  if (options.permissions !== undefined) {
    inviteURL.searchParams.set(
      "permissions",
      options.permissions.join(" "),
    );
  }
  return inviteURL;
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
   * guildID is the ID of the Discord guild to register the command in.
   */
  guildID?: string;

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
  const url = makeRegisterCommandsURL(options.applicationID, options.guildID);
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

/**
 * hexToUint8Array converts a hexadecimal string to Uint8Array.
 */
function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}

/**
 * VerifyOptions are the options for verifying a request from Discord.
 */
export interface VerifyOptions {
  /**
   * publicKey is the public key of the Discord application.
   */
  publicKey: string;

  /**
   * request is the request to verify.
   */
  request: Request;
}

/**
 * VerifiedRequest is a verified request from Discord.
 */
export type VerifiedRequest =
  | { error: null; body: string }
  | { error: Response; body: null };

/**
 * verify verifies whether the request is coming from Discord.
 */
export async function verify(options: VerifyOptions): Promise<VerifiedRequest> {
  if (options.request.method !== "POST") {
    return {
      error: new Response("Method not allowed", { status: 405 }),
      body: null,
    };
  }

  if (options.request.headers.get("content-type") !== "application/json") {
    return {
      error: new Response("Unsupported Media Type", { status: 415 }),
      body: null,
    };
  }

  const signature = options.request.headers.get("X-Signature-Ed25519");
  if (!signature) {
    return {
      error: new Response("Missing header X-Signature-Ed25519", {
        status: 401,
      }),
      body: null,
    };
  }

  const timestamp = options.request.headers.get("X-Signature-Timestamp");
  if (!timestamp) {
    return {
      error: new Response("Missing header X-Signature-Timestamp", {
        status: 401,
      }),
      body: null,
    };
  }

  const body = await options.request.text();
  const isValid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    hexToUint8Array(signature),
    hexToUint8Array(options.publicKey),
  );

  // When the request's signature is not valid, we return a 401 and this is
  // important as Discord sends invalid requests to test our verification.
  if (!isValid) {
    return {
      error: new Response("Invalid request", { status: 401 }),
      body: null,
    };
  }

  return { body, error: null };
}

/**
 * makeEditOriginalInteractionResponseURL makes the URL to edit the original interaction response.
 */
export function makeEditOriginalInteractionResponseURL(
  clientID: string,
  interactionToken: string,
  base = DISCORD_API_URL,
): URL {
  return new URL(
    `${base}/webhooks/${clientID}/${interactionToken}/messages/@original`,
  );
}

/**
 * EditOriginalInteractionResponseOptions is the initialization to edit the original interaction response.
 */
export interface EditOriginalInteractionResponseOptions {
  /**
   * applicationID is the ID of the Discord application.
   */
  applicationID: string;

  /**
   * token is the token of the Discord bot.
   */
  token: string;

  /**
   * interactionToken is the interaction token.
   */
  interactionToken: string;

  /**
   * content is the content to edit.
   */
  content: string;
}

/**
 * editOriginalInteractionResponse edits the original interaction response.
 */
export async function editOriginalInteractionResponse(
  options: EditOriginalInteractionResponseOptions,
): Promise<void> {
  const url = makeEditOriginalInteractionResponseURL(
    options.applicationID,
    options.interactionToken,
  );
  const response = await fetch(url, {
    method: "PATCH",
    headers: new Headers([["Content-Type", "application/json"]]),
    body: JSON.stringify({ content: options.content }),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to edit original interaction response: ${response.status} ${response.statusText}`,
    );
  }
}

/**
 * Credentials are the credentials for the Discord API.
 */
export interface Credentials {
  /**
   * applicationID is the ID of the Discord application.
   */
  applicationID: string;

  /**
   * token is the token of the Discord bot.
   */
  token: string;

  /**
   * publicKey is the public key of the Discord application.
   */
  publicKey: string;
}

/**
 * OmitCredentials is a bag of options excluding the credentials.
 */
export type OmitCredentials<T> = Omit<T, keyof Credentials>;

/**
 * DiscordAPI is the Discord API client.
 */
export class DiscordAPI {
  public constructor(private readonly credentials?: Credentials) {}

  public registerApplicationCommand(
    options: OmitCredentials<RegisterApplicationCommandOptions>,
  ): Promise<void> {
    if (this.credentials === undefined) {
      throw new Error("Credentials are required");
    }

    return registerApplicationCommand({
      applicationID: this.credentials.applicationID,
      token: this.credentials.token,
      ...options,
    });
  }

  public verify(
    options: OmitCredentials<VerifyOptions>,
  ): Promise<VerifiedRequest> {
    if (this.credentials === undefined) {
      throw new Error("Credentials are required");
    }

    return verify({
      publicKey: this.credentials.publicKey,
      ...options,
    });
  }

  public editOriginalInteractionResponse(
    options: OmitCredentials<EditOriginalInteractionResponseOptions>,
  ): Promise<void> {
    if (this.credentials === undefined) {
      throw new Error("Credentials are required");
    }

    return editOriginalInteractionResponse({
      applicationID: this.credentials.applicationID,
      token: this.credentials.token,
      ...options,
    });
  }
}

// TODO: Expose more convenient functions for working with the Discord API.
