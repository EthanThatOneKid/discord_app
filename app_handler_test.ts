import { assertEquals } from "@std/assert";
import type {
  APIInteractionResponse,
  RESTPostAPIApplicationCommandsJSONBody,
} from "./discord_api_types.ts";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
} from "./discord_api_types.ts";
import { createApp, toAPI, withErrorBehavior } from "./app_handler.ts";
import { FakeDiscordAPI } from "./fake_discord_api.ts";
import { permissionsSchema } from "./examples/permissions.ts";

Deno.test("toAPI", () => {
  const actual = toAPI(permissionsSchema);
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

Deno.test("createApp handles valid interaction", async () => {
  const permissions = await createApp({
    schema: permissionsSchema,
    applicationID: "your_application_id",
    token: "your_bot_token",
    publicKey: "your_public_key",
    api: new FakeDiscordAPI(),
  }, {
    user: {
      get(interaction) {
        return {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: `Hello, <@${interaction.data.parsedOptions.user}>!`,
          },
        };
      },
      edit(_) {
        throw new Error("Not implemented");
      },
    },
    role: {
      get(_) {
        throw new Error("Not implemented");
      },
      edit(_) {
        throw new Error("Not implemented");
      },
    },
  });
  const requestJSON = {
    app_permissions: 311296,
    application_id: "your_application_id",
    channel: {
      default_thread_rate_limit_per_user: 0,
      flags: 0,
      guild_id: "your_guild_id",
      icon_emoji: null,
      id: "your_discord_channel_id",
      last_message_id: "1178796255749623972",
      last_pin_timestamp: "2023-09-27T03:18:20+00:00",
      name: "🦕to-do-ethan",
      nsfw: false,
      parent_id: "912816172616024176",
      permissions: "562949953421311",
      position: 8,
      rate_limit_per_user: 0,
      theme_color: null,
      topic: null,
      type: 0,
    },
    channel_id: "your_discord_channel_id",
    data: {
      id: "1178782909231005757",
      name: "permissions",
      options: [
        {
          name: "user",
          options: [
            {
              name: "get",
              options: [
                {
                  name: "user",
                  type: 6,
                  value: "your_discord_user_id",
                },
              ],
              type: 1,
            },
          ],
          type: 2,
        },
      ],
      resolved: {
        members: {
          your_discord_user_id: {
            avatar: "6a0c1f0e9899ff54357ab49bf1492972",
            communication_disabled_until: null,
            flags: 0,
            joined_at: "2022-10-07T20:09:47.088000+00:00",
            nick: "etok.codes",
            pending: false,
            permissions: "562949953421311",
            premium_since: null,
            roles: ["1006798385459757096"],
            unusual_dm_activity_until: null,
          },
        },
        users: {
          your_discord_user_id: {
            avatar: "35bc87750c2f4ab1886b6ed8a199654a",
            avatar_decoration_data: null,
            discriminator: "0",
            global_name: "EthanThatOneKid",
            id: "your_discord_user_id",
            public_flags: 4194432,
            username: "ethanthatonekid",
          },
        },
      },
      type: 1,
    },
    entitlement_sku_ids: [],
    entitlements: [],
    guild: {
      features: ["SOUNDBOARD"],
      id: "your_guild_id",
      locale: "en-US",
    },
    guild_id: "your_guild_id",
    guild_locale: "en-US",
    id: "your_interaction_id",
    locale: "en-US",
    member: {
      avatar: "6a0c1f0e9899ff54357ab49bf1492972",
      communication_disabled_until: null,
      deaf: false,
      flags: 0,
      joined_at: "2022-10-07T20:09:47.088000+00:00",
      mute: false,
      nick: "etok.codes",
      pending: false,
      permissions: "562949953421311",
      premium_since: null,
      roles: ["1006798385459757096"],
      unusual_dm_activity_until: null,
      user: {
        avatar: "35bc87750c2f4ab1886b6ed8a199654a",
        avatar_decoration_data: null,
        discriminator: "0",
        global_name: "EthanThatOneKid",
        id: "your_discord_user_id",
        public_flags: 4194432,
        username: "ethanthatonekid",
      },
    },
    token: "your_interaction_token",
    type: 2,
    version: 1,
  };
  const request = new Request(
    "https://example.com",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestJSON),
    },
  );
  const response = await permissions(request);
  const actual = await response.json() as APIInteractionResponse;
  const expected = {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: { content: "Hello, <@your_discord_user_id>!" },
  } as const satisfies APIInteractionResponse;
  assertEquals(actual, expected);
});
