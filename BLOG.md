# Special Discord Edition

[![Open Source Software team Special Discord Edition artwork for acmcsuf.com/special-discord-edition](https://github.com/EthanThatOneKid/acmcsuf.com/assets/31261035/d99ab5c2-73dd-4d4a-9ea6-ca74de353726)](https://docs.google.com/presentation/d/1IOaUTnV37v2ovIG2yx69CgK8dlXMgTIJt0tYYX_LEDE/edit?usp=sharing)

Self link: <https://acmcsuf.com/special-discord-edition/>

Last edited: Nov 29th, 2023

This special edition of the mini-workshop series serves as a reference for
building projects utilizing Discord API concepts. Designed as a handbook, this
blog post is tailored to guide you in deploying your project to operate beyond a
local environment, ensuring it remains functional even when your computer is
offline.

## Table of contents

- [Discord API](#discord-api): An introduction to the Discord API.
- [Questions to ask yourself](#questions-to-ask-yourself): Questions to ask
  yourself to help you decide what you need to build your Discord project.
- [Websocket server versus interaction server versus webhook](#websocket-server-versus-interaction-server-versus-webhook):
  A table summarizing the differences between the three types of Discord
  projects.
- [Example projects](#example-projects): Example projects to reference when
  building your Discord project.
- [Conclusion](#conclusion)

## Discord API

This section serves as an introduction to the Discord API.

> [!NOTE]
>
> The content of this blog post is not meant to be totally comprehensive. Please
> reference Discord's official
> [API Reference](https://discord.com/developers/docs/reference) documentation
> for more information.

### Discord API concepts

| Vocabulary              | Official Discord API Reference URL                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| Application command     | <https://discord.com/developers/docs/interactions/application-commands#application-commands>                  |
| Chat input command      | <https://discord.com/developers/docs/interactions/application-commands#slash-commands>                        |
| Chat input autocomplete | <https://discord.com/developers/docs/interactions/application-commands#autocomplete>                          |
| Message command         | <https://discord.com/developers/docs/interactions/application-commands#message-commands>                      |
| User command            | <https://discord.com/developers/docs/interactions/application-commands#user-commands>                         |
| Webhook                 | <https://discord.com/developers/docs/resources/webhook#webhook-resource>                                      |
| Message component       | <https://discord.com/developers/docs/interactions/message-components>                                         |
| Modal                   | <https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-modal> |
| Grants                  | <https://discord.com/developers/docs/topics/oauth2#state-and-security>                                        |

#### Discord credentials

In order to use the Discord API, you need to
[**create a new Discord application**](https://discord.com/developers/applications)
which contains the credentials necessary to authenticate your project with
Discord.

| Credential type | Keep safe | Description                                                                         |
| --------------- | --------- | ----------------------------------------------------------------------------------- |
| Client ID       | Public    | A.k.a application ID. Used to identify your application to Discord.                 |
| Client secret   | Private   | Used to authenticate client ID.                                                     |
| Public key      | Public    | Used to verify incoming Discord interactions.                                       |
| Bot token       | Private   | Used to authenticate a Discord application bot, which represents an automated user. |

#### Scopes, permissions, and intents

> [OAuth2 Scopes](https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes)
> determine what data access and actions your app can take, granted on behalf of
> an installing or authenticating user.
>
> [Permissions](https://discord.com/developers/docs/topics/permissions#permissions)
> are the granular permissions for your bot user, the same as other users in
> Discord have. They can be approved by the installing user or later updated
> within server settings or with
> [permission overwrites](https://discord.com/developers/docs/topics/permissions#permission-overwrites).
>
> Intents determine which events Discord will send your app when you're creating
> a
> [Gateway API connection](https://discord.com/developers/docs/topics/gateway).
> For example, if you want your app to do something when users add a reaction to
> a message, you can pass the `GUILD_MESSAGE_REACTIONS` (`1 << 10`) intent.
>
> Some intents are
> [privileged](https://discord.com/developers/docs/topics/gateway#privileged-intents),
> meaning they allow your app to access data that may be considered sensitive
> (like the contents of messages). Privileged intents appear and can be toggled
> on the Bot page in your app's settings. Standard, non-privileged intents don't
> require any additional permissions or configurations. More information about
> intents and a full list of available intents, along with their associated
> events, is in the
> [Gateway documentation](https://discord.com/developers/docs/topics/gateway#gateway-intents).

Edit your application's invite URL to specify the scopes and permissions your
application needs. See Discord's documentation on
[creating an invite](https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes)
for more information.

From you Discord application's dashboard, you can build an invite URL with the
scopes and permissions you need.

[![Discord application dashboard OAuth2 URL generator screenshot](https://github.com/EthanThatOneKid/discord_app/assets/31261035/fe499311-a69e-4e64-b9b4-24f2e08e53fb.png)](https://discord.com/developers/applications)

- From your
  [Discord applications dashboard](https://discord.com/developers/applications),
  click on your application.
- Click on the "OAuth2" tab.
- Under "OAuth2 URL Generator", select the permissions you need.
- Copy the generated URL.
- Paste the generated URL into your browser's address bar and invite the bot to
  your server.

Update the privileges of your application's bot to specify the intents your
application needs **as needed**.

[![Discord application dashboard intents screenshot](https://github.com/EthanThatOneKid/discord_app/assets/31261035/822804e3-e6a3-44cd-a0a7-e3b2dc3d7d1d.png)](https://discord.com/developers/applications)

- From your
  [Discord applications dashboard](https://discord.com/developers/applications),
  click on your application.
- Click on the "Bot" tab.
- Under "Privileged Gateway Intents", select the intents you need.
- Click on the "Save Changes" button.

## Questions to ask yourself

Decisions decisions decisions. Need a refresher to help you decide what you
need? Here are some questions to ask yourself.

### Does your project listen for real-time events on Discord?

Examples of what real-time events are:

- A user sends/edits/deletes a message in a channel.
- A user reacts to a message in a channel.
- A user joins/leaves a voice channel.

Implications:

- Your project needs to make a websocket connection to Discord.

Special considerations:

- Your project needs to be accessible via a URL. Deploy your project to a
  hosting provider such as
  [Fly.io](https://fly.io/docs/languages-and-frameworks/),
  [Render](https://render.com/docs), etc.

According to
[Vercel's documentation](https://vercel.com/guides/can-i-deploy-discord-bots-to-vercel):

> Discord Bots that require a server to be constantly listening and reacting to
> events will not work on Vercel since
> [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
> have execution
> [limits](https://vercel.com/docs/concepts/limits/overview#general-limits) that
> range from 5 to 30 seconds depending on your plan. You can consider
> alternative's like [Google Cloud Run](https://cloud.google.com/run/),
> [Fly](https://fly.io/), [Render](https://render.com/), or
> [Digital Ocean](https://www.digitalocean.com/) to host them instead.

Library recommendations, listed without a specific order as of the last edit:

- If you are using Go, I recommend
  [Arikawa v3](https://pkg.go.dev/github.com/diamondburned/arikawa/v3)
- If you are using Deno, I recommend
  [Harmony](https://harmony.mod.land/guide/beginner/basic_bot.html).
- There is a variety of Discord libraries that can help you make a websocket
  connection to Discord. See
  [Discord's official list of libraries](https://discord.com/developers/docs/topics/community-resources#libraries)
  for more information.

### Does your project respond to Discord interactions?

Examples of what Discord interaction are:

- A user uses an application command: user command, message command, or chat
  input (a.k.a. slash) command.
- A user uses a chat input command autocomplete.
- A user uses a message component.
- A user submits a modal.

Discord interaction types:

| Interaction type                   | Value |
| ---------------------------------- | ----- |
| `PING` (Discord heartbeat)         | 1     |
| `APPLICATION_COMMAND`              | 2     |
| `MESSAGE_COMPONENT`                | 3     |
| `APPLICATION_COMMAND_AUTOCOMPLETE` | 4     |
| `MODAL_SUBMIT`                     | 5     |

The interaction type is included in the `type` field of the interaction object.

```json
{
  "type": 2
}
```

Implications:

- Your project needs to respond to HTTP requests. Your project can be a
  serverless function or a traditional web server.

Special considerations:

- If your project is a serverless function, you need to make sure your
  serverless function provider supports serverless functions that respond to
  HTTP requests such as
  [Vercel](https://vercel.com/docs/concepts/functions/serverless-functions),
  [Deno Deploy](https://docs.deno.com/deploy/manual),
  [Cloudflare Workers](https://developers.cloudflare.com/workers/get-started/guide/),
  etc. See Discord's tutorial on
  [Hosting a Reddit API Discord app on Cloudflare Workers](https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers).
- If your project is a traditional web server, you need to make sure your
  traditional web server is accessible via a URL. Deploy your web server to a
  hosting provider such as
  [Fly.io](https://fly.io/docs/languages-and-frameworks/),
  [Render](https://render.com/docs), etc.

According to
[Vercel's documentation](https://vercel.com/guides/can-i-deploy-discord-bots-to-vercel):

> Discord Apps that use Webhooks to respond quickly to an HTTP request and
> aren't invoked every second can be modelled effectively with Vercel's
> Serverless Functions.

Library recommendations, listed without a specific order as of the last edit:

- A library is not necessary to build a Discord interaction server. You can
  build a Discord interaction server with any web framework that supports
  responding to HTTP requests. Tip: Use a library for helping you type-check
  your project, such as
  [discord_api_types](https://deno.land/x/discord_api_types) if you are using
  TypeScript
  ([example projects by **@acmcsufoss**](https://github.com/search?q=org%3Aacmcsufoss+%22from+%5C%22https%3A%2F%2Fdeno.land%2Fx%2Fdiscord_api_types%22&type=code)).
- Many popular Discord websocket libraries come with interaction server
  capabilities. See
  [Discord's official list of libraries](https://discord.com/developers/docs/topics/community-resources#libraries)
  for more information.
- I am currently building a Discord interaction server library for Deno.
  `discord_app` leverages TypeScript's type system to ensure type-safety in
  defining application commands, utilizing your application command schema to
  inject type information into your interaction handlers. See
  [deno.land/x/discord_app](https://deno.land/x/discord_app) for more
  information.

Relevant documentation as of the last edit:

- <https://discord.com/developers/docs/tutorials/upgrading-to-application-commands#registering-commands>
- <https://discord.com/developers/docs/getting-started>

### Does your project send messages to a Discord channel?

Discord webhook capabilities:

- Send messages to a Discord channel with a custom username and avatar.

Implications:

- Your project needs to send HTTP requests. Your project can exist anywhere that
  can send HTTP requests e.g. serverless function, traditional web server,
  workflow script, etc.

Relevant documentation as of the last edit:

- [YouTube - How to get a Webhook URL on Discord](https://youtu.be/K8vgRWZnSZw)
- <https://discord.com/developers/docs/resources/webhook#execute-webhook>
- <https://birdie0.github.io/discord-webhooks-guide/index.html>

### Does your project access Discord user data or allow users to login with Discord?

Discord OAuth2 capabilities:

- Access Discord user data.
- Allow users to login with Discord.

Implications:

- Your project needs to send HTTP requests. Your project can exist anywhere that
  can send HTTP requests e.g. serverless function, traditional web server,
  workflow script, etc.
- To log a user in with Discord, you need to redirect the user to Discord's
  OAuth2 login page. This means your project may need to be accessible via a
  URL, most likely a website. See
  [Discord's State and Security documentation](https://discord.com/developers/docs/topics/oauth2#state-and-security)
  for more information.

## Websocket server versus interaction server versus webhook

Here is a table summarizing the differences between the three types of Discord
projects.

| Discord project type       | Program requirements                                                                | Required information from Discord |
| -------------------------- | ----------------------------------------------------------------------------------- | --------------------------------- |
| Discord websocket server   | Ability to make websocket connection (traditional web server)                       | Application/Bot credentials       |
| Discord interaction server | Ability to respond to HTTP requests (traditional web server or serverless function) | Application/Bot credentials       |
| Discord webhook            | Ability to send HTTP requests                                                       | Webhook URL                       |

## Is your project a Discord Activity?

Discord Activity capabilities:

- Multiple users join a Discord Activity to share media together and interact
  with it in real time together.
- Creative multi-user experiences that are not possible with a traditional
  Discord bot e.g. MMO RPG adventure, shared drawing canvas, etc.

Implications:

- Your project must be built with Discord's official
  [Game SDK](https://discord.com/developers/docs/game-sdk/sdk-starter-guide).

## Example projects

Here are some example projects to reference when building your Discord project.

| Project name                                                     | Technologies used                             | Description                                                                                                  |
| ---------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [AoC-Dailies](https://github.com/tomasohCHOM/aoc-dailies#readme) | Deno, Discord webhook                         | A cron job that sends a message to a Discord channel containing the current day's Advent of Code challenge.  |
| [Shorter](https://github.com/acmcsufoss/shorter#readme)          | Deno, Discord chat input command              | A Discord chat input command that shortens URLs for [acmcsuf.com](https://acmcsuf.com/).                     |
| [Gitcord](https://github.com/ethanthatonekid/gitcord#readme)     | Go, Discord API, GitHub workflow              | A program integrating GitHub issues and PRs into Discord threads, syncing comments and reviews in real-time. |
| [TLDR](https://github.com/acmcsufoss/tldr#readme)                | Deno, Discord message command                 | A Discord interaction server that allows users choose a message and generate a TL;DR summary.                |
| [Triggers](https://github.com/acmcsufoss/triggers#readme)        | Java, Discord bot, Discord chat input command | A command for custom chat triggers that notify users when a message matches.                                 |

## Conclusion

We hope this blog post helped you decide what you need to build your Discord
project. If you have any questions, feel free to reach out to Ethan on Discord
at `EthanThatOneKid`. Written with 💜 by
[**@acmcsufoss**](https://github.com/acmcsufoss).

<!-- TODO: add more visuals like flowcharts or diagrams to illustrate the concepts
being discussed such as a flowchart showing the process from creating a Discord
application to deploying a Discord project to a hosting provider.
TODO: Integrate additional advice on optimizing your Discord project for
performance, common pitfalls, and security. -->
