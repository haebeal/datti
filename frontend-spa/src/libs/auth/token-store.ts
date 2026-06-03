let currentAccessToken: string | undefined;

export function setCurrentAccessToken(token: string | undefined) {
	currentAccessToken = token;
}

export function getCurrentAccessToken(): string | undefined {
	return currentAccessToken;
}
