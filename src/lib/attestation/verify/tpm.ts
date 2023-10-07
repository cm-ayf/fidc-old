import type { AttestedCredentialData } from "../authenticator";
import type { AttestationStatement } from "../types";

export async function verifyAttestationTpm(
  _attestationStatement: AttestationStatement<"tpm">,
  _attestedCredentialData: AttestedCredentialData,
  _signatureBase: ArrayBuffer
) {
  throw new Error("Not implemented");
}
