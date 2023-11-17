import {
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "./deps.ts";
import * as discord_app from "./components.ts";

// Example used:
// https://discord.com/developers/docs/interactions/application-commands#example-walkthrough

// TODO: Make
// https://deno.land/x/discord_api_types@0.37.52/v10.ts?s=RESTPostAPIApplicationCommandsJSONBody

export const permissionsHandler = discord_app.makeHandler({
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
}, {
  groups: {
    user: {
      get(interaction) {
        const user = interaction.data.options.user;
        return {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: `Getting permissions for user \`${user}\`!`,
          },
        };
      },
    },
  },
});
