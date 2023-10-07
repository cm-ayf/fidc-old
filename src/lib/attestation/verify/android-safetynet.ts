import type { AttestedCredentialData } from "../authenticator";
import type { AttestationStatement } from "../types";

export async function verifyAttestationAndroidSafetynet(
  _attestationStatement: AttestationStatement<"android-safetynet">,
  _attestedCredentialData: AttestedCredentialData,
  _signatureBase: ArrayBuffer
) {
  throw new Error("Not implemented");
}
