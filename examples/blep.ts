import type { AppSchema } from "discord_app/mod.ts";
import {
  ApplicationCommandOptionType,
  createApp,
  InteractionResponseType,
} from "discord_app/mod.ts";

/**
 * blep is a `discord_app` schema modeled after the example in the official
 *
 * @see
 * https://discord.com/developers/docs/interactions/application-commands#making-a-global-command
 */
export const blep = {
  chatInput: {
    name: "blep",
    description: "Send a random adorable animal photo",
    options: {
      animal: {
        type: ApplicationCommandOptionType.String,
        description: "The type of animal",
        required: true,
        choices: {
          "Dog": "animal_dog",
          "Cat": "animal_cat",
          "Penguin": "animal_penguin",
        },
      },
      "only-smol": {
        type: ApplicationCommandOptionType.Boolean,
        description: "Whether to show only baby animals",
        required: false,
      },
    },
  },
} as const satisfies AppSchema;

if (import.meta.main) {
  // Create the Discord application.
  const handleInteraction = await createApp(
    {
      schema: blep,
      applicationID: Deno.env.get("DISCORD_APPLICATION_ID")!,
      publicKey: Deno.env.get("DISCORD_PUBLIC_KEY")!,
      register: { token: Deno.env.get("DISCORD_TOKEN")! },
      invite: { path: "/invite", scopes: ["applications.commands"] },
    },
    (interaction) => {
      const animal = interaction.data.parsedOptions.animal; // "animal_dog" | "animal_cat" | "animal_penguin"
      const onlySmol = interaction.data.parsedOptions["only-smol"];
      const url = makePictureURL(animal, onlySmol);
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: url.toString() },
      };
    },
  );

  // Start the server.
  Deno.serve(handleInteraction);
}

function makePictureURL(animal: string, onlySmol?: boolean) {
  const url = new URL("https://source.unsplash.com/200x200/");
  const query = `animal ${animal}${onlySmol ? " baby" : ""}`;
  url.searchParams.append(query, "");
  return url;
}
