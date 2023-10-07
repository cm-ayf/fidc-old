import { HttpError } from "$lib/error";
import { X509Certificate } from "@peculiar/x509";
import type { AttestedCredentialData } from "../authenticator";
import type { AttestationStatement } from "../types";
import { COSEAlgorithmIdentifier } from "$lib/algorithms/types";

export async function verifyAttestationAndroidKey(
  attestationStatement: AttestationStatement<"android-key">,
  attestedCredentialData: AttestedCredentialData,
  signatureBase: ArrayBuffer,
  clientDataHash: ArrayBuffer
) {
  if (!attestationStatement.x5c?.[0]) {
    throw new HttpError("x5c must have first element", 400);
  }

  const cert = new X509Certificate(attestationStatement.x5c[0]);
  const publicKey = await cert.publicKey.export();
  const result = await crypto.subtle.verify(
    COSEAlgorithmIdentifier[attestationStatement.alg],
    publicKey,
    attestationStatement.sig,
    signatureBase
  );
  if (!result) throw new HttpError("Invalid signature", 401);

  if (
    !equals(attestedCredentialData.credentialPublicKey, cert.publicKey.rawData)
  ) {
    throw new HttpError("Public key mismatch", 400);
  }

  const attestationChallenge = cert.getExtension("1.3.6.1.4.1.11129.2.1.17");
  if (!attestationChallenge) {
    throw new HttpError("attestationChallenge not found", 400);
  }
  if (!equals(attestationChallenge.value, clientDataHash)) {
    throw new HttpError("attestationChallenge mismatch", 400);
  }

  // TODO: verify AuthorizationList
}

function equals(a: ArrayBuffer, b: ArrayBuffer) {
  if (a.byteLength !== b.byteLength) return false;
  const aView = new Uint8Array(a);
  const bView = new Uint8Array(b);
  return aView.every((val, i) => val === bView[i]);
}
