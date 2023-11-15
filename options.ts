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
    | ChatInputAppOptionsWithOptionsHandler
    | ChatInputAppOptionsWithSubcommandsHandler
    | ChatInputAppOptionsWithGroupsHandler
  );

/**
 * OptionKey is the structure to identify an option.
 */
// export interface OptionKey<
//   G extends string | undefined = undefined|string,
//   S extends string | undefined = undefined|string,
//   O extends string = string,
// > {
//   /**
//    * group is the name of the group the option belongs to.
//    */
//   group?: G;

//   /**
//    * subcommand is the name of the subcommand the option belongs to.
//    */
//   subcommand?: S;

//   /**
//    * option is the name of the option.
//    */
//   option: O;
// }

/**
 * OptionsCollection is an option descriptor for a slash command's options.
 */
export interface OptionsCollection {
  options: {
    [optionName in string]: APIApplicationCommandBasicOption;
  };
}

/**
 * SubcommandsCollection is an option descriptor for a slash command's
 * subcommands.
 */
export interface SubcommandsCollection {
  subcommands: {
    [subcommandName: string]: OptionsCollection;
  };
}

/**
 * GroupsCollection is an option descriptor for a slash command's
 * subcommand groups.
 */
export interface GroupsCollection {
  groups: {
    [groupName: string]: SubcommandsCollection;
  };
}

export type HandlerMapOf<
  O extends OptionsCollection | SubcommandsCollection | GroupsCollection,
> = O extends OptionsCollection ? OptionsHandlerMap
  : O extends SubcommandsCollection ? SubcommandsHandlerMap
  : O extends GroupsCollection ? GroupsHandlerMap
  : never;

export type OptionsHandlerMap = (
  options: OptionsCollection["options"],
) => APIInteractionResponse;

export type SubcommandsHandlerMap = {
  [subcommandName in keyof SubcommandsCollection["subcommands"]]: (
    options: SubcommandsCollection["subcommands"][subcommandName]["options"],
  ) => APIInteractionResponse;
};

export type GroupsHandlerMap = {
  [groupName in keyof GroupsCollection["groups"]]: SubcommandsHandlerMap;
};

const options: ChatInputAppOptions = {
  name: "permissions",
  description: "Get or edit permissions for a user or a role",
  groups: {
    user: {
      description: "Get or edit permissions for a user",
      subcommands: {
        get: {
          handle: (options) => {
            return {
              type: InteractionResponseType.ChannelMessageWithSource,
              data: { content: "Hello world!" },
            };
          },
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
          // action: (
          //   options: OptionsOf<typeof _options, "get", "user">,
          // ): APIInteractionResponse => {
          //   // console.log(options['
          //   return {
          //     type: InteractionResponseType.ChannelMessageWithSource,
          //     data: { content: "Hello world!" },
          //   };
          // },
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
 * OptionsOfSubcommand returns the options of a slash command's subcommand.
 */
export type OptionsOfSubcommand<
  O extends SubcommandsCollection,
  S extends string,
> = O extends SubcommandsCollection
  ? S extends keyof O["subcommands"] ? O["subcommands"][S]
  : never
  : never;

/**
 * OptionsOfGroupedSubcommand returns the options of a slash command's grouped
 * subcommand.
 */
export type OptionsOfGroupedSubcommand<
  O extends GroupsCollection,
  S extends string,
  G extends string,
> = O extends GroupsCollection
  ? G extends keyof O["groups"] ? OptionsOfSubcommand<O["groups"][G], S>
  : never
  : never;

/**
 * OptionsOf returns the options of a slash command.
 */
// export type OptionsOf<
//   O extends (OptionsCollection | SubcommandsCollection | GroupsCollection),
//   S extends (O extends SubcommandsCollection ? keyof O["subcommands"]
//     : O extends GroupsCollection
//       ? keyof O["groups"][keyof O["groups"]]["subcommands"]
//     : never),
//   G extends (O extends GroupsCollection ? keyof O["groups"] : never),
// > = O extends OptionsCollection ? O
//   : O extends SubcommandsCollection
//     ? S extends keyof O["subcommands"] ? O["subcommands"][S]
//     : never
//   : O extends GroupsCollection
//     ? G extends keyof O["groups"] ? O["groups"][G]["subcommands"][S]
//     : never
//   : never;

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
