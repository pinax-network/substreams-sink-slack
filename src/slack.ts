import { logger } from "substreams-sink";
import { WebClient, ErrorCode, retryPolicies } from "@slack/web-api";
import { z } from "zod";

export const SlackConfigSchema = z.object({});

export type SlackConfig = z.infer<typeof SlackConfigSchema>;

export class Slack {
    private readonly client: WebClient;

    constructor(token: string) {
        this.client = new WebClient(token, {
            retryConfig: retryPolicies.fiveRetriesInFiveMinutes,
        });
    }

    public async sendMessage(chatId: string, message: string, _: SlackConfig) {
        try {
            await this.client.chat.postMessage({
                text: message,
                channel: chatId,
            });
        } catch (error: any) {
            if (error.code === ErrorCode.PlatformError) {
                logger.error(error);
            } else {
                logger.error('failed to send message');
            }
        }
    }
}