import { assertEquals } from "https://deno.land/std@0.207.0/assert/mod.ts";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type RESTPostAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import { toAPI } from "./app.ts";

// Example used:
// https://discord.com/developers/docs/interactions/application-commands#example-walkthrough
Deno.test("toAPI", () => {
  const actual = toAPI(
    {
      chatInput: {
        name: "permissions",
        description: "Get or edit permissions for a user or a role",
        groups: {
          user: {
            description: "Get or edit permissions for a user",
            subcommands: {
              get: {
                description: "Get permissions for a user",
                options: {
                  user: {
                    type: ApplicationCommandOptionType.User,
                    description: "The user to get",
                    required: true,
                  },
                  channel: {
                    type: ApplicationCommandOptionType.Channel,
                    description:
                      "The channel permissions to get. If omitted, the guild permissions will be returned",
                    required: false,
                  },
                },
              },
              edit: {
                description: "Edit permissions for a user",
                options: {
                  user: {
                    type: ApplicationCommandOptionType.User,
                    description: "The user to edit",
                    required: true,
                  },
                  channel: {
                    type: ApplicationCommandOptionType.Channel,
                    description:
                      "The channel permissions to edit. If omitted, the guild permissions will be edited",
                    required: false,
                  },
                },
              },
            },
          },
          role: {
            description: "Get or edit permissions for a role",
            subcommands: {
              get: {
                description: "Get permissions for a role",
                options: {
                  role: {
                    type: ApplicationCommandOptionType.Role,
                    description: "The role to get",
                    required: true,
                  },
                  channel: {
                    type: ApplicationCommandOptionType.Channel,
                    description:
                      "The channel permissions to get. If omitted, the guild permissions will be returned",
                    required: false,
                  },
                },
              },
              edit: {
                description: "Edit permissions for a role",
                options: {
                  role: {
                    type: ApplicationCommandOptionType.Role,
                    description: "The role to edit",
                    required: true,
                  },
                  channel: {
                    type: ApplicationCommandOptionType.Channel,
                    description:
                      "The channel permissions to edit. If omitted, the guild permissions will be edited",
                    required: false,
                  },
                },
              },
            },
          },
        },
      },
    },
  );
  const expected: RESTPostAPIApplicationCommandsJSONBody = {
    type: ApplicationCommandType.ChatInput,
    name: "permissions",
    description: "Get or edit permissions for a user or a role",
    options: [
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: "user",
        description: "Get or edit permissions for a user",
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "get",
            description: "Get permissions for a user",
            options: [
              {
                type: ApplicationCommandOptionType.User,
                name: "user",
                description: "The user to get",
                required: true,
              },
              {
                type: ApplicationCommandOptionType.Channel,
                name: "channel",
                description:
                  "The channel permissions to get. If omitted, the guild permissions will be returned",
                required: false,
              },
            ],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "edit",
            description: "Edit permissions for a user",
            options: [
              {
                type: ApplicationCommandOptionType.User,
                name: "user",
                description: "The user to edit",
                required: true,
              },
              {
                type: ApplicationCommandOptionType.Channel,
                name: "channel",
                description:
                  "The channel permissions to edit. If omitted, the guild permissions will be edited",
                required: false,
              },
            ],
          },
        ],
      },
      // TODO: Finish converting JSON syntax to formatted TypeScript.
      {
        "description": "Get or edit permissions for a role",
        "name": "role",
        "options": [
          {
            "description": "Get permissions for a role",
            "name": "get",
            "options": [
              {
                "description": "The role to get",
                "name": "role",
                "required": true,
                "type": 8,
              },
              {
                "description":
                  "The channel permissions to get. If omitted, the guild permissions will be returned",
                "name": "channel",
                "required": false,
                "type": 7,
              },
            ],
            "type": 1,
          },
          {
            "description": "Edit permissions for a role",
            "name": "edit",
            "options": [
              {
                "description": "The role to edit",
                "name": "role",
                "required": true,
                "type": 8,
              },
              {
                "description":
                  "The channel permissions to edit. If omitted, the guild permissions will be edited",
                "name": "channel",
                "required": false,
                "type": 7,
              },
            ],
            "type": 1,
          },
        ],
        "type": 2,
      },
    ],
  };

  assertEquals(actual, expected);
});
