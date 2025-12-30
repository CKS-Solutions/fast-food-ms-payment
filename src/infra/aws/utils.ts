const LOCALSTACK_ENDPOINT = "http://host.docker.internal:4566"
const OFFLINE_ENDPOINT = "http://localhost:4566"

export enum AwsStage {
	Offline = "offline",
	Local	= "local",
	Prod	= "prod",
}

export enum AwsRegion {
	USEast1 = "us-east-1",
}

type AwsConfig = {
	region: AwsRegion
	endpoint?: string
}

export function newAwsConfig(region: AwsRegion, stage: AwsStage): AwsConfig {
	const baseConfig: AwsConfig = {
		region: region,
	}

	if (stage === AwsStage.Offline) {
		baseConfig.endpoint = OFFLINE_ENDPOINT
	}

	if (stage === AwsStage.Local) {
		baseConfig.endpoint = LOCALSTACK_ENDPOINT
	}

	return baseConfig
}