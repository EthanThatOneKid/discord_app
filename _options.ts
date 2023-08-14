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

// Define a generic type for the options of a command.
interface CommandOptions<T> {
  action: (options: T) => Promise<void>;
  options: {
    [optionName: string]: Omit<APIApplicationCommandBasicOption, "name">;
  };
}

// Define a generic type for subcommands.
interface Subcommand<T> {
  [subcommandName: string]:
    & Omit<APIApplicationCommandSubcommandOption, "name" | "options" | "type">
    & T;
}

// Define a generic type for subcommand groups.
interface SubcommandGroup<T> {
  [groupName: string]:
    & Omit<
      APIApplicationCommandSubcommandGroupOption,
      "name" | "options" | "type"
    >
    & {
      subcommands: Subcommand<T>;
    };
}

// Define a generic type for different types of command options.
interface CommandOptionsWithType<T> {
  type: ApplicationCommandType;
  options: T;
}

// Define a generic type for different types of command options.
type DiscordAppOptions =
  | CommandOptionsWithType<UserAppOptions>
  | CommandOptionsWithType<MessageAppOptions>
  | CommandOptionsWithType<ChatInputAppOptions>;

// UserAppOptions are the options for a user command. There are no options.
interface UserAppOptions {
  type: ApplicationCommandType.User;
  // action: (interaction: InteractionOf<this>) => Promise<InteractionResult>;
}

// MessageAppOptions are the options for a message command. There are no options.
interface MessageAppOptions {
  type: ApplicationCommandType.Message;
  // action: (interaction: InteractionOf<this>) => Promise<InteractionResult>;
}

// Refactored MagicOptions type to use generics.
type MagicOptions<T> = T;

// ChatInputAppOptions is an options bag for a slash command.
interface ChatInputAppOptions<T> extends CommandOptions<T> {
  type: ApplicationCommandType.ChatInput;
}

// Subcommands and groups need to be of type Subcommand<T> and SubcommandGroup<T> respectively.

// Example usage:

const userOptions: UserAppOptions = {
  type: ApplicationCommandType.User,
};

const messageOptions: MessageAppOptions = {
  type: ApplicationCommandType.Message,
};

const chatInputOptions: ChatInputAppOptions<MagicOptions<number>> = {
  type: ApplicationCommandType.ChatInput,
  action: (options) => {
    // Use the options with the specified type.
  },
  options: {
    exampleOption: {
      type: ApplicationCommandOptionType.Integer,
      description: "An example option",
      required: true,
    },
  },
};

const subcommands: Subcommand<MagicOptions<string>> = {
  subcommandName: {
    type: ApplicationCommandOptionType.Subcommand,
    description: "An example subcommand",
    action: (options) => {
      // Use the options with the specified type.
    },
    options: {
      subOption: {
        type: ApplicationCommandOptionType.String,
        description: "An example sub-option",
        required: false,
      },
    },
  },
};

const subcommandGroups: SubcommandGroup<MagicOptions<boolean>> = {
  groupName: {
    type: ApplicationCommandOptionType.SubcommandGroup,
    description: "An example subcommand group",
    subcommands: subcommands,
  },
};

const appOptions: DiscordAppOptions = {
  type: ApplicationCommandType.ChatInput,
  options: chatInputOptions,
};

// Now you can use the appOptions object to register your slash commands.
