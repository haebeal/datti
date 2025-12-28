/**
 * Mock authentication module
 * TODO: Replace with real Firebase Auth integration
 */

/**
 * Returns a mock JWT token for API authentication
 * In production, this should return a real Firebase ID token
 */
export async function getAuthToken(): Promise<string> {
	return (
		process.env.NEXT_PUBLIC_MOCK_AUTH_TOKEN ||
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsIm5hbWUiOiJNb2NrIFVzZXIiLCJpYXQiOjE3MzU0MTcyMDB9.mock-signature"
	);
}

/**
 * Returns the current mock user ID
 */
export async function getMockUserId(): Promise<string> {
	return process.env.NEXT_PUBLIC_MOCK_USER_ID || "user-123";
}

/**
 * Returns a mock user list for testing debt assignments
 */
export async function getMockUserList(): Promise<
	Array<{ id: string; name: string }>
> {
	return [
		{ id: "user-123", name: "田中太郎" },
		{ id: "user-456", name: "佐藤花子" },
		{ id: "user-789", name: "鈴木一郎" },
	];
}

/**
 * Mock users database for lookup
 */
export const MOCK_USERS = [
	{ id: "user-123", displayName: "田中太郎", email: "tanaka@example.com" },
	{ id: "user-456", displayName: "佐藤花子", email: "sato@example.com" },
	{ id: "user-789", displayName: "鈴木一郎", email: "suzuki@example.com" },
];
