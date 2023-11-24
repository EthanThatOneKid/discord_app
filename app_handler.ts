import type {
  APIApplicationCommandOption,
  APIInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
  Utils,
} from "./deps.ts";
import type {
  App,
  AppChatInputBasicOption,
  AppChatInputCommandSchema,
  AppOptionsSchema,
  AppSchema,
  RuntimeTypeMapOf,
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
 * parseChatInputOptions parses the options of a chat input command.
 */
export function parseChatInputOptions<
  T extends AppOptionsSchema<AppChatInputBasicOption>,
>(
  schema: AppChatInputCommandSchema<AppChatInputBasicOption>,
  options: APIApplicationCommandOption[],
): {
  subcommandGroupName?: string;
  subcommandName?: string;
  parsedOptions: RuntimeTypeMapOf<T>;
} {
  if (schema.chatInput === undefined) {
    throw new Error("Invalid schema");
  }

  const parsedOptions = {} as RuntimeTypeMapOf<T>;
  let subcommandGroupName: string | undefined;
  let subcommandName: string | undefined;
  // TODO: Figure out abstractions to iterate over options.
  // TODO: parseChatInputSubcommandGroupOptions
  // TODO: parseChatInputSubcommandOptions
  // TODO: base case
  return { subcommandGroupName, subcommandName, parsedOptions };
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

// /**
//  * createApp creates a Discord application command handler.
//  */
// export async function createApp<TAppSchema extends AppSchema>(
//   options: AppHandlerOptions<TAppSchema>,
//   handlers: App<TAppSchema>,
// ): (r: Request) => Promise<Response> {
//   const app = toAPI(options.schema);
//   await registerApplicationCommand({
//     applicationID: options.applicationID,
//     token: options.token,
//     applicationCommand: app,
//   });
//   return async (request: Request): Promise<Response> => {
//     const { body, error } = await verify(request, options.publicKey);
//     if (error) {
//       return error;
//     }

//     const interaction = JSON.parse(body) as APIInteraction;
//     switch (interaction.type) {
//       case InteractionType.Ping: {
//         return Response.json({ type: InteractionResponseType.Pong });
//       }

//       case InteractionType.ApplicationCommand: {
//         if (interaction.data.type === ApplicationCommandType.Message) {
//           if (!("message" in options.schema)) {
//             return new Response("Invalid request", { status: 400 });
//           }

//           // TODO: Parse options.
//           const handleInteraction = handlers;
//           return await handleInteraction(interaction);
//         }

//         // TODO: Parse options.
//         const { subcommandGroupName, subcommandName, parsedOptions } =
//           parseChatInputOptions(options.schema, interaction.data.options);
//         return {};
//       }

//       default: {
//         // TODO: case InteractionType.MessageComponent
//         // TODO: case InteractionType.ApplicationCommandAutocomplete
//         // TODO: case InteractionType.ModalSubmit
//         return new Response("Unsupported interaction type", { status: 400 });
//       }
//     }
//   };
// }
