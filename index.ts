import { EntityChanges, download } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";
import { Social } from "substreams-sink-socials";

import { Slack, SlackConfigSchema } from "./src/slack";

import pkg from "./package.json";

logger.setName(pkg.name);
export { logger };

// default slack options
export const DEFAULT_SLACK_API_TOKEN_ENV = 'SLACK_API_TOKEN';

// Custom user options interface
interface ActionOptions extends RunOptions {
    config: string,
    slackApiTokenEnvvar: string,
    slackApiToken: string,
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams
    const spkg = await download(manifest);

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

    // Run substreams
    const substreams = run(spkg, moduleName, options);

    substreams.on("anyMessage", async (messages: EntityChanges) => {
        await social.distributeMessages(messages, (chatId, message, config) => {
            slackBot.sendMessage(chatId, message, config);
        });
    });

    substreams.start(options.delayBeforeStart);
}
