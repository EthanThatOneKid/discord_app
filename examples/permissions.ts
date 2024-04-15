import type { AppSchema } from "app/mod.ts";
import {
  ApplicationCommandOptionType,
  createApp,
  InteractionResponseType,
} from "app/mod.ts";

/**
 * permissions is a `discord_app` schema modeled after the example in the
 * official Discord API reference documentation.
 *
 * @see
 * https://discord.com/developers/docs/interactions/application-commands#example-walkthrough
 */
export const permissions = {
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
} as const satisfies AppSchema;

if (import.meta.main) {
  // Create the Discord application.
  const handleInteraction = await createApp(
    {
      schema: permissions,
      applicationID: Deno.env.get("DISCORD_APPLICATION_ID")!,
      publicKey: Deno.env.get("DISCORD_PUBLIC_KEY")!,
      register: { token: Deno.env.get("DISCORD_TOKEN")! },
      invite: { path: "/invite", scopes: ["applications.commands"] },
    },
    {
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
    },
  );

  // Start the server.
  Deno.serve(handleInteraction);
}
