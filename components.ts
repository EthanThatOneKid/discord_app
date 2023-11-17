import type {
  APIApplicationCommand,
  APIApplicationCommandBasicOption,
  APIApplicationCommandInteractionWrapper,
  APIApplicationCommandOption,
  APIApplicationCommandUserOption,
  APIChatInputApplicationCommandInteractionData,
  // APIChatInputApplicationCommandInteraction,
  APIInteractionResponse,
  // APIMessageApplicationCommandInteraction,
  APIMessageApplicationCommandInteractionData,
  APIMessageComponent,
  // APIUserApplicationCommandInteraction,
  APIUserApplicationCommandInteractionData,
} from "./deps.ts";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionType,
} from "./deps.ts";

/**
 * BaseOptions is an option descriptor for a slash command's base options.
 */
type BaseOptions = Omit<APIApplicationCommandOption, "type" | "options">;

/**
 * BasicOption is an option descriptor for a slash command's options.
 */
type BasicOption = Omit<APIApplicationCommandBasicOption, "name">;

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

interface UserCommandOptions extends Omit<APIApplicationCommand, "options"> {
  type: ApplicationCommandType.User;
}

interface MessageCommandOptions extends Omit<APIApplicationCommand, "options"> {
  type: ApplicationCommandType.Message;
}

export type AppSchema =
  | UserCommandOptions
  | MessageCommandOptions
  | (GroupsCollection<BasicOption> & BaseOptions)
  | (SubcommandsCollection<BasicOption> & BaseOptions)
  | (OptionsCollection<BasicOption> & BaseOptions);

// Type shit:
// https://deno.land/x/discord_api_types@0.37.52/v10.ts?s=APIMessageComponentInteraction
// type MessageComponentSchema = APIMessageComponent;

/**
 * Promisable is a utility type that represents a type and itself wrapped in a promise.
 */
type Promisable<T> = T | Promise<T>;

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
export type OptionsMapOf<T extends OptionsCollection<BasicOption>> = T extends
  Required<OptionsCollection<BasicOption>> ? {
    [optionName in keyof T["options"]]: OptionTypeOf<
      T["options"][optionName]["type"]
    >;
  }
  : undefined;

/**
 * App is the app interface based on the given app schema.
 */
export type App<TAppSchema extends AppSchema> = TAppSchema extends
  UserCommandOptions ? (
    interaction: APIApplicationCommandInteractionWrapper<
      APIUserApplicationCommandInteractionData & {
        name: TAppSchema["name"];
      }
    >,
  ) => Promisable<APIInteractionResponse>
  : TAppSchema extends MessageCommandOptions ? (
      interaction: APIApplicationCommandInteractionWrapper<
        APIMessageApplicationCommandInteractionData & {
          name: TAppSchema["name"];
        }
      >,
    ) => Promisable<APIInteractionResponse>
  : TAppSchema extends OptionsCollection<BasicOption> ? (
      interaction: APIApplicationCommandInteractionWrapper<
        APIChatInputApplicationCommandInteractionData & {
          name: TAppSchema["name"];
          options: OptionsMapOf<TAppSchema>;
        }
      >,
    ) => Promisable<APIInteractionResponse>
  : TAppSchema extends SubcommandsCollection<BasicOption> ? {
      subcommands: {
        [subcommandName in keyof TAppSchema["subcommands"]]: (
          interaction: APIApplicationCommandInteractionWrapper<
            APIChatInputApplicationCommandInteractionData & {
              name: TAppSchema["name"];
              subcommandName: subcommandName;
              options: OptionsMapOf<TAppSchema["subcommands"][subcommandName]>;
            }
          >,
        ) => Promisable<APIInteractionResponse>;
      };
    }
  : TAppSchema extends GroupsCollection<BasicOption> ? {
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

export function makeHandler<TAppSchema extends AppSchema>(
  _: TAppSchema,
  app: App<TAppSchema>,
): App<TAppSchema> {
  // Noop.
  return app;
}

// TODO: Handle message components, modal submits, and auto completion.
// https://deno.land/x/discord_api_types@0.37.52/v10.ts?s=APIInteraction

// Desired app.
// https://discord.com/developers/docs/interactions/receiving-and-responding
const app = {
  user: {
    type: ApplicationCommandOptionType.User,
    name: "Name of user command.",
    description: "Description of user command.",
  } satisfies APIApplicationCommandUserOption,
  groups: {
    group_name1: {
      subcommands: {
        subcommand_name1: {
          options: {
            option_name1: {
              name: "option_name1", //
              description: "Option name 1 example description text.",
              type: ApplicationCommandOptionType.String,
            } satisfies APIApplicationCommandBasicOption,
          },
        },
      },
    },
  },
};

// const app: DiscordApp<typeof schema> = [{
//   kind: "shit",
//   hello: {
//     options: {
//       option1: {
//         name: "option1",
//         description: "option1 example description",
//         type: ApplicationCommandOptionType.Integer,
//       },
//     },
//   },
// }];
