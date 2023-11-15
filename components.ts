import type { APIApplicationCommandBasicOption } from "./deps.ts";
import { ApplicationCommandOptionType } from "./deps.ts";

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

/**
 * FieldTypeMap is a map of schema field types to TypeScript types.
 */
export interface FieldTypeMap {
  //   string: string;
  //   number: number;
  //   boolean: boolean;
  //   "string[]": string[];
  //   "number[]": number[];
  //   "boolean[]": boolean[];
  groups: GroupsCollection;
  subcommands: SubcommandsCollection;
  options: OptionsCollection;
  user: unknown;
  message: unknown;
}

/**
 * FieldTypeOf converts a schema field type to a TypeScript type.
 */
export type FieldTypeOf<TSchemaFieldType extends keyof FieldTypeMap> =
  FieldTypeMap[TSchemaFieldType];

/**
 * SchemaComponent is a component from a schema.
 */
export type SchemaComponent = Record<string, keyof FieldTypeMap>;

/**
 * Schema is a collection of components.
 */
export type Schema = Record<string, SchemaComponent>;

/**
 * Component is a component from a schema by kind.
 */
export type Component<
  TSchema extends Schema,
  TKind extends keyof TSchema,
> =
  & { kind: TKind }
  & {
    [TFieldName in keyof TSchema[TKind]]: FieldTypeOf<
      TSchema[TKind][TFieldName]
    >;
  };

/**
 * ComponentsOf is a list of components from a schema.
 */
export type ComponentsOf<TSchema extends Schema> = Array<ComponentOf<TSchema>>;

/**
 * ComponentOf is a component from a schema.
 */
export type ComponentOf<TSchema extends Schema> = {
  [TKind in keyof TSchema]: Component<TSchema, TKind>;
}[keyof TSchema];

/**
 * DiscordApp is a Discord application command.
 */
export type DiscordApp<TSchema extends Schema> = ComponentsOf<TSchema>;

const schema = {
  shit: {
    hello: "options",
  },
} as const satisfies Schema;

const app: DiscordApp<typeof schema> = [{
  kind: "shit",
  hello: {
    options: {
      option1: {
        name: "option1",
        description: "option1 example description",
        type: ApplicationCommandOptionType.Integer,
      },
    },
  },
}];
