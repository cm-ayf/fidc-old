import { HttpError } from "$lib/error";
import { X509Certificate } from "@peculiar/x509";
import type {
  AttestedCredentialData,
  AuthenticatorData,
} from "../authenticator";
import type { AttestationStatement } from "../types";
import { parseCoseKey } from "$lib/algorithms";
import { COSEKeyType } from "$lib/algorithms/types";
import { concat } from ".";

export async function verifyAttestationFidoU2f(
  attestationStatement: AttestationStatement<"fido-u2f">,
  attestedCredentialData: AttestedCredentialData,
  signatureBase: ArrayBuffer,
  clientDataHash: ArrayBuffer,
  authenticatorData: AuthenticatorData
) {
  if (!attestationStatement.x5c?.[0] || attestationStatement.x5c.length > 1) {
    throw new HttpError("x5c must have exactly one element", 400);
  }

  const cert = new X509Certificate(attestationStatement.x5c[0]);
  if (cert.publicKey.algorithm.name !== "ES256") {
    throw new HttpError("Invalid public key algorithm", 400);
  }

  const key = parseCoseKey(attestedCredentialData.credentialPublicKey);
  if (key.kty !== COSEKeyType.EC2) {
    throw new HttpError("Invalid key type", 400);
  }

  const verificationData = concat(
    [0x00],
    authenticatorData.rpIdHash,
    clientDataHash,
    attestedCredentialData.credentialId,
    [0x04],
    key.x,
    key.y
  );
  const publicKey = await cert.publicKey.export();
  const result = await crypto.subtle.verify(
    cert.publicKey.algorithm,
    publicKey,
    attestationStatement.sig,
    verificationData
  );
  if (!result) {
    throw new HttpError("Invalid signature", 401);
  }
}
