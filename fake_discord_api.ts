import type {
  DiscordAPI,
  EditOriginalInteractionResponseOptions,
  OmitCredentials,
  RegisterApplicationCommandOptions,
  VerifyOptions,
} from "./discord_api.ts";

/**
 * FakeDiscordAPI is a fake implementation of the DiscordAPIInterface.
 */
export class FakeDiscordAPI implements DiscordAPI {
  public async verify(options: OmitCredentials<VerifyOptions>) {
    const json = await options.request.text();
    return { error: null, body: json };
  }

  public registerApplicationCommand(
    _: OmitCredentials<RegisterApplicationCommandOptions>,
  ) {
    return Promise.resolve();
  }

  public editOriginalInteractionResponse(
    _: OmitCredentials<EditOriginalInteractionResponseOptions>,
  ) {
    return Promise.resolve();
  }
}
