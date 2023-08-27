import { decode } from "$lib/cbor";
import type { RegistrationResponseJSON } from "@github/webauthn-json/browser-ponyfill";
import { parseAuthenticatorData } from "$lib/attestation";
import type { AttestationObject } from "$lib/attestation";
import type { ClientDataJSON } from "$lib/client-data";
import { atob } from "$lib/base64url.js";

export interface AttestationOptionsRequest
  extends Pick<
    PublicKeyCredentialCreationOptions,
    "attestation" | "authenticatorSelection"
  > {
  username: string;
  displayName: string;
}

export async function POST({ request }) {
  const json: RegistrationResponseJSON = await request.json();
  const clientDataJSON: ClientDataJSON = JSON.parse(
    atob(json.response.clientDataJSON)
  );
  console.log(clientDataJSON);
  const attestationObject: AttestationObject = decode(
    new TextEncoder().encode(atob(json.response.attestationObject))
  );
  console.log(attestationObject);
  const authenticationData = parseAuthenticatorData(attestationObject.authData);
  console.log(authenticationData);

  return Response.json({ status: "ok", errorMessage: "" });
}
