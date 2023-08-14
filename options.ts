import type {
  APIApplicationCommandBasicOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
  APIInteractionResponse,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "./deps.ts";
import {
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "./deps.ts";

export type ChatInputAppOptions =
  & RESTPostAPIChatInputApplicationCommandsJSONBody
  & (
    | OptionsCollection
    | SubcommandsCollection
    | GroupsCollection
  );

/**
 * OptionsCollection is an option descriptor for a slash command's options.
 */
export interface OptionsCollection {
  options: {
    [optionName: string]: Omit<APIApplicationCommandBasicOption, "name">;
  };
}

/**
 * SubcommandsCollection is an option descriptor for a slash command's
 * subcommands.
 */
export interface SubcommandsCollection {
  subcommands: {
    [subcommandName: string]:
      & Omit<
        APIApplicationCommandSubcommandOption,
        "name" | "options" | "type"
      >
      & OptionsCollection
      & { action: any };
  };
}

/**
 * GroupsCollection is an option descriptor for a slash command's
 * subcommand groups.
 */
export interface GroupsCollection {
  groups: {
    [groupName: string]:
      & Omit<
        APIApplicationCommandSubcommandGroupOption,
        "name" | "options" | "type"
      >
      & SubcommandsCollection;
  };
}

const options: ChatInputAppOptions = {
  name: "permissions",
  description: "Get or edit permissions for a user or a role",
  groups: {
    user: {
      description: "Get or edit permissions for a user",
      subcommands: {
        get: {
          description: "Get permissions for a user",
          options: {
            username: {
              type: ApplicationCommandOptionType.User,
              description: "The user to get permissions for",
            },
          },
        },
      },
    },
  },
  //   options: {
  //     role: {
  //       type: ApplicationCommandOptionType.Role,
  //       description: "The role to get permissions for",
  //     },
  //   },
};

/**
 * OptionsOf returns the options of a slash command.
 */
// export type OptionsOf<
//   O extends (OptionsCollection | SubcommandsCollection | GroupsCollection),
// > = O extends OptionsCollection ? O["options"]
//   : O extends SubcommandsCollection
//     ? OptionsOf<O["subcommands"][keyof O["subcommands"]]>
//   : O extends GroupsCollection ? OptionsOf<O["groups"][keyof O["groups"]]>
//   : never;

// If the app is grouped subcommands, i need the options by group+subcommand so I can get the option types.
// If the app is subcommands, i need the options by subcommand so I can get the option types.
// If the app is options, i need the options so I can get the option types.

const _options: ChatInputAppOptions = {
  name: "permissions",
  description: "Get or edit permissions for a user or a role",
  groups: {
    user: {
      description: "Get or edit permissions for a user",
      subcommands: {
        get: {
          description: "Get permissions for a user",
          action: (
            options: OptionsOf<typeof _options, "get", "user">,
          ): APIInteractionResponse => {
            console.log(options[''
            return {
              type: InteractionResponseType.ChannelMessageWithSource,
              data: { content: "Hello world!" },
            };
          },
          options: {
            username: {
              type: ApplicationCommandOptionType.User,
              description: "The user to get permissions for",
            },
          },
        },
      },
    },
  },
  //   options: {
  //     role: {
  //       type: ApplicationCommandOptionType.Role,
  //       description: "The role to get permissions for",
  //     },
  //   },
} as const;

/**
 * OptionsOf returns the options of a slash command.
 */
export type OptionsOf<
  O extends (OptionsCollection | SubcommandsCollection | GroupsCollection),
  S extends (O extends SubcommandsCollection ? keyof O["subcommands"]
    : O extends GroupsCollection
      ? keyof O["groups"][keyof O["groups"]]["subcommands"]
    : never),
  G extends (O extends GroupsCollection ? keyof O["groups"] : never),
> = O extends OptionsCollection ? O
  : O extends SubcommandsCollection
    ? S extends keyof O["subcommands"] ? O["subcommands"][S]
    : never
  : O extends GroupsCollection
    ? G extends keyof O["groups"] ? O["groups"][G]["subcommands"][S]
    : never
  : never;

/**
 * OptionsMapOf is a type that maps a Discord option type to the type of the
 * option's value.
 */
export type OptionsMapOf<O extends OptionsCollection> = {
  [optionName in keyof O["options"]]: OptionTypeOf<
    O["options"][optionName]["type"]
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
