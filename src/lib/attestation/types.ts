export type AttestationObject<
  Format extends AttestationFormat = AttestationFormat
> = Format extends AttestationFormat
  ? {
      authData: ArrayBuffer;
      fmt: Format;
      attStmt: AttestationStatement<Format>;
    }
  : never;

export type AttestationStatement<Format extends AttestationFormat> = Pick<
  BaseAttestationStatement,
  AttestationFormatMap[Format]
>;

interface BaseAttestationStatement {
  alg: number;
  sig: ArrayBuffer;
  x5c?: ArrayBuffer[];
  ecdaaKeyId?: ArrayBuffer;
  certInfo: ArrayBuffer;
  pubArea: ArrayBuffer;
  ver: string;
  response: ArrayBuffer;
}

interface AttestationFormatMap {
  packed: "alg" | "sig" | "x5c" | "ecdaaKeyId";
  "android-key": "alg" | "sig" | "x5c";
  tpm: "alg" | "sig" | "x5c" | "ecdaaKeyId" | "certInfo" | "pubArea";
  "fido-u2f": "x5c" | "sig";
  "android-safetynet": "ver" | "response";
  none: never;
}

export type AttestationFormat = keyof AttestationFormatMap;
