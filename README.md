# discord_app

Create Discord application commands.

> **NOTE**
>
> The `discord_app` library is currently only in Deno.

## Usage

> Application commands are native ways to interact with apps in the Discord
> client. There are 3 types of commands accessible in different interfaces: the
> chat input, a message's context menu (top-right menu or right-clicking in a
> message), and a user's context menu (right-clicking on a user).

### Examples

<!-- Examples are located in the generated library documentation. -->

### Message commands

In `discord_app`, message commands are created and served like so:

```ts
import { createApp, InteractionResponseType } from "./mod.ts";

if (import.meta.main) {
  Deno.serve(
    await createApp(
      {
        schema: {
          message: {
            name: "message",
          },
        },
        applicationID: "your_application_id",
        publicKey: "your_public_key",
        register: {
          token: "your_bot_token",
        },
        invite: {
          path: "/invite",
        },
      },
      () => {
        return {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: "Hello world!",
          },
        };
      },
    ),
  );
}
```

## Contributing

Contributions to the project are welcome. Feel free to open an issue or pull
request!

---

Developed with 💜 by [**@EthanThatOneKid**](https://etok.codes/)
