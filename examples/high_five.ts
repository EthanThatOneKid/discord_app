import type { AppSchema } from "discord_app/mod.ts";
import { createApp, InteractionResponseType } from "discord_app/mod.ts";

/**
 * highFive is a `discord_app` schema modeled after the example in the
 * official Discord API reference documentation.
 *
 * @see
 * https://discord.com/developers/docs/interactions/application-commands#user-commands
 */
export const highFive = {
  user: { name: "High Five" },
} as const satisfies AppSchema;

if (import.meta.main) {
  // Create the Discord application.
  const handleInteraction = await createApp(
    {
      schema: highFive,
      applicationID: Deno.env.get("DISCORD_APPLICATION_ID")!,
      publicKey: Deno.env.get("DISCORD_PUBLIC_KEY")!,
      register: { token: Deno.env.get("DISCORD_TOKEN")! },
      invite: { path: "/invite", scopes: ["applications.commands"] },
    },
    (interaction) => {
      const targetUser =
        interaction.data.resolved.users[interaction.data.target_id];
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content:
            `<@${interaction.member?.user.id}> high-fived <@${targetUser.id}>!`,
        },
      };
    },
  );

  // Start the server.
  Deno.serve(handleInteraction);
}
