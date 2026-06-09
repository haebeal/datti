import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;

export const userManager = new UserManager({
	authority: cognitoDomain,
	client_id: clientId,
	redirect_uri: redirectUri,
	post_logout_redirect_uri: `${window.location.origin}/auth`,
	response_type: "code",
	scope: "openid email profile aws.cognito.signin.user.admin",
	loadUserInfo: false,
	automaticSilentRenew: true,
	userStore: new WebStorageStateStore({ store: window.localStorage }),
	metadata: {
		issuer: cognitoDomain,
		authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
		token_endpoint: `${cognitoDomain}/oauth2/token`,
		userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
		end_session_endpoint: `${cognitoDomain}/logout`,
		revocation_endpoint: `${cognitoDomain}/oauth2/revoke`,
	},
});
