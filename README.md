# discord_app

[![deno doc](https://doc.deno.land/badge.svg)](https://deno.land/x/discord_app)

Define and serve Discord application commands.

By leveraging TypeScript's type system, `discord_app` ensures type-safety in
defining application commands, utilizing your application command schema to
inject type information into your interaction handlers.

> Application commands are native ways to interact with apps in the Discord
> client. There are 3 types of commands accessible in different interfaces: the
> chat input, a message's context menu (top-right menu or right-clicking in a
> message), and a user's context menu (right-clicking on a user).

## Usage

> [!NOTE]
>
> The `discord_app` library is currently only known to be available in Deno.

### Development

When developing with the `discord_app` library, make sure to include all of the 
necessary environmental variables from the Discord application into its designated 
`.env` file.

Next, prepare two terminal windows to run the following commands:

**Terminal 1:**

```bash
deno task start
```

**Terminal 2:**

```bash
ngrok http [YOUR_PREFERRED_PORT]
```

The generated URL under **Forwarding** should be copied into the **Interactions 
Endpoint URL** in the **General** tab of your Discord application. Find your 
application [here](https://discord.com/developers/applications).

**Note:** You will need to have Ngrok installed and in your path.

### Examples

<!-- Examples are located in the generated library documentation. -->

### Message commands

> Message commands are application commands that appear on the context menu
> (right click or tap) of messages. They're a great way to surface quick actions
> for your app that target messages. They don't take any arguments, and will
> return the message on whom you clicked or tapped in the interaction response.

In `discord_app`,
[message commands](https://discord.com/developers/docs/interactions/application-commands#message-commands)
are created and served as demonstrated in
[`/examples/bookmark.ts`](./examples/bookmark.ts).

### User commands

> User commands are application commands that appear on the context menu (right
> click or tap) of users. They're a great way to surface quick actions for your
> app that target users. They don't take any arguments, and will return the user
> on whom you clicked or tapped in the interaction response.

In `discord_app`,
[user commands](https://discord.com/developers/docs/interactions/application-commands#user-commands)
are created and served as demonstrated in
[`/examples/high_five.ts`](./examples/high_five.ts).

### Chat input commands

> For those developers looking to make more organized and complex groups of
> commands, look no further than subcommands and groups.
>
> **Subcommands** organize your commands by **specifying actions within a
> command or group**.
>
> **Subcommand Groups** organize your **subcommands** by **grouping subcommands
> by similar action or resource within a command**.
>
> These are not enforced rules. You are free to use subcommands and groups
> however you'd like; it's just how we think about them.

In `discord_app`,
[chat input commands](https://discord.com/developers/docs/interactions/application-commands#slash-commands),
also known as "slash commands", are created and served as demonstrated in the
following example files:

- [`/examples/blep.ts`](./examples/blep.ts). This is a simple application with a
  single command.
- [`/examples/permissions.ts`](./examples/permissions.ts). This is a single
  command with grouped subcommands.

## Contributing

Contributions to the project are welcome. Feel free to open an issue or pull
request!

---

Developed with 💜 by [**@EthanThatOneKid**](https://etok.codes/)
