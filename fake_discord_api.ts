import type {
  DiscordAPIInterface,
  RegisterApplicationCommandOptions,
  VerifyOptions,
} from "./discord_api.ts";

/**
 * FakeDiscordAPI is a fake implementation of the DiscordAPIInterface.
 */
export class FakeDiscordAPI implements DiscordAPIInterface {
  async verify(options: VerifyOptions) {
    const json = await options.request.text();
    return { error: null, body: json };
  }

  registerApplicationCommand(_: RegisterApplicationCommandOptions) {
    return Promise.resolve();
  }
}
