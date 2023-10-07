export interface AuthenticatorData {
  rpIdHash: ArrayBuffer;
  flags: {
    userPresent: boolean;
    userVerified: boolean;
  };
  counter: number;
  attestedCredentialData?: AttestedCredentialData;
}

export interface AttestedCredentialData {
  aaguid: ArrayBuffer;
  credentialId: ArrayBuffer;
  credentialPublicKey: ArrayBuffer;
}

export function parseAuthenticatorData(buffer: ArrayBuffer): AuthenticatorData {
  const rpIdHash = buffer.slice(0, 32);
  const view = new DataView(buffer, 32);
  const flags = view.getUint8(0);
  const counter = view.getUint32(1, false);

  const userPresent = Boolean(flags & (1 << 0));
  const userVerified = Boolean(flags & (1 << 2));
  const attestedCredentialData = Boolean(flags & (1 << 6));

  return {
    rpIdHash,
    flags: { userPresent, userVerified },
    counter,
    ...(attestedCredentialData &&
      parseAttestedCredentialData(buffer.slice(37))),
  };
}

function parseAttestedCredentialData(
  buffer: ArrayBuffer
): AttestedCredentialData {
  const view = new DataView(buffer);
  const aaguid = buffer.slice(0, 16);
  const credentialIdLength = view.getUint16(16, false);
  const credentialId = buffer.slice(18, 18 + credentialIdLength);
  const credentialPublicKey = buffer.slice(18 + credentialIdLength);

  return { aaguid, credentialId, credentialPublicKey };
}
