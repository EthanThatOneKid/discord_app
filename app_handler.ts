import type {
  APIApplicationCommandOption,
  APIInteraction,
  APIInteractionResponse,
  RESTPostAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import {
  APIApplicationCommandInteractionDataOption,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
} from "./deps.ts";
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
  Promisable,
} from "./app.ts";
import { registerApplicationCommand } from "./api.ts";
import { verify } from "./verify.ts";

/**
 * toAPIOptions converts a schema's options to valid Discord Application Command
 * options.
 */
export function toAPIOptions(
  schema: AppChatInputCommandSchema<AppChatInputBasicOption>["chatInput"],
): APIApplicationCommandOption[] | undefined {
  if ("options" in schema) {
    if (schema.options === undefined) {
      return undefined;
    }

    return Object.entries(schema.options).map(([name, option]) => ({
      ...option,
      type: option.type as number,
      name,
    }));
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
    if (schema.options === undefined) {
      if (options !== undefined && options.length !== 0) {
        throw new Error("Invalid options");
      }

      return {};
    }

    const schemaOptionNames = Object.keys(schema.options);
    if (
      schema.options !== undefined &&
      options!.length !== schemaOptionNames.length
    ) {
      throw new Error("Invalid options");
    }
    if (schemaOptionNames.length === 0) {
      return {};
    }

    const parsedOptions: ParsedAppChatInputCommandOptions["parsedOptions"] = {};
    for (const option of options!) {
      const optionSchema = schema.options[option.name];
      if (optionSchema === undefined) {
        throw new Error("Invalid option");
      }

      if (optionSchema.type !== option.type) {
        throw new Error("Invalid option");
      }

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
 * AppHandlerOptions is the configuration of
 */
export interface AppHandlerOptions<T> {
  /**
   * schema is the schema of the application command.
   */
  schema: T;

  /**
   * path is the path to the application command handler endpoint.
   */
  path?: string;

  /**
   * invitePath is the path to the application command invite endpoint.
   */
  invitePath?: string;

  /**
   * token is the token of the application command.
   */
  token: string;

  /**
   * applicationID is the ID of the application that owns the application command.
   * The application ID is the same as the client ID.
   */
  applicationID: string;

  /**
   * clientSecret is the client secret of the application that owns the application
   * command.
   */
  //   clientSecret: string;

  /**
   * publicKey is the public key of the application command.
   */
  publicKey: string;
}

/**
 * createApp creates a registers a Discord application command and returns a
 * request handler that handles the command.
 */
export async function createApp<TAppSchema extends AppSchema>(
  options: AppHandlerOptions<TAppSchema>,
  handlers: App<TAppSchema>,
): Promise<(r: Request) => Promise<Response>> {
  const app = toAPI(options.schema);
  await registerApplicationCommand({
    applicationID: options.applicationID,
    token: options.token,
    applicationCommand: app,
  });
  return async function (request: Request): Promise<Response> {
    const { body, error } = await verify(request, options.publicKey);
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
            return new Response("Invalid request", { status: 400 });
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
            return new Response("Invalid request", { status: 400 });
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
            return new Response("Invalid request", { status: 400 });
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
              return Response.json(
                await handleInteraction(
                  {
                    ...interaction,
                    data: { ...interaction.data, parsedOptions },
                  } as AppChatInputInteractionOf<
                    & AppOptionsSchema<AppChatInputBasicOption>
                    & Omit<AppChatInputSchemaBase, "name">
                  >,
                ),
              );
            }

            const handleInteraction = (handlers as unknown as App<{
              chatInput:
                & AppSubcommandsSchema<AppChatInputBasicOption>
                & AppChatInputSchemaBase;
            }>)[subcommandName];
            return Response.json(
              await handleInteraction(
                {
                  ...interaction,
                  data: { ...interaction.data, parsedOptions },
                } as AppChatInputInteractionOf<
                  & AppOptionsSchema<AppChatInputBasicOption>
                  & Omit<AppChatInputSchemaBase, "name">
                >,
              ),
            );
          }

          const handleInteraction = handlers as unknown as App<{
            chatInput:
              & AppOptionsSchema<AppChatInputBasicOption>
              & AppChatInputSchemaBase;
          }>;
          return Response.json(
            await handleInteraction(
              {
                ...interaction,
                data: { ...interaction.data, parsedOptions },
              } as AppChatInputInteractionOf<
                & AppOptionsSchema<AppChatInputBasicOption>
                & Omit<AppChatInputSchemaBase, "name">
              >,
            ),
          );
        }

        return new Response("Unsupported command type", { status: 400 });
      }

      default: {
        // TODO: case InteractionType.MessageComponent
        // TODO: case InteractionType.ApplicationCommandAutocomplete
        // TODO: case InteractionType.ModalSubmit
        return new Response("Unsupported interaction type", { status: 400 });
      }
    }
  };
}
