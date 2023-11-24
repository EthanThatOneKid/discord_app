import type {
  APIApplicationCommandBasicOption,
  APIApplicationCommandInteractionWrapper,
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteractionData,
  APIInteractionResponse,
  APIMessageApplicationCommandInteractionData,
  APIUserApplicationCommandInteractionData,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "./deps.ts";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "./deps.ts";

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

export function makeHandler<TAppSchema extends AppSchema>(
  _: TAppSchema,
  app: App<TAppSchema>,
): App<TAppSchema> {
  // Noop.
  return app;
}

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
