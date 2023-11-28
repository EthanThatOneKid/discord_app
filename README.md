# discord_app

[![deno doc](https://doc.deno.land/badge.svg)](https://deno.land/x/discord_app)

Define and serve Discord application commands.

> Application commands are native ways to interact with apps in the Discord
> client. There are 3 types of commands accessible in different interfaces: the
> chat input, a message's context menu (top-right menu or right-clicking in a
> message), and a user's context menu (right-clicking on a user).

## Usage

> [!NOTE]
>
> The `discord_app` library is currently only known to be available in Deno.

### Examples

<!-- Examples are located in the generated library documentation. -->

### Message commands

In `discord_app`,
[message commands](https://discord.com/developers/docs/interactions/application-commands#message-commands)
are created and served as demonstrated in
[`/examples/bookmark.ts`](./examples/bookmark.ts).

### User commands

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
- [`/examples/permissions.ts`](./examples/permissions.ts). This is application
  is a set of grouped subcommands.

## Contributing

Contributions to the project are welcome. Feel free to open an issue or pull
request!

---

Developed with 💜 by [**@EthanThatOneKid**](https://etok.codes/)
