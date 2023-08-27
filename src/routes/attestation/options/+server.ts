import { CF_PAGES_URL } from "$env/static/private";
import { createId } from "@paralleldrive/cuid2";
import type { CredentialCreationOptionsJSON } from "@github/webauthn-json";

export interface AttestationOptionsRequest
  extends Pick<
    PublicKeyCredentialCreationOptions,
    "attestation" | "authenticatorSelection"
  > {
  username: string;
  displayName: string;
}

export async function POST({ request }) {
  const {
    username,
    displayName,
    authenticatorSelection,
    attestation = "none",
  }: AttestationOptionsRequest = await request.json();

  const id = createId();
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  return Response.json({
    publicKey: {
      rp: {
        id: new URL(CF_PAGES_URL).hostname,
        name: "FIDC",
      },
      user: {
        id: btoa(id),
        name: username,
        displayName,
      },
      challenge: btoa(String.fromCharCode(...challenge)),
      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -7,
        },
      ],
      authenticatorSelection,
      attestation,
    },
  } satisfies CredentialCreationOptionsJSON);
}
