import type {
  APIApplicationCommandBasicOption,
  APIApplicationCommandInteractionWrapper,
  APIChatInputApplicationCommandInteractionData,
  APIInteractionResponse,
  APIMessageApplicationCommandInteractionData,
  APIUserApplicationCommandInteractionData,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "./discord_api_types.ts";
import { ApplicationCommandOptionType } from "./discord_api_types.ts";
import type { Promisable } from "./promisable.ts";

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
export interface AppOptionsSchema<TBasicOption> {
  // TODO: Support type-safe choices.
  options?: {
    [optionName in string]: TBasicOption;
  };
}

/**
 * AppSubcommandsSchema is an option descriptor for a slash command's
 * subcommands.
 */
export interface AppSubcommandsSchema<TBasicOption> {
  subcommands: {
    [subcommandName: string]:
      & AppOptionsSchema<TBasicOption>
      & Omit<AppChatInputSchemaBase, "name">;
  };
}

/**
 * SubcommandGroupsCollection is an option descriptor for a slash command's
 * subcommand groups.
 */
export interface AppSubcommandGroupsSchema<TBasicOption> {
  groups: {
    [groupName: string]:
      & AppSubcommandsSchema<TBasicOption>
      & Omit<AppChatInputSchemaBase, "name">;
  };
}

/**
 * AppChatInputCommandSchema is a Discord Application Command descriptor for a
 * slash command that targets a chat input.
 */
export interface AppChatInputCommandSchema<TBasicOption> {
  chatInput:
    | (AppOptionsSchema<TBasicOption> & AppChatInputSchemaBase)
    | (AppSubcommandsSchema<TBasicOption> & AppChatInputSchemaBase)
    | (AppSubcommandGroupsSchema<TBasicOption> & AppChatInputSchemaBase);
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
 * RuntimeTypeOf is a utility type that maps a schema option type to a runtime
 * option type.
 */
export type RuntimeTypeOf<
  TBasicOption extends AppChatInputBasicOption,
> = TBasicOption extends {
  type:
    | ApplicationCommandOptionType.String
    | ApplicationCommandOptionType.User
    | ApplicationCommandOptionType.Channel
    | ApplicationCommandOptionType.Role
    | ApplicationCommandOptionType.Mentionable
    | ApplicationCommandOptionType.Attachment;
} ? TBasicOption extends { required: true } ? string : string | undefined
  : TBasicOption extends {
    type:
      | ApplicationCommandOptionType.Integer
      | ApplicationCommandOptionType.Number;
  } ? TBasicOption extends { required: true } ? number : number | undefined
  : TBasicOption extends { type: ApplicationCommandOptionType.Boolean }
    ? TBasicOption extends { required: true } ? boolean : boolean | undefined
  : never;

/**
 * RuntimeTypeMapOf maps a schema option type to a runtime option type.
 */
export type RuntimeTypeMapOf<
  TAppOptionsSchema extends AppOptionsSchema<AppChatInputBasicOption>,
> = TAppOptionsSchema extends
  Pick<Required<AppOptionsSchema<AppChatInputBasicOption>>, "options"> ? {
    [optionName in keyof TAppOptionsSchema["options"]]: RuntimeTypeOf<
      TAppOptionsSchema["options"][optionName]
    >;
  }
  : undefined;

/**
 * AppMessageInteractionOf is a utility type that infers the type of an
 * interaction's data based on the interaction's schema.
 */
export type AppMessageInteraction = APIApplicationCommandInteractionWrapper<
  APIMessageApplicationCommandInteractionData
>;

/**
 * AppUserInteractionOf is a utility type that infers the type of an
 * interaction's data based on the interaction's schema.
 */
export type AppUserInteraction = APIApplicationCommandInteractionWrapper<
  APIUserApplicationCommandInteractionData
>;

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
  : TAppSchema extends AppMessageCommandSchema ? (
      interaction: AppMessageInteraction,
    ) => Promisable<APIInteractionResponse>
  : TAppSchema extends AppUserCommandSchema ? (
      interaction: AppUserInteraction,
    ) => Promisable<APIInteractionResponse>
  : never;
