import { logger } from "substreams-sink";
import { WebClient, ErrorCode, retryPolicies } from "@slack/web-api";
import { z } from "zod";

export enum ChatType {
    USER,
    CHANNEL,
}

const SlackConfigSchema = z.object({
    entity: z.string(),
    chat_ids: z.array(z.string()),
    message: z.string()
});

export const SlackConfigsSchema = z.array(SlackConfigSchema);
export type SlackConfig = z.infer<typeof SlackConfigSchema>;

export class Slack {
    private readonly client: WebClient;

    constructor(token: string) {
        this.client = new WebClient(token, {
            retryConfig: retryPolicies.fiveRetriesInFiveMinutes,
        });
    }

    public async sendMessage(chatId: string, message: string) {
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