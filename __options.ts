import type {
  APIApplicationCommandBasicOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
  APIInteraction,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseDeferredChannelMessageWithSource,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "./deps.ts";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "./deps.ts";

/**
 * CreateDiscordAppOptions are the options to create a new DiscordApp instance.
 */
export type CreateDiscordAppOptions =
  | ChatInputAppOptions<any, any, any>
  | UserAppOptions
  | MessageAppOptions;

/**
 * UserAppOptions are the options for a user command. There are no options.
 */
export interface UserAppOptions
  extends RESTPostAPIContextMenuApplicationCommandsJSONBody {
  type: ApplicationCommandType.User;
}

/**
 * MessageAppOptions are the options for a message command. There are no options.
 */
export interface MessageAppOptions
  extends RESTPostAPIContextMenuApplicationCommandsJSONBody {
  type: ApplicationCommandType.Message;
}

/**
 * ChatInputAppOptionsEnvelope is an option descriptor for a slash command's
 * options.
 */
export type ChatInputAppOptionsEnvelope = {
  [optionName: string]: Omit<APIApplicationCommandBasicOption, "name">;
};

/**
 * ChatInputAppSubcommandsEnvelope is an option descriptor for a slash command's
 * subcommands.
 */
export type ChatInputAppSubcommandsEnvelope<
  O extends ChatInputAppOptionsEnvelope,
> = {
  [subcommandName: string]:
    & Omit<
      APIApplicationCommandSubcommandOption,
      "name" | "options" | "type"
    >
    & O;
};

/**
 * ChatInputAppGroupsEnvelope is an option descriptor for a slash command's
 * subcommand groups.
 */
export type ChatInputAppGroupsEnvelope<
  O extends ChatInputAppOptionsEnvelope,
  S extends ChatInputAppSubcommandsEnvelope<O>,
> = {
  [groupName: string]:
    & Omit<
      APIApplicationCommandSubcommandGroupOption,
      "name" | "options" | "type"
    >
    & S;
};

/**
 * ChatInputAppOptions is an options bag for a slash command.
 */
export type ChatInputAppOptions<
  O extends ChatInputAppOptionsEnvelope,
  S extends ChatInputAppSubcommandsEnvelope<O>,
  G extends ChatInputAppGroupsEnvelope<O, S>,
> =
  & RESTPostAPIChatInputApplicationCommandsJSONBody
  & (O | S | G);
