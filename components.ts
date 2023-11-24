import type {
  APIApplicationCommand,
  APIApplicationCommandBasicOption,
  APIApplicationCommandInteractionWrapper,
  APIApplicationCommandOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
  APIApplicationCommandUserOption,
  APIChatInputApplicationCommandInteractionData,
  // APIChatInputApplicationCommandInteraction,
  APIInteractionResponse,
  // APIMessageApplicationCommandInteraction,
  APIMessageApplicationCommandInteractionData,
  APIMessageComponent,
  // APIUserApplicationCommandInteraction,
  APIUserApplicationCommandInteractionData,
  RESTPostAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import {
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "./deps.ts";

// TODO: Rename all generic `T`s.

/**
 * AppUserCommandSchema is a Discord Application Command descriptor for a slash
 * command that targets a user.
 */
interface AppUserCommandSchema {
  user: APIApplicationCommandUserOption;
}

/**
 * AppMessageCommandSchema is a Discord Application Command descriptor for a
 * slash command that targets a message.
 */
interface AppMessageCommandSchema {
  message: APIApplicationCommandUserOption;
}

/**
 * AppOptionSchemaBase is an option descriptor for a slash command's options.
 */
export type AppOptionSchemaBase = APIApplicationCommandBasicOption;

/**
 * AppOptionsSchemaBase is the base configuration of a Discord application
 * command subcommand.
 */
export type AppOptionsSchemaBase = Omit<
  APIApplicationCommandOption,
  "type" | "options"
>;

/**
 * AppSubcommandsSchemaBase is the base configuration of a Discord application
 * command's subcommands.
 */
export type AppSubcommandsSchemaBase = Omit<
  APIApplicationCommandSubcommandOption,
  "type" | "options"
>;

/**
 * AppSubcommandGroupsSchemaBase is the base configuration of a Discord application
 * command's subcommand groups.
 */
export type AppSubcommandGroupsSchemaBase = Omit<
  APIApplicationCommandSubcommandGroupOption,
  "type" | "options"
>;

/**
 * AppOptionsSchema is an option descriptor for a chat input command's options.
 */
export interface AppOptionsSchema<T> {
  // TODO: Infer choices.
  options?: {
    [optionName in string]: T;
  };
}

/**
 * AppSubcommandsSchema is an option descriptor for a slash command's
 * subcommands.
 */
export interface AppSubcommandsSchema<T> {
  subcommands: {
    [subcommandName: string]:
      & AppOptionsSchema<T>
      & Omit<AppSubcommandsSchemaBase, "name">;
  };
}

/**
 * SubcommandGroupsCollection is an option descriptor for a slash command's
 * subcommand groups.
 */
export interface AppSubcommandGroupsSchema<T> {
  groups: {
    [groupName: string]:
      & AppSubcommandsSchema<T>
      & Omit<AppSubcommandGroupsSchemaBase, "name">;
  };
}

/**
 * AppChatInputCommandSchema is a Discord Application Command descriptor for a
 * slash command that targets a chat input.
 */
export interface AppChatInputCommandSchema<T> {
  chatInput:
    | (AppOptionsSchema<T> & AppOptionsSchemaBase)
    | (AppSubcommandsSchema<T> & AppSubcommandsSchemaBase)
    | (AppSubcommandGroupsSchema<T> & AppSubcommandGroupsSchemaBase);
}

/**
 * AppChatInputBasicOption is a Discord Application Command descriptor for a
 * slash command option that targets a chat input.
 */
export type AppChatInputBasicOption = Omit<
  APIApplicationCommandBasicOption,
  "name"
>;

/**
 * AppSchema is the configuration of a Discord Application Command.
 */
type AppSchema =
  | AppUserCommandSchema
  | AppMessageCommandSchema
  | AppChatInputCommandSchema<AppChatInputBasicOption>;

// Future types:
// https://deno.land/x/discord_api_types@0.37.52/v10.ts?s=APIMessageComponentInteraction
// type MessageComponentSchema = APIMessageComponent;

/**
 * Promisable is a utility type that represents a type and itself wrapped in a promise.
 */
type Promisable<T> = T | Promise<T>;

/**
 * RuntimeTypeOf is a utility type that maps a schema option type to a runtime
 * option type.
 */
export type RuntimeTypeOf<
  T extends AppChatInputBasicOption,
> = T extends {
  type:
    | ApplicationCommandOptionType.String
    | ApplicationCommandOptionType.User
    | ApplicationCommandOptionType.Channel
    | ApplicationCommandOptionType.Role
    | ApplicationCommandOptionType.Mentionable
    | ApplicationCommandOptionType.Attachment;
} ? T extends { required: true } ? string : string | undefined
  : T extends {
    type:
      | ApplicationCommandOptionType.Integer
      | ApplicationCommandOptionType.Number;
  } ? T extends { required: true } ? number : number | undefined
  : T extends { type: ApplicationCommandOptionType.Boolean }
    ? T extends { required: true } ? boolean : boolean | undefined
  : never;

/**
 * RuntimeTypeMapOf maps a schema option type to a runtime option type.
 */
export type RuntimeTypeMapOf<
  T extends AppOptionsSchema<AppChatInputBasicOption>,
> = T extends
  Pick<Required<AppOptionsSchema<AppChatInputBasicOption>>, "options"> ? {
    [optionName in keyof T["options"]]: RuntimeTypeOf<T["options"][optionName]>;
  }
  : undefined;

/**
 * AppChatInputInteractionOf is a utility type that infers the type of an interaction's
 * data based on the interaction's schema.
 */
export type AppChatInputInteractionOf<
  T extends AppOptionsSchema<AppChatInputBasicOption>,
> = APIApplicationCommandInteractionWrapper<
  APIChatInputApplicationCommandInteractionData & {
    parsedOptions: RuntimeTypeMapOf<T>;
  }
>;

// Be more specific with the options.

/**
 * App is a Discord Application Command interaction handler.
 */
export type App<TAppSchema extends AppSchema> = TAppSchema extends
  AppChatInputCommandSchema<AppChatInputBasicOption>
  ? (TAppSchema["chatInput"] extends (
    & AppSubcommandGroupsSchema<AppChatInputBasicOption>
    & AppSubcommandGroupsSchemaBase
  ) ? {
      [groupName in keyof TAppSchema["chatInput"]["groups"]]: {
        [
          subcommandName in keyof TAppSchema["chatInput"]["groups"][groupName][
            "subcommands"
          ]
        ]: (
          interaction: AppChatInputInteractionOf<
            TAppSchema["chatInput"]["groups"][groupName][
              "subcommands"
            ][
              subcommandName
            ]
          >,
        ) => Promisable<APIInteractionResponse>;
      };
    }
    : TAppSchema["chatInput"] extends (
      & AppSubcommandsSchema<AppChatInputBasicOption>
      & AppSubcommandsSchemaBase
    ) ? {
        [subcommandName in keyof TAppSchema["chatInput"]["subcommands"]]: (
          interaction: AppChatInputInteractionOf<
            TAppSchema["chatInput"]["subcommands"][subcommandName]
          >,
        ) => Promisable<APIInteractionResponse>;
      }
    : TAppSchema["chatInput"] extends (
      & AppOptionsSchema<AppChatInputBasicOption>
      & AppOptionsSchemaBase
    ) ? (
        interaction: AppChatInputInteractionOf<TAppSchema["chatInput"]>,
      ) => Promisable<APIInteractionResponse>
    : never)
  : TAppSchema extends AppUserCommandSchema ? (
      interaction: APIApplicationCommandInteractionWrapper<
        APIUserApplicationCommandInteractionData & {
          name: TAppSchema["user"]["name"];
        }
      >,
    ) => Promisable<APIInteractionResponse>
  : TAppSchema extends AppMessageCommandSchema ? (
      interaction: APIApplicationCommandInteractionWrapper<
        APIMessageApplicationCommandInteractionData & {
          name: TAppSchema["message"]["name"];
        }
      >,
    ) => Promisable<APIInteractionResponse>
  : never;

export function makeHandler<TAppSchema extends AppSchema>(
  _: TAppSchema,
  app: App<TAppSchema>,
): App<TAppSchema> {
  // Noop.
  return app;
}

// Example used:
// https://discord.com/developers/docs/interactions/application-commands#example-walkthrough
function permissionsApp() {
  return makeHandler(
    {
      chatInput: {
        name: "permissions",
        description: "Get or edit permissions for a user or a role",
        // options: {}
        // subcommands: {},
        groups: {
          user: {
            description: "Get or edit permissions for a user",
            subcommands: {
              get: {
                description: "Get permissions for a user",
                options: {
                  user: {
                    type: ApplicationCommandOptionType.User,
                    description: "The user to get",
                    required: true,
                  },
                  channel: {
                    type: ApplicationCommandOptionType.Channel,
                    description:
                      "The channel permissions to get. If omitted, the guild permissions will be returned",
                    required: false,
                  },
                },
              },
              edit: {
                description: "Edit permissions for a user",
                options: {
                  user: {
                    type: ApplicationCommandOptionType.User,
                    description: "The user to edit",
                    required: true,
                  },
                  channel: {
                    type: ApplicationCommandOptionType.Channel,
                    description:
                      "The channel permissions to edit. If omitted, the guild permissions will be edited",
                    required: false,
                  },
                },
              },
            },
          },
          role: {
            description: "Get or edit permissions for a role",
            subcommands: {
              get: {
                description: "Get permissions for a role",
                options: {
                  role: {
                    type: ApplicationCommandOptionType.Role,
                    description: "The role to get",
                    required: true,
                  },
                  channel: {
                    type: ApplicationCommandOptionType.Channel,
                    description:
                      "The channel permissions to get. If omitted, the guild permissions will be returned",
                    required: false,
                  },
                },
              },
              edit: {
                description: "Edit permissions for a role",
                options: {
                  role: {
                    type: ApplicationCommandOptionType.Role,
                    description: "The role to edit",
                    required: true,
                  },
                  channel: {
                    type: ApplicationCommandOptionType.Channel,
                    description:
                      "The channel permissions to edit. If omitted, the guild permissions will be edited",
                    required: false,
                  },
                },
              },
            },
          },
        },
      },
    } as const satisfies AppChatInputCommandSchema<
      AppChatInputBasicOption
    >,
    {
      user: {
        get(interaction) {
          const userID = interaction.data.parsedOptions.user;
          return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: `Hello, <@${userID}>!`,
            },
          };
        },
        edit(interaction) {
          const userID = interaction.data.parsedOptions.user;
          return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: `Hello, <@${userID}>!`,
            },
          };
        },
      },
      role: {
        get(interaction) {
          const roleID = interaction.data.parsedOptions.role;
          return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: `Hello, <@&${roleID}>!`,
            },
          };
        },
        edit(interaction) {
          const roleID = interaction.data.parsedOptions.role;
          return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: `Hello, <@&${roleID}>!`,
            },
          };
        },
      },
    },
  );
}
