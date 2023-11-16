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

type BaseOptions = Omit<APIApplicationCommandOption, "type" | "options">;

type BasicOption = Omit<APIApplicationCommandBasicOption, "name">;

/**
 * OptionsCollection is an option descriptor for a slash command's options.
 */
export interface OptionsCollection<T> {
  options: {
    [optionName in string]: T;
  };
}

/**
 * SubcommandsCollection is an option descriptor for a slash command's
 * subcommands.
 */
export interface SubcommandsCollection<T> {
  subcommands: {
    [subcommandName: string]: OptionsCollection<T>;
  };
}

/**
 * GroupsCollection is an option descriptor for a slash command's
 * subcommand groups.
 */
export interface GroupsCollection<T> {
  groups: {
    [groupName: string]: SubcommandsCollection<T>;
  };
}

/**
 * FieldTypeMap is a map of schema field types to TypeScript types.
 */
// export interface FieldTypeMap {
//   //   string: string;
//   //   number: number;
//   //   boolean: boolean;
//   //   "string[]": string[];
//   //   "number[]": number[];
//   //   "boolean[]": boolean[];
//   groups: GroupsCollection;
//   subcommands: SubcommandsCollection;
//   options: OptionsCollection;
//   user: unknown;
//   message: unknown;
// }

/**
 * FieldTypeOf converts a schema field type to a TypeScript type.
 */
// export type FieldTypeOf<TSchemaFieldType extends keyof FieldTypeMap> =
//   FieldTypeMap[TSchemaFieldType];

/**
 * SchemaComponent is a component from a schema.
 */
// export type SchemaComponent = Record<string, keyof FieldTypeMap>;

/**
 * Schema is a collection of components.
 */
// export type Schema = Record<string, SchemaComponent>;

/**
 * Component is a component from a schema by kind.
 */
// export type Component<
//   TSchema extends Schema,
//   TKind extends keyof TSchema,
// > =
//   & { kind: TKind }
//   & {
//     [TFieldName in keyof TSchema[TKind]]: FieldTypeOf<
//       TSchema[TKind][TFieldName]
//     >;
//   };

/**
 * ComponentsOf is a list of components from a schema.
 */
// export type ComponentsOf<TSchema extends Schema> = Array<ComponentOf<TSchema>>;

/**
 * ComponentOf is a component from a schema.
 */
// export type ComponentOf<TSchema extends Schema> = {
//   [TKind in keyof TSchema]: Component<TSchema, TKind>;
// }[keyof TSchema];

/**
 * DiscordApp is a Discord application command.
 */
// export type DiscordApp<TSchema extends Schema> = ComponentsOf<TSchema>;

// const schema = {
//   shit: {
//     hello: "options",
//   },
// } as const satisfies Schema;

interface UserCommandOptions extends Omit<APIApplicationCommand, "options"> {
  type: ApplicationCommandType.User;
}

interface MessageCommandOptions extends Omit<APIApplicationCommand, "options"> {
  type: ApplicationCommandType.Message;
}

// Type shit:
// https://deno.land/x/discord_api_types@0.37.52/v10.ts?s=APIApplicationCommandInteraction
type AppSchema =
  | UserCommandOptions
  | MessageCommandOptions
  | (GroupsCollection<BasicOption> & BaseOptions)
  | (SubcommandsCollection<BasicOption> & BaseOptions)
  | (OptionsCollection<BasicOption> & BaseOptions);

// Type shit:
// https://deno.land/x/discord_api_types@0.37.52/v10.ts?s=APIMessageComponentInteraction
type MessageComponentSchema = APIMessageComponent;

/**
 * Promisable is a utility type that represents a type and itself wrapped in a promise.
 */
type Promisable<T> = T | Promise<T>;

type App<TAppSchema extends AppSchema> = TAppSchema extends UserCommandOptions
  ? {
    interact(
      interaction: APIApplicationCommandInteractionWrapper<
        APIUserApplicationCommandInteractionData & {
          name: TAppSchema["name"];
        }
      >,
    ): Promisable<APIInteractionResponse>;
  }
  : TAppSchema extends MessageCommandOptions ? {
      interact(
        interaction: APIApplicationCommandInteractionWrapper<
          APIMessageApplicationCommandInteractionData & {
            name: TAppSchema["name"];
          }
        >,
      ): Promisable<APIInteractionResponse>;
    }
  : TAppSchema extends OptionsCollection<BasicOption> ? {
      interact(
        interaction: APIApplicationCommandInteractionWrapper<
          APIChatInputApplicationCommandInteractionData & {
            name: TAppSchema["name"];
            options: TAppSchema["options"];
          }
        >,
      ): Promisable<APIInteractionResponse>;
    }
  // TODO: Create nested interact methods for subcommands and groups.
  // : TAppSchema extends
  : never;

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
