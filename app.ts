import type {
  APIApplicationCommand,
  APIApplicationCommandBasicOption,
  APIApplicationCommandInteractionWrapper,
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteractionData,
  APIInteractionResponse,
  APIMessageApplicationCommandInteractionData,
  APIUserApplicationCommandInteractionData,
  RESTPostAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "./deps.ts";

/**
 * BaseOptions is an option descriptor for a slash command's base options.
 */
type BaseOptions = Omit<APIApplicationCommandOption, "type" | "options">;

/**
 * ChatInputOption is an option descriptor for a slash command's options.
 */
// BaseAppSchema
type ChatInputOption = Omit<APIApplicationCommandBasicOption, "name">;

/**
 * OptionsCollection is an option descriptor for a slash command's options.
 */
export interface OptionsCollection<T> {
  options?: {
    [optionName in string]: T;
  };
}

/**
 * SubcommandsCollection is an option descriptor for a slash command's
 * subcommands.
 */
export interface SubcommandsCollection<T> {
  subcommands: {
    [subcommandName: string]: OptionsCollection<T> & Omit<BaseOptions, "name">;
  };
}

/**
 * GroupsCollection is an option descriptor for a slash command's
 * subcommand groups.
 */
export interface GroupsCollection<T> {
  groups: {
    [groupName: string]: SubcommandsCollection<T> & Omit<BaseOptions, "name">;
  };
}

/**
 * UserCommandOptions is a Discord Application Command descriptor for a slash
 * command that targets a user.
 */
interface UserCommandOptions {
  user: Omit<APIApplicationCommand, "type" | "options">;
}

/**
 * MessageCommandOptions is a Discord Application Command descriptor for a
 * slash command that targets a message.
 */
interface MessageCommandOptions {
  message: Omit<APIApplicationCommand, "type" | "options">;
}

/**
 * ChatInputCommandOptions is a Discord Application Command descriptor for a
 * slash command that targets a chat input.
 */
interface ChatInputCommandOptions {
  chatInput:
    & Omit<APIApplicationCommand, "type" | "options">
    & (
      | OptionsCollection<ChatInputOption>
      | SubcommandsCollection<ChatInputOption>
      | GroupsCollection<ChatInputOption>
    );
}

/**
 * AppSchema is the configuration of a Discord Application Command.
 */
type AppSchema =
  | UserCommandOptions
  | MessageCommandOptions
  | ChatInputCommandOptions;

/**
 * OptionTypeOf is a type that maps a Discord option type to the type of the
 * option's value.
 */
export type OptionTypeOf<
  T extends ApplicationCommandOptionType,
> = T extends
  | ApplicationCommandOptionType.String
  | ApplicationCommandOptionType.User
  | ApplicationCommandOptionType.Channel
  | ApplicationCommandOptionType.Role
  | ApplicationCommandOptionType.Mentionable
  | ApplicationCommandOptionType.Attachment ? string
  : T extends
    ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number
    ? number
  : T extends ApplicationCommandOptionType.Boolean ? boolean
  : never;

/**
 * OptionsMapOf maps a schema option type to a runtime option type.
 */
export type OptionsMapOf<T extends OptionsCollection<ChatInputOption>> =
  T extends Required<OptionsCollection<ChatInputOption>> ? {
      [optionName in keyof T["options"]]: OptionTypeOf<
        T["options"][optionName]["type"]
      >;
    }
    : undefined;

/**
 * Promisable is a utility type that represents a type and itself wrapped in a promise.
 */
type Promisable<T> = T | Promise<T>;

/**
 * App is a Discord Application Command interaction handler.
 */
export type App<TAppSchema extends AppSchema> = TAppSchema extends
  UserCommandOptions ? (
    interaction: APIApplicationCommandInteractionWrapper<
      APIUserApplicationCommandInteractionData & {
        type: ApplicationCommandType.User;
        name: TAppSchema["user"]["name"];
      }
    >,
  ) => Promisable<APIInteractionResponse>
  : TAppSchema extends MessageCommandOptions ? (
      interaction: APIApplicationCommandInteractionWrapper<
        APIMessageApplicationCommandInteractionData & {
          type: ApplicationCommandType.Message;
          name: TAppSchema["message"]["name"];
        }
      >,
    ) => Promisable<APIInteractionResponse>
  : TAppSchema extends (OptionsCollection<ChatInputOption> & BaseOptions) ? (
      interaction: APIApplicationCommandInteractionWrapper<
        APIChatInputApplicationCommandInteractionData & {
          type: ApplicationCommandType.ChatInput;
          name: TAppSchema["name"];
          options: OptionsMapOf<TAppSchema>;
        }
      >,
    ) => Promisable<APIInteractionResponse>
  : TAppSchema extends (SubcommandsCollection<ChatInputOption> & BaseOptions)
    ? {
      subcommands: {
        [subcommandName in keyof TAppSchema["subcommands"]]: (
          interaction: APIApplicationCommandInteractionWrapper<
            APIChatInputApplicationCommandInteractionData & {
              type: ApplicationCommandType.ChatInput;
              name: TAppSchema["name"];
              subcommandName: subcommandName;
              options: OptionsMapOf<TAppSchema["subcommands"][subcommandName]>;
            }
          >,
        ) => Promisable<APIInteractionResponse>;
      };
    }
  : TAppSchema extends (GroupsCollection<ChatInputOption> & BaseOptions) ? {
      groups: {
        [groupName in keyof TAppSchema["groups"]]: {
          [
            subcommandName
              in keyof TAppSchema["groups"][groupName]["subcommands"]
          ]: (
            interaction: APIApplicationCommandInteractionWrapper<
              APIChatInputApplicationCommandInteractionData & {
                name: TAppSchema["name"];
                groupName: groupName;
                subcommandName: subcommandName;
                options: OptionsMapOf<
                  TAppSchema["groups"][groupName]["subcommands"][subcommandName]
                >;
              }
            >,
          ) => Promisable<APIInteractionResponse>;
        };
      };
    }
  : never;

/**
 * fromSchema makes a deterministic REST API representation of a Discord
 * Application Command from an AppSchema.
 */
export function fromSchema(
  schema: AppSchema,
): RESTPostAPIApplicationCommandsJSONBody | undefined {
  if ("user" in schema) {
    const { ...options } = schema.user;
    return options;
  }

  return;
}

export function makeHandler<TAppSchema extends AppSchema>(
  _: TAppSchema,
  app: App<TAppSchema>,
): App<TAppSchema> {
  // Noop.
  return app;
}
