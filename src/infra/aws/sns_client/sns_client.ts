import { SNSClient } from "@aws-sdk/client-sns"
import { AwsRegion, AwsStage, newAwsConfig } from "../utils"

export class SNSClientWrapper extends SNSClient {
	constructor(region: AwsRegion, stage: AwsStage) {
		const config = newAwsConfig(region, stage)
		super(config)
	}
}