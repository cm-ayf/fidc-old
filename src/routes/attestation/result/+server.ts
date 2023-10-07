import { decode } from "$lib/cbor";
import type { RegistrationResponseJSON } from "@github/webauthn-json/browser-ponyfill";
import type { AttestationObject } from "$lib/attestation/types";
import type { ClientDataJSON } from "$lib/client-data";
import { atob } from "$lib/base64url.js";
import { verifyAttestation } from "$lib/attestation/verify";
import { HttpError } from "$lib/error.js";

export interface AttestationOptionsRequest
  extends Pick<
    PublicKeyCredentialCreationOptions,
    "attestation" | "authenticatorSelection"
  > {
  username: string;
  displayName: string;
}

export async function POST({ request }) {
  const { response }: RegistrationResponseJSON = await request.json();
  const clientDataJSON: ClientDataJSON = JSON.parse(
    atob(response.clientDataJSON)
  );
  if (clientDataJSON.type !== "webauthn.create") {
    throw new HttpError("Invalid clientDataJSON type", 400);
  }
  const attestationObject: AttestationObject = decode(
    new TextEncoder().encode(atob(response.attestationObject))
  );
  const authenticatorData = await verifyAttestation(
    attestationObject,
    new TextEncoder().encode(atob(response.clientDataJSON))
  );
  console.log(authenticatorData);

  return Response.json({ status: "ok", errorMessage: "" });
}
