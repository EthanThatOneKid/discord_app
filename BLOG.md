# Special Discord Edition

[![Open Source Software Team Special Discord Edition artwork for acmcsuf.com/special-discord-edition](https://github.com/EthanThatOneKid/acmcsuf.com/assets/31261035/d99ab5c2-73dd-4d4a-9ea6-ca74de353726)](https://docs.google.com/presentation/d/1IOaUTnV37v2ovIG2yx69CgK8dlXMgTIJt0tYYX_LEDE/edit?usp=sharing)

Self link: <https://acmcsuf.com/special-discord-edition/>

This blog post is a special edition of the mini-workshop series. This blog post is intended to be used as a reference for building projects that are using Discord API concepts.

## Discord API

The Discord API is the home of all possible Discord

This section serves as an introduction to the Discord API.

The features of a project determines whether or not implementing websocket-based connection is necessary.

For the _Special Discord Edition_ blog post, we will go over three primary uses of the Discord API.

> **NOTE**
>
> The content of this blog post is not meant to be comprehensive. Please reference Discord's official [API Reference](https://discord.com/developers/docs/reference) documentation.

- Discord interaction server
- Discord websocket server
- Discord webhook

| Vocabulary                      | Definition                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Discord bot                     | An entity within Discord that is capable operating autonomously. A Discord bot has the same abilities of a human Discord user. |
| Discord application command     | TBD                                                                                                                            |
| Discord chat input application  | TBD                                                                                                                            |
| Discord chat input autocomplete | TBD                                                                                                                            |
| Discord message application     | TBD                                                                                                                            |
| Discord user application        | TBD                                                                                                                            |
| Discord webhook                 | TBD                                                                                                                            |
| Discord modal                   | TBD                                                                                                                            |
| Discord message component       | TBD                                                                                                                            |

## Discord interaction server versus Discord bot versus Discord webhook

| Discord project type       | Discord requirements                                 | Resource requirements                                                      |
| -------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| Discord webhook            | Webhook URL                                          | Ability to send HTTP requests                                              |
| Discord websocket server   | Application ID, public key, client secret, bot token | Ability to make websocket connection (traditional web server)              |
| Discord interaction server | Application ID, public key, client secret, bot token | Ability to respond to HTTP requests (serverless or traditional web server) |

### Discord interaction server

A Discord interaction server is a web server that is capable of handling Discord interaction requests.

> **NOTE**
>
> Your Discord interaction server acts as a web server that handles Discord interaction requests. Your Discord interaction server is not a Discord bot.

Your project has a Discord interaction server if it needs to handle Discord interaction requests.

#### Interaction request types

| Interaction type                   | Value |
| ---------------------------------- | ----- |
| `PING`                             | 1     |
| `APPLICATION_COMMAND`              | 2     |
| `MESSAGE_COMPONENT`                | 3     |
| `APPLICATION_COMMAND_AUTOCOMPLETE` | 4     |
| `MODAL_SUBMIT`                     | 5     |
