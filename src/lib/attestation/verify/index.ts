import { HttpError } from "$lib/error";
import {
  parseAuthenticatorData,
  type AuthenticatorData,
} from "../authenticator";
import type { AttestationObject } from "../types";
import { verifyAttestationAndroidKey } from "./android-key";
import { verifyAttestationAndroidSafetynet } from "./android-safetynet";
import { verifyAttestationFidoU2f } from "./fido-u2f";
import { verifyAttestationPacked } from "./packed";
import { verifyAttestationTpm } from "./tpm";

export async function verifyAttestation(
  attestationObject: AttestationObject,
  clientDataJSON: ArrayBuffer | ArrayBufferView
): Promise<AuthenticatorData> {
  const authenticatorData = parseAuthenticatorData(attestationObject.authData);
  if (attestationObject.fmt === "none") return authenticatorData;

  const { attestedCredentialData } = authenticatorData;
  if (!attestedCredentialData) throw new HttpError("Credential missing", 400);

  const clientDataHash = await crypto.subtle.digest("SHA-256", clientDataJSON);
  const signatureBase = concat(attestationObject.authData, clientDataHash);

  switch (attestationObject.fmt) {
    case "packed":
      await verifyAttestationPacked(
        attestationObject.attStmt,
        attestedCredentialData,
        signatureBase
      );
      return authenticatorData;
    case "tpm":
      await verifyAttestationTpm(
        attestationObject.attStmt,
        attestedCredentialData,
        signatureBase
      );
      return authenticatorData;
    case "android-key":
      await verifyAttestationAndroidKey(
        attestationObject.attStmt,
        attestedCredentialData,
        signatureBase,
        clientDataHash
      );
      return authenticatorData;
    case "android-safetynet":
      await verifyAttestationAndroidSafetynet(
        attestationObject.attStmt,
        attestedCredentialData,
        signatureBase
      );
      return authenticatorData;
    case "fido-u2f":
      await verifyAttestationFidoU2f(
        attestationObject.attStmt,
        attestedCredentialData,
        signatureBase,
        clientDataHash,
        authenticatorData
      );
      return authenticatorData;
    default:
      throw new HttpError("Unsupported attestation format", 400);
  }
}

export function concat(...buffers: (ArrayLike<number> | ArrayBufferLike)[]) {
  const views = buffers.map((buffer) => new Uint8Array(buffer));
  const length = views.reduce((sum, view) => sum + view.byteLength, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const view of views) {
    result.set(view, offset);
    offset += view.byteLength;
  }
  return result;
}
