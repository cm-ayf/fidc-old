export type AttestationObject<
  Format extends keyof AttestationFormatMap = keyof AttestationFormatMap
> = Format extends keyof AttestationFormatMap
  ? {
      authData: ArrayBuffer;
      fmt: Format;
      attStmt: AttestationFormatMap[Format];
    }
  : never;

interface AttestationFormatMap {
  packed: {
    alg: number;
    sig: ArrayBuffer;
    x5c?: ArrayBuffer[];
    ecdaaKeyId?: ArrayBuffer;
  };
  "android-key": {
    alg: number;
    sig: ArrayBuffer;
    x5c?: ArrayBuffer[];
  };
  tpm: {
    alg: number;
    sig: ArrayBuffer;
    x5c?: ArrayBuffer[];
    ecdaaKeyId?: ArrayBuffer;
    certInfo: ArrayBuffer;
    pubArea: ArrayBuffer;
  };
  "fido-u2f": {
    x5c?: ArrayBuffer[];
    sig: ArrayBuffer;
  };
  "android-safetynet": {
    ver: string;
    response: ArrayBuffer;
  };
}

export interface AuthenticatorData {
  rpIdHash: ArrayBuffer;
  flags: {
    userPresent: boolean;
    userVerified: boolean;
  };
  counter: number;
  attestedCredentialData?: {
    aaguid: ArrayBuffer;
    credentialId: ArrayBuffer;
    credentialPublicKey: ArrayBuffer;
  };
}

export function parseAuthenticatorData(buffer: ArrayBuffer): AuthenticatorData {
  const rpIdHash = buffer.slice(0, 32);
  const view = new DataView(buffer, 32);
  const flags = view.getUint8(0);
  const counter = view.getUint32(1, false);

  const userPresent = Boolean(flags & (1 << 0));
  const userVerified = Boolean(flags & (1 << 2));
  const attestedCredentialData = Boolean(flags & (1 << 6));

  const authenticatorData: AuthenticatorData = {
    rpIdHash,
    flags: { userPresent, userVerified },
    counter,
  };

  if (attestedCredentialData) {
    const aaguid = buffer.slice(37, 53);
    const credentialIdLength = view.getUint16(53, false);
    const credentialId = buffer.slice(55, 55 + credentialIdLength);
    const credentialPublicKey = buffer.slice(55 + credentialIdLength);

    authenticatorData.attestedCredentialData = {
      aaguid,
      credentialId,
      credentialPublicKey,
    };
  }

  return authenticatorData;
}
