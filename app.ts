import type {
  APIApplicationCommandBasicOption,
  APIApplicationCommandInteractionWrapper,
  APIChatInputApplicationCommandInteractionData,
  APIInteractionResponse,
  APIMessageApplicationCommandInteractionData,
  APIUserApplicationCommandInteractionData,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "./deps.ts";
import { ApplicationCommandOptionType } from "./deps.ts";

// TODO: Rename all generic `T`s.

/**
 * AppUserCommandSchema is a Discord Application Command descriptor for a slash
 * command that targets a user.
 */
interface AppUserCommandSchema {
  /**
   * user is the configuration of a Discord Application Command that targets a
   * user.
   */
  user: Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, "type">;
}

/**
 * AppMessageCommandSchema is a Discord Application Command descriptor for a
 * slash command that targets a message.
 */
interface AppMessageCommandSchema {
  /**
   * message is the configuration of a Discord Application Command that targets
   * a message.
   */
  message: Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, "type">;
}

/**
 * AppOptionSchemaBase is an option descriptor for a slash command's options.
 */
export type AppOptionSchemaBase = APIApplicationCommandBasicOption;

/**
 * AppChatInputSchemaBase is the base configuration of a Discord application
 * command that targets a chat input.
 */
export type AppChatInputSchemaBase = Omit<
  RESTPostAPIChatInputApplicationCommandsJSONBody,
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
      & Omit<AppChatInputSchemaBase, "name">;
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
      & Omit<AppChatInputSchemaBase, "name">;
  };
}

/**
 * AppChatInputCommandSchema is a Discord Application Command descriptor for a
 * slash command that targets a chat input.
 */
export interface AppChatInputCommandSchema<T> {
  chatInput:
    | (AppOptionsSchema<T> & AppChatInputSchemaBase)
    | (AppSubcommandsSchema<T> & AppChatInputSchemaBase)
    | (AppSubcommandGroupsSchema<T> & AppChatInputSchemaBase);
}

/**
 * ParsedAppChatInputCommandOptions is a utility type that represents the
 * parsed options of a chat input command.
 */
export interface ParsedAppChatInputCommandOptions {
  subcommandGroupName?: string;
  subcommandName?: string;
  parsedOptions?: Record<string, string | number | boolean>;
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
export type AppSchema =
  | AppUserCommandSchema
  | AppMessageCommandSchema
  | AppChatInputCommandSchema<AppChatInputBasicOption>;

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

/**
 * App is a Discord Application Command interaction handler.
 */
export type App<TAppSchema extends AppSchema> = TAppSchema extends
  AppChatInputCommandSchema<AppChatInputBasicOption>
  ? (TAppSchema["chatInput"] extends (
    & AppSubcommandGroupsSchema<AppChatInputBasicOption>
    & AppChatInputSchemaBase
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
      & AppChatInputSchemaBase
    ) ? {
        [subcommandName in keyof TAppSchema["chatInput"]["subcommands"]]: (
          interaction: AppChatInputInteractionOf<
            TAppSchema["chatInput"]["subcommands"][subcommandName]
          >,
        ) => Promisable<APIInteractionResponse>;
      }
    : TAppSchema["chatInput"] extends (
      & AppOptionsSchema<AppChatInputBasicOption>
      & AppChatInputSchemaBase
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
