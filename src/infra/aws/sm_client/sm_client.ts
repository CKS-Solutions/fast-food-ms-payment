import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager"
import { AwsRegion, AwsStage, newAwsConfig } from "../utils"

export class SMClientWrapper extends SecretsManagerClient {
	constructor(region: AwsRegion, stage: AwsStage) {
		const config = newAwsConfig(region, stage)
		super(config)
	}
}