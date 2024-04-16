import type {
  APIApplicationCommandInteractionDataOption,
  APIApplicationCommandOption,
  APIInteraction,
  APIInteractionResponse,
  RESTPostAPIApplicationCommandsJSONBody,
} from "./discord_api_types.ts";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
} from "./discord_api_types.ts";
import type { Credentials, InviteOptions } from "./discord_api.ts";
import { DiscordAPI, makeInviteURL } from "./discord_api.ts";
import type {
  App,
  AppChatInputBasicOption,
  AppChatInputCommandSchema,
  AppChatInputInteractionOf,
  AppChatInputSchemaBase,
  AppMessageInteraction,
  AppOptionsSchema,
  AppSchema,
  AppSubcommandGroupsSchema,
  AppSubcommandsSchema,
  AppUserInteraction,
  ParsedAppChatInputCommandOptions,
} from "./app.ts";
import type { Promisable } from "./promisable.ts";

/**
 * toAPIOptions converts a schema's options to valid Discord Application Command
 * options.
 */
export function toAPIOptions(
  schema: AppChatInputCommandSchema<AppChatInputBasicOption>["chatInput"],
): APIApplicationCommandOption[] | undefined {
  if ("options" in schema) {
    if (schema.options === undefined) {
      return;
    }

    return Object.entries(schema.options).map(([name, schemaOption]) => {
      const { choices: _, ...rest } = schemaOption;
      const apiOption: APIApplicationCommandOption = {
        ...rest,
        type: schemaOption.type as number,
        name,
      };
      if (
        schemaOption.choices &&
        (apiOption.type === ApplicationCommandOptionType.String ||
          apiOption.type === ApplicationCommandOptionType.Integer ||
          apiOption.type === ApplicationCommandOptionType.Number)
      ) {
        apiOption.choices = Object.entries(schemaOption.choices).map(
          ([name, value]) => ({ name, value }),
        );
      }

      return apiOption;
    });
  }

  if ("subcommands" in schema) {
    return Object.entries(schema.subcommands).map(([name, subcommand]) => {
      const { options: _, ...options } = subcommand;
      return {
        ...options,
        name,
        type: ApplicationCommandOptionType.Subcommand as number,
        options: toAPIOptions({ ...subcommand, name }),
      };
    });
  }

  if ("groups" in schema) {
    return Object.entries(schema.groups).map(([name, group]) => {
      const { subcommands: _, ...options } = group;
      return {
        ...options,
        name,
        type: ApplicationCommandOptionType.SubcommandGroup as number,
        options: toAPIOptions({ ...group, name }),
      };
    });
  }

  return undefined;
}

/**
 * toAPI converts an AppSchema to a registerable Discord Application Command descriptor.
 */
export function toAPI(
  schema: AppSchema,
): RESTPostAPIApplicationCommandsJSONBody {
  if ("user" in schema) {
    return {
      ...schema.user,
      type: ApplicationCommandType.User,
    };
  }

  if ("message" in schema) {
    return {
      ...schema.message,
      type: ApplicationCommandType.Message,
    };
  }

  const result: RESTPostAPIApplicationCommandsJSONBody = {
    ...schema.chatInput,
    type: ApplicationCommandType.ChatInput,
    options: toAPIOptions(schema.chatInput),
  };
  if ("groups" in result) {
    delete result.groups;
  }
  if ("subcommands" in result) {
    delete result.subcommands;
  }

  return result;
}

/**
 * fromAPIChatInputOptions parses the options of an incoming chat input command.
 */
export function fromAPIChatInputOptions(
  schema: AppChatInputCommandSchema<AppChatInputBasicOption>["chatInput"],
  options: APIApplicationCommandInteractionDataOption[] | undefined,
): ParsedAppChatInputCommandOptions {
  if (
    (options === undefined || options.length === 0) && !("options" in schema)
  ) {
    throw new Error("Invalid options");
  }

  if ("options" in schema) {
    // Options are required if present in the schema.
    if (schema.options === undefined) {
      if (options !== undefined && options.length !== 0) {
        throw new Error("Invalid options");
      }

      // No options with no schema options is valid.
      return {};
    }

    // Options are validated against the schema.
    for (const schemaOptionName in schema.options) {
      const schemaOption = schema.options[schemaOptionName];
      const option = (options ?? []).find((o) => o.name === schemaOptionName);
      if (!option) {
        if (schemaOption.required) {
          throw new Error(`Missing option ${schemaOptionName}`);
        }

        continue;
      }

      if (schemaOption.type !== option?.type) {
        throw new Error(
          `Unexpected type ${option?.type} for option ${schemaOptionName}`,
        );
      }

      if (schemaOption.choices && option?.value !== undefined) {
        // Choice values may either be a string or number, but not a boolean.
        const isValidChoice = typeof option.value !== "boolean" &&
          Object.values(schemaOption.choices).includes(option.value);
        if (!isValidChoice) {
          throw new Error(
            `Unexpected value ${option.value} for option ${schemaOptionName}`,
          );
        }
      }
    }

    // Options are parsed.
    const parsedOptions: ParsedAppChatInputCommandOptions["parsedOptions"] = {};
    for (const option of options!) {
      switch (option.type) {
        case ApplicationCommandOptionType.String:
        case ApplicationCommandOptionType.Boolean:
        case ApplicationCommandOptionType.User:
        case ApplicationCommandOptionType.Channel:
        case ApplicationCommandOptionType.Role:
        case ApplicationCommandOptionType.Mentionable: {
          parsedOptions[option.name] = option.value;
          break;
        }

        default: {
          throw new Error("Invalid option");
        }
      }
    }

    return { parsedOptions };
  }

  if ("subcommands" in schema) {
    if (options!.length !== 1) {
      throw new Error("Invalid options");
    }

    const subcommandName = options![0].name;
    const subcommandSchema = schema.subcommands[subcommandName];
    if (subcommandSchema === undefined) {
      throw new Error("Invalid subcommand");
    }
    if (options![0].type !== ApplicationCommandOptionType.Subcommand) {
      throw new Error("Invalid subcommand");
    }

    const parsedOptions = fromAPIChatInputOptions(
      { ...subcommandSchema, name: subcommandName },
      options![0].options,
    );
    return {
      ...parsedOptions,
      subcommandName,
    };
  }

  if ("groups" in schema) {
    if (options!.length !== 1) {
      throw new Error("Invalid options");
    }

    const subcommandGroupName = options![0].name;
    const subcommandGroupSchema = schema.groups[subcommandGroupName];
    if (subcommandGroupSchema === undefined) {
      throw new Error("Invalid subcommand group");
    }
    if (options![0].type !== ApplicationCommandOptionType.SubcommandGroup) {
      throw new Error("Invalid subcommand group");
    }

    const parsedOptions = fromAPIChatInputOptions(
      { ...subcommandGroupSchema, name: subcommandGroupName },
      options![0].options,
    );
    return {
      ...parsedOptions,
      subcommandGroupName,
    };
  }

  throw new Error("Invalid schema");
}

/**
 * AppHandlerErrorBehaviorOptions is the configuration of the error behavior.
 */
type AppHandlerErrorBehaviorOptions<T> =
  | {
    /**
     * throw is the function used to throw an error.
     */
    throw: (error: Error) => Error | Promise<Error>;
  }
  | {
    /**
     * send is the function used to send an error response.
     */
    send: (error: Error) => T | Promise<T>;
  };

/**
 * DEFAULT_RESPONSE_ERROR_BEHAVIOR is the default error behavior.
 */
const DEFAULT_RESPONSE_ERROR_BEHAVIOR: AppHandlerErrorBehaviorOptions<
  APIInteractionResponse
> = {
  throw: (error) => error,
};

/**
 * withErrorBehavior wraps a promise with error behavior.
 */
export async function withErrorBehavior<T>(
  /**
   * promise can throw an error. promise can be an error.
   */
  promise: Promise<T> | Error,
  /**
   * errorBehavior is the error behavior.
   */
  errorBehavior: AppHandlerErrorBehaviorOptions<T>,
): Promise<T> {
  try {
    if (promise instanceof Error) {
      throw promise;
    }

    return await promise;
  } catch (error) {
    if ("throw" in errorBehavior) {
      throw await errorBehavior.throw(error);
    }

    if ("send" in errorBehavior) {
      return await errorBehavior.send(error);
    }
  }

  throw new Error("Invalid error behavior");
}

/**
 * AppHandlerInviteOptions is the configuration of the invite redirect.
 */
export interface AppHandlerInviteOptions extends InviteOptions {
  /**
   * path is the path to the application command invite endpoint. Includes
   * slash prefix.
   */
  path: string;
}

/**
 * AppHandlerRegisterOptions is the configuration of the application command
 * registration.
 */
export interface AppHandlerRegisterOptions {
  /**
   * guildID is the ID of the guild to register the application command in.
   */
  guildID?: string;
}

/**
 * AppHandlerOptions is the configuration of
 */
export interface AppHandlerOptions<T> extends Credentials {
  /**
   * schema is the schema of the application command.
   */
  schema: T;

  /**
   * path is the path to the application command handler endpoint. Includes
   * slash prefix. Defaults to "/".
   */
  path?: string;

  /**
   * invite is the configuration of the invite redirect. If not provided, the
   * invite endpoint will not be handled.
   */
  invite?: AppHandlerInviteOptions;

  /**
   * errorBehavior is the configuration of the error behavior.
   */
  errorBehavior?: AppHandlerErrorBehaviorOptions<APIInteractionResponse>;

  /**
   * register is the configuration of the application command registration. If
   * not provided, the application command will not be registered on app creation.
   */
  register?: AppHandlerRegisterOptions | boolean;

  /**
   * api is the Discord API interface. Defaults to the real Discord API.
   */
  api?: DiscordAPI;
}

/**
 * ERROR_INVALID_REQUEST is an error that indicates that the request is invalid.
 */
const ERROR_INVALID_REQUEST = new Error("Invalid request");

function makeDiscordAPI(
  applicationID: string | undefined,
  publicKey: string | undefined,
  token: string | undefined,
): DiscordAPI {
  if (applicationID === undefined) {
    throw new Error("applicationID is required to register the command");
  }

  if (publicKey === undefined) {
    throw new Error("publicKey is required to verify the request");
  }

  if (token === undefined) {
    throw new Error("token is required to register the command");
  }

  return new DiscordAPI({ applicationID, publicKey, token });
}

/**
 * createApp creates a Discord application command and returns an HTTP
 * request handler function that handles the application interactions.
 */
export async function createApp<TAppSchema extends AppSchema>(
  options: AppHandlerOptions<TAppSchema>,
  handlers: App<TAppSchema>,
): Promise<(r: Request) => Promise<Response>> {
  const api = options.api ??
    makeDiscordAPI(
      options.applicationID,
      options.publicKey,
      options.token,
    );
  if (options.register) {
    await api.registerApplicationCommand({
      applicationCommand: toAPI(options.schema),
      guildID: options.register === true ? undefined : options.register.guildID,
    });
  }

  const basePath = options.path ?? "/";
  const errorBehavior = options.errorBehavior ??
    DEFAULT_RESPONSE_ERROR_BEHAVIOR;
  return async function (request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (options.invite && request.method === "GET") {
      const invitePath = basePath === "/"
        ? options.invite.path
        : `${basePath}${options.invite.path}`;
      if (url.pathname === invitePath) {
        if (options.applicationID === undefined) {
          throw new Error(
            "applicationID is required to redirect to the invite endpoint",
          );
        }

        const inviteURL = makeInviteURL(options.applicationID, options.invite);
        return Response.redirect(inviteURL, 302);
      }
    }

    const { body, error } = await api.verify({ request });
    if (error) {
      return error;
    }

    const interaction = JSON.parse(body) as APIInteraction;
    switch (interaction.type) {
      case InteractionType.Ping: {
        return Response.json({ type: InteractionResponseType.Pong });
      }

      case InteractionType.ApplicationCommand: {
        if (interaction.data.type === ApplicationCommandType.Message) {
          if (!("message" in options.schema)) {
            const response = await withErrorBehavior(
              ERROR_INVALID_REQUEST,
              errorBehavior,
            );
            return Response.json(response);
          }

          return Response.json(
            await (handlers as (
              interaction: AppMessageInteraction,
            ) => Promisable<APIInteractionResponse>)(
              interaction as unknown as AppMessageInteraction,
            ),
          );
        }

        if (interaction.data.type === ApplicationCommandType.User) {
          if (!("user" in options.schema)) {
            const response = await withErrorBehavior(
              ERROR_INVALID_REQUEST,
              errorBehavior,
            );
            return Response.json(response);
          }

          return Response.json(
            await (handlers as (
              interaction: AppUserInteraction,
            ) => Promisable<APIInteractionResponse>)(
              interaction as unknown as AppUserInteraction,
            ),
          );
        }

        if (interaction.data.type === ApplicationCommandType.ChatInput) {
          if (!("chatInput" in options.schema)) {
            const response = await withErrorBehavior(
              ERROR_INVALID_REQUEST,
              errorBehavior,
            );
            return Response.json(response);
          }

          const { subcommandGroupName, subcommandName, parsedOptions } =
            fromAPIChatInputOptions(
              options.schema.chatInput,
              interaction.data.options,
            );
          if (subcommandName !== undefined) {
            if (subcommandGroupName !== undefined) {
              const handleInteraction = (handlers as unknown as App<{
                chatInput:
                  & AppSubcommandGroupsSchema<AppChatInputBasicOption>
                  & AppChatInputSchemaBase;
              }>)[subcommandGroupName][subcommandName];
              const response = await withErrorBehavior(
                Promise.resolve(handleInteraction(
                  {
                    ...interaction,
                    data: { ...interaction.data, parsedOptions },
                  } as AppChatInputInteractionOf<
                    & AppOptionsSchema<AppChatInputBasicOption>
                    & Omit<AppChatInputSchemaBase, "name">
                  >,
                )),
                errorBehavior,
              );
              return Response.json(response);
            }

            const handleInteraction = (handlers as unknown as App<{
              chatInput:
                & AppSubcommandsSchema<AppChatInputBasicOption>
                & AppChatInputSchemaBase;
            }>)[subcommandName];
            const response = await withErrorBehavior(
              Promise.resolve(handleInteraction(
                {
                  ...interaction,
                  data: { ...interaction.data, parsedOptions },
                } as AppChatInputInteractionOf<
                  & AppOptionsSchema<AppChatInputBasicOption>
                  & Omit<AppChatInputSchemaBase, "name">
                >,
              )),
              errorBehavior,
            );
            return Response.json(response);
          }

          const handleInteraction = handlers as unknown as App<{
            chatInput:
              & AppOptionsSchema<AppChatInputBasicOption>
              & AppChatInputSchemaBase;
          }>;
          const response = await withErrorBehavior(
            Promise.resolve(handleInteraction(
              {
                ...interaction,
                data: { ...interaction.data, parsedOptions },
              } as AppChatInputInteractionOf<
                & AppOptionsSchema<AppChatInputBasicOption>
                & Omit<AppChatInputSchemaBase, "name">
              >,
            )),
            errorBehavior,
          );
          return Response.json(response);
        }

        return new Response("Unsupported command type", { status: 400 });
      }

      default: {
        // TODO: case InteractionType.MessageComponent
        // https://discord.com/developers/docs/interactions/message-components#interaction-object-message-interaction-structure
        // TODO: case InteractionType.ApplicationCommandAutocomplete
        // https://discord.com/developers/docs/interactions/application-commands#autocomplete
        // TODO: case InteractionType.ModalSubmit
        // https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-modal-submit-data-structure
        return new Response("Unsupported interaction type", { status: 400 });
      }
    }
  };
}
