import { EntityChanges, download } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";
import fs from "fs";
import YAML from "yaml";
import path from "path";
import PQueue from "p-queue";
import { ZodError } from "zod";

import { Slack, SlackConfig, SlackConfigsSchema } from "./src/slack";

import pkg from "./package.json";

logger.defaultMeta = { service: pkg.name };
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

    // Read config file
    let configs: any[];
    const ext: string = path.extname(config);
    const rawConfigs = fs.readFileSync(config, 'utf-8');

    try {
        if (ext === '.json') {
            configs = SlackConfigsSchema.parse(JSON.parse(rawConfigs));
        } else if (ext === '.yml' || ext === '.yaml') {
            configs = SlackConfigsSchema.parse(YAML.parse(rawConfigs));
        }
    } catch (error) {
        if (error instanceof ZodError) {
            logger.error(JSON.stringify(error));
        } else {
            logger.error(error);
        }
        process.exit(1);
    }

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

    const queue = new PQueue({ concurrency: 1, intervalCap: 1, interval: 1000 });

    substreams.on("anyMessage", async (message: EntityChanges) => {

        message.entityChanges.forEach(async (entityChange) => {

            configs.forEach(async (conf: SlackConfig) => {

                if (entityChange.entity === conf.entity) {

                    let formattedMessage: string = conf.message;

                    entityChange.fields.forEach(async (field) => {
                        formattedMessage = formattedMessage.replaceAll(`{${field.name}}`, field.newValue?.typed.value as string);
                    });

                    conf.chat_ids.forEach(async (chatId: string) => {
                        await queue.add(() => slackBot.sendMessage(chatId, formattedMessage));
                    });
                }
            });
        });
    });

    substreams.start(options.delayBeforeStart);
}
