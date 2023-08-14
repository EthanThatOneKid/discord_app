import type {
  APIApplicationCommandBasicOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
  APIInteraction,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseDeferredChannelMessageWithSource,
  RESTPostAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "./deps.ts";

/**
 * createDiscordApp creates a new DiscordApp instance.
 */
export function createDiscordApp(options: DiscordAppOptions): DiscordApp {
}

/**
 * DiscordAppOptions are the options to create a new DiscordApp instance.
 */
export type DiscordAppOptions =
  & Omit<RESTPostAPIApplicationCommandsJSONBody, "options">
  & (
    | ChatInputAppOptions
    | UserAppOptions
    | MessageAppOptions
  );

/**
 * ChatInputAppOptions is an options bag for a slash command.
 */
export type ChatInputAppOptions =
  & {
    /**
     * type is the type of the slash command. In this case, it is always
     * ApplicationCommandType.ChatInput.
     */
    type?: ApplicationCommandType.ChatInput;

    /**
     * description is the description of the slash command.
     */
    description: string;
  }
  & (
    | ChatInputAppOptionsEnvelope
    | ChatInputAppSubcommandsEnvelope
    | ChatInputAppGroupsEnvelope
  );

/**
 * ChatInputAppOptionsEnvelope is an basic slash command options descriptor.
 */
export interface ChatInputAppOptionsEnvelope {
  options: {
    [optionName: string]: Omit<
      APIApplicationCommandBasicOption,
      "name"
    >;
  };
}

/**
 * DiscordAppHandler is a Discord application command interaction handler.
 */
export type DiscordAppHandler<
  A extends DiscordAppOptions,
  SubcommandName extends A extends
    ChatInputAppSubcommandsEnvelope | ChatInputAppGroupsEnvelope ? string
    : never,
  GroupName extends A extends ChatInputAppGroupsEnvelope ? string : never,
> = A extends ChatInputAppOptionsEnvelope ? (
    (
      interaction: InteractionOf<A>,
      options: OptionsMapOf<OptionsEnvelopeOf<A, SubcommandName, GroupName>>,
    ) => Promise<InteractionResult>
  )
  : (interaction: InteractionOf<A>) => Promise<InteractionResult>;

/**
 * InteractionOf is a type that populates the interaction type with the given
 * options.
 */
export type InteractionOf<
  A extends DiscordAppOptions,
> = APIInteraction & {
  type: A extends ChatInputAppOptions ? ApplicationCommandType.ChatInput
    : A extends UserAppOptions ? ApplicationCommandType.User
    : A extends MessageAppOptions ? ApplicationCommandType.Message
    : never;
};

/**
 * InteractionResult is the return type of an interaction handler.
 */
export type InteractionResult =
  | APIInteractionResponseChannelMessageWithSource
  | APIInteractionResponseDeferredChannelMessageWithSource
  | void;

/**
 * OptionsEnvelopeOf is a type that drills down to the options envelope of a
 * slash command, subcommand, or subcommand group.
 */
type OptionsEnvelopeOf<
  E extends
    | ChatInputAppOptionsEnvelope
    | ChatInputAppSubcommandsEnvelope
    | ChatInputAppGroupsEnvelope,
  SubcommandName extends E extends
    ChatInputAppSubcommandsEnvelope | ChatInputAppGroupsEnvelope ? string
    : never,
  GroupName extends E extends ChatInputAppGroupsEnvelope ? string : never,
> = E extends ChatInputAppOptionsEnvelope ? E
  : E extends ChatInputAppSubcommandsEnvelope
    ? SubcommandName extends keyof E["subcommands"]
      ? E["subcommands"][SubcommandName]
    : never
  : E extends ChatInputAppGroupsEnvelope
    ? GroupName extends keyof E["groups"]
      ? SubcommandName extends keyof E["groups"][GroupName]["subcommands"]
        ? E["groups"][GroupName]["subcommands"][SubcommandName]
      : never
    : never
  : never;

/**
 * OptionsMapOf is a type that maps a Discord option type to the type of the
 * option's value.
 */
export type OptionsMapOf<
  E extends ChatInputAppOptionsEnvelope,
> = {
  [optionName in keyof E["options"]]: OptionTypeOf<
    E["options"][optionName]["type"]
  >;
};

/**
 * OptionTypeOf is a type that maps a Discord option type to the type of the
 * option's value.
 */
export type OptionTypeOf<
  T extends ApplicationCommandOptionType,
> = T extends ApplicationCommandOptionType.String ? string
  : T extends ApplicationCommandOptionType.Integer ? number
  : T extends ApplicationCommandOptionType.Boolean ? boolean
  : T extends ApplicationCommandOptionType.User ? string
  : T extends ApplicationCommandOptionType.Channel ? string
  : T extends ApplicationCommandOptionType.Role ? string
  : T extends ApplicationCommandOptionType.Mentionable ? string
  : T extends ApplicationCommandOptionType.Number ? number
  : T extends ApplicationCommandOptionType.Attachment ? string
  : never;

// subcommands have options and groups have subcommands

/**
 * ChatInputAppSubcommandsEnvelope is an option descriptor for a slash command's
 * subcommands.
 */
export interface ChatInputAppSubcommandsEnvelope<
  SubcommandName extends string,
> {
  subcommands: {
    [subcommandName in keyof SubcommandName]:
      & Omit<
        APIApplicationCommandSubcommandOption,
        "name" | "options" | "type"
      >
      & ChatInputAppOptionsEnvelope
      & {
        handle: DiscordAppHandler<
          this,
          SubcommandName,
          never
        >;
      };
  };
}

/**
 * ChatInputAppGroupsEnvelope is an option descriptor for a slash command's
 * subcommand groups.
 */
export interface ChatInputAppGroupsEnvelope {
  groups: {
    [groupName: string]:
      & Omit<
        APIApplicationCommandSubcommandGroupOption,
        "name" | "options" | "type"
      >
      & ChatInputAppSubcommandsEnvelope;
  };
}

/**
 * UserAppOptions are the options for a user command. There are no options.
 */
export interface UserAppOptions {
  type: ApplicationCommandType.User;
}

/**
 * MessageAppOptions are the options for a message command. There are no
 * options.
 */
export interface MessageAppOptions {
  type: ApplicationCommandType.Message;
}

/**
 * DiscordApp is a Discord application command interaction handler and
 * information store.
 */
export interface DiscordApp {
  readonly data: RESTPostAPIApplicationCommandsJSONBody;
  readonly handle: (request: Request) => Promise<Response>;
}

// https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups
// https://discordnet.dev/guides/int_basics/application-commands/slash-commands/choice-slash-command.html
