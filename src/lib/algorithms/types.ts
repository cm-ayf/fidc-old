export enum COSEAlgorithmIdentifier {
  ES256 = -7,
  ES384 = -35,
  ES512 = -36,
  EdDSA = -8,
}

export enum COSEKeyType {
  OKP = 1,
  EC2 = 2,
  Symmetric = 4,
}

export enum COSEKeyOperation {
  sign = 1,
  verify = 2,
  encrypt = 3,
  decrypt = 4,
  "wrap key" = 5,
  "unwrap key" = 6,
  "derive key" = 7,
  "derive bits" = 8,
  "MAC create" = 9,
  "MAC verify" = 10,
}

export enum COSEEllipticCurve {
  "P-256" = 1,
  "P-384" = 2,
  "P-521" = 3,
  X25519 = 4,
  X448 = 5,
  Ed25519 = 6,
  Ed448 = 7,
}

export interface BaseCoseKey {
  kty: COSEKeyType;
  kid?: ArrayBuffer;
  alg?: COSEAlgorithmIdentifier;
  key_ops?: COSEKeyOperation[];
}

export interface JWK extends JsonWebKey {
  alg: string;
}
