import { load } from "../developer_deps.ts";
import type { AppSchema } from "../mod.ts";
import { createApp, InteractionResponseType } from "../mod.ts";

/**
 * bookmark is a `discord_app` schema modeled after the example in the
 * official Discord API reference documentation.
 *
 * @see
 * https://discord.com/developers/docs/interactions/application-commands#message-commands
 */
export const bookmark = {
  message: { name: "bookmark" },
} as const satisfies AppSchema;

if (import.meta.main) {
  // Load environment variables from .env file.
  await load({ export: true });

  // Create the Discord application.
  const handleInteraction = await createApp(
    {
      schema: bookmark,
      applicationID: Deno.env.get("DISCORD_APPLICATION_ID")!,
      publicKey: Deno.env.get("DISCORD_PUBLIC_KEY")!,
      register: { token: Deno.env.get("DISCORD_TOKEN")! },
      invite: { path: "/invite", scopes: ["applications.commands"] },
    },
    (interaction) => {
      const message =
        interaction.data.resolved.messages[interaction.data.target_id];
      const messageURL =
        `https://discord.com/channels/${interaction.guild_id}/${message.channel_id}/${message.id}`;
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content:
            `Bookmarked ${messageURL} for <@${interaction.member?.user.id}>!`,
        },
      };
    },
  );

  // Start the server.
  Deno.serve(handleInteraction);
}
