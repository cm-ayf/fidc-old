import { X509Certificate } from "@peculiar/x509";
import { parseCoseKey, toCryptoKey } from "$lib/algorithms";
import { COSEAlgorithmIdentifier } from "$lib/algorithms/types";
import { HttpError } from "$lib/error";
import type { AttestationStatement } from "../types";
import type { AttestedCredentialData } from "../authenticator";

export async function verifyAttestationPacked(
  attestationStatement: AttestationStatement<"packed">,
  attestedCredentialData: AttestedCredentialData,
  signatureBase: ArrayBuffer
) {
  if (attestationStatement.x5c) {
    if (!attestationStatement.x5c[0]) {
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

    verifyCertificateRequirements(
      cert,
      new Uint8Array(attestedCredentialData.aaguid)
    );
  } else {
    const coseKey = parseCoseKey(attestedCredentialData.credentialPublicKey);
    if (coseKey.alg !== attestationStatement.alg) {
      throw new HttpError("Algorithm mismatch", 400);
    }
    const key = await toCryptoKey(coseKey);
    const result = await crypto.subtle.verify(
      COSEAlgorithmIdentifier[attestationStatement.alg],
      key,
      attestationStatement.sig,
      signatureBase
    );
    if (!result) throw new HttpError("Invalid signature", 401);
  }
}

function verifyCertificateRequirements(
  cert: X509Certificate,
  aaguid: Uint8Array
) {
  const c = cert.subjectName.getField("C");
  const o = cert.subjectName.getField("O");
  const ou = cert.subjectName.getField("OU");
  const cn = cert.subjectName.getField("CN");
  if (!c[0] || !o[0] || ou[0] !== "Authenticator Attestation" || !cn[0])
    throw new HttpError("Subject invalid", 400);

  const aaguidExtension = cert.getExtension("1.3.6.1.4.1.45724.1.1.4");
  if (!aaguidExtension || aaguidExtension.critical)
    throw new HttpError("AAGUID extension not found", 400);
  if (
    aaguidExtension.value.byteLength !== 16 ||
    !new Uint8Array(aaguidExtension.value).every(
      (byte, i) => byte === aaguid[i]
    )
  )
    throw new HttpError("AAGUID extension invalid", 400);
}
