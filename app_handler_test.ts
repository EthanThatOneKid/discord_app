import { assertEquals } from "./developer_deps.ts";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type RESTPostAPIApplicationCommandsJSONBody,
} from "./deps.ts";
import { toAPI, withErrorBehavior } from "./app_handler.ts";

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
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: "role",
        description: "Get or edit permissions for a role",
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "get",
            description: "Get permissions for a role",
            options: [
              {
                type: ApplicationCommandOptionType.Role,
                name: "role",
                description: "The role to get",
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
            description: "Edit permissions for a role",
            options: [
              {
                type: ApplicationCommandOptionType.Role,
                name: "role",
                description: "The role to edit",
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
    ],
  };

  assertEquals(actual, expected);
});

Deno.test("withErrorBehavior", async () => {
  const actual = await withErrorBehavior<Response>(
    Promise.reject(new Error("test")),
    {
      send(error: Error) {
        return new Response(error.message, { status: 500 });
      },
    },
  );

  assertEquals(actual instanceof Response, true);
  assertEquals(actual.status, 500);
  assertEquals(await actual.text(), "test");
});
