import {
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "./deps.ts";
import * as discord_app from "./components.ts";

// Example used:
// https://discord.com/developers/docs/interactions/application-commands#example-walkthrough

const permissionsAppSchema = {
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
              description: "The user to get",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            channel: {
              description:
                "The channel permissions to get. If omitted, the guild permissions will be returned",
              type: ApplicationCommandOptionType.Channel,
              required: false,
            },
          },
        },
      },
    },
  },
} as const satisfies discord_app.AppSchema;

const permissionsApp: discord_app.App<typeof permissionsAppSchema> = {
  user: {
    get: {
      interact(interaction) {
        const user = interaction.data.options.user;
        return {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: `Hello, @${interaction.user?.username}!`,
          },
        };
      },
    },
  },
};
