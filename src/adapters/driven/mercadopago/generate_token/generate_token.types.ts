export type GenerateTokenBody = {
	grant_type: string
	client_id: string
	client_secret: string
}

export type GenerateTokenResponse = {
  access_token: string
}

export type GenerateTokenCredentials = {
  clientId: string
  clientSecret: string
}