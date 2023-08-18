import { setup, logger, commander } from "substreams-sink";
import { Social } from "substreams-sink-socials";

import { Slack, SlackConfigSchema } from "./src/slack.js";

import pkg from "./package.json";

logger.setName(pkg.name);
export { logger };

// default slack options
export const DEFAULT_SLACK_API_TOKEN_ENV = 'SLACK_API_TOKEN';

// Custom user options interface
interface ActionOptions extends commander.RunOptions {
    config: string,
    slackApiTokenEnvvar: string,
    slackApiToken: string,
}

export async function action(options: ActionOptions) {
    const { emitter } = await setup(options);

    // Get command options
    const { config, slackApiTokenEnvvar, slackApiToken } = options;

    // Social setup
    let social: Social = new Social(config, SlackConfigSchema);

    // Slack options
    const slack_api_token = slackApiToken ?? process.env[slackApiTokenEnvvar];

    if (!slack_api_token) {
        logger.error('[slack_api_token] is required');
        process.exit(1);
    }

    // Initialize Slack bot
    const slackBot = new Slack(slack_api_token);

    emitter.on("anyMessage", async (messages) => {
        await social.distributeMessages(messages as any, (chatId, message, config) => {
            slackBot.sendMessage(chatId, message, config);
        });
    });

    await emitter.start();
}
