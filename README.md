# discord_app

[![deno doc](https://doc.deno.land/badge.svg)](https://deno.land/x/discord_app)

Create Discord application commands.

> Application commands are native ways to interact with apps in the Discord
> client. There are 3 types of commands accessible in different interfaces: the
> chat input, a message's context menu (top-right menu or right-clicking in a
> message), and a user's context menu (right-clicking on a user).

## Usage

> **NOTE**
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

In `discord_app`, chat input commands, also known as "slash commands", are
created and served as demonstrated in
[`/examples/permissions.ts`](./examples/permissions.ts).

## Contributing

Contributions to the project are welcome. Feel free to open an issue or pull
request!

---

Developed with 💜 by [**@EthanThatOneKid**](https://etok.codes/)
