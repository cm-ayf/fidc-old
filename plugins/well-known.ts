import { loadEnv, type Plugin } from "vite";

export default function wellKnown({ mode }: { mode: string }): Plugin {
  const { CF_PAGES_URL, PRIVATE_JWK } = Object.assign(
    process.env,
    loadEnv(mode, process.cwd(), "")
  );
  const privateJwk = JSON.parse(PRIVATE_JWK);
  const { d: _, ...publicJwk } = privateJwk;

  return {
    name: "well-known",
    buildEnd() {
      this.emitFile({
        type: "asset",
        name: "openid-configuration",
        fileName: ".well-known/openid-configuration",
        source: JSON.stringify(openidConfiguration(new URL(CF_PAGES_URL))),
      });
      this.emitFile({
        type: "asset",
        name: "jwks-json",
        fileName: ".well-known/jwks.json",
        source: JSON.stringify(jwksJson(publicJwk)),
      });
    },
  };
}

function openidConfiguration(issuer: URL) {
  return {
    issuer,
    authorization_endpoint: new URL("/authorize", issuer),
    token_endpoint: new URL("/token", issuer),
    userinfo_endpoint: new URL("/userinfo", issuer),
    jwks_uri: new URL("/.well-known/jwks.json", issuer),
    revocation_endpont: new URL("/revoke", issuer),
    response_types_supported: [
      "code",
      "token",
      "id_token",
      "code token",
      "code id_token",
      "token id_token",
      "code token id_token",
      "none",
    ],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["ES256"],
    scopes_supported: ["openid", "profile", "email"],
    token_endpoint_auth_methods_supported: ["client_secret_basic"],
    claims_supported: [
      "aud",
      "email",
      "email_verified",
      "exp",
      "iat",
      "iss",
      "name",
      "sub",
    ],
    code_challenge_methods_supported: ["S256"],
    grant_types_supported: ["authorization_code", "refresh_token"],
  };
}

function jwksJson(publicJwk: unknown) {
  return { keys: [publicJwk] };
}
