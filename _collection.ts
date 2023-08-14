import type {
  APIApplicationCommandBasicOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
} from "./deps.ts";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "./deps.ts";

const options: ChatInputAppOptions = {
  description: "Joe",
  options: {
    joe: {
      type: ApplicationCommandOptionType.String,
      description: "Joe",
    },
  },
  groups: {
    joe: {
      description: "Joe",
      subcommands: {
        joe: {
          description: "Joe",
          options: {
            joe: {
              type: ApplicationCommandOptionType.String,
              description: "Joe",
            },
          },
        },
      },
    },
  },
};

export type Key = string | number | symbol;

export type ChatInputAppOptions =
  & BaseChatInputAppOptions
  & (
    | {
      options: {
        [optionName in Key]: Omit<APIApplicationCommandBasicOption, "name">;
      };
    }
    | {
      subcommands: {
        [subcommandName in Key]:
          & Omit<
            APIApplicationCommandSubcommandOption,
            "name" | "options" | "type"
          >
          & ChatInputAppOptionsEnvelope;
      };
    }
    | {
      groups: {
        [groupName in Key]:
          & Omit<
            APIApplicationCommandSubcommandGroupOption,
            "name" | "options" | "type"
          >
          & ChatInputAppSubcommandsEnvelope;
      };
    }
  );

// export interface ChatInputAppOptions
//   extends BaseChatInputAppOptions, ChatInputAppOptionsEnvelope {}

export interface ChatInputAppOptionsEnvelope {
  options: {
    [optionName in Key]: Omit<APIApplicationCommandBasicOption, "name">;
  };
}

export interface ChatInputAppSubcommands
  extends BaseChatInputAppOptions, ChatInputAppSubcommandsEnvelope {}

export interface ChatInputAppSubcommandsEnvelope {
  subcommands: {
    [subcommandName in Key]:
      & Omit<APIApplicationCommandSubcommandOption, "name" | "options" | "type">
      & ChatInputAppOptionsEnvelope;
  };
}

export interface ChatInputAppGroups
  extends BaseChatInputAppOptions, ChatInputAppGroupsEnvelope {}

export interface ChatInputAppGroupsEnvelope {
  groups: {
    [groupName in Key]:
      & Omit<
        APIApplicationCommandSubcommandGroupOption,
        "name" | "options" | "type"
      >
      & ChatInputAppSubcommandsEnvelope;
  };
}

export interface BaseChatInputAppOptions {
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
