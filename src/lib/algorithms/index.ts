import { decode } from "$lib/cbor";
import { HttpError } from "$lib/error";
import { COSEKeyType, type JWK } from "./types";
import { fromEC2PublicKey, isEC2PublicKey, type EC2PublicKey } from "./ec2";
import { fromOKPPublicKey, isOKPPublicKey, type OKPPublicKey } from "./okp";

export type CoseKey = EC2PublicKey | OKPPublicKey;

export function parseCoseKey(key: ArrayBuffer): CoseKey {
  const decoded = decode(key);
  switch (decoded.kty) {
    case COSEKeyType.EC2:
      if (!isEC2PublicKey(decoded)) throw new HttpError("Invalid EC2 key", 400);
      return decoded;
    case COSEKeyType.OKP:
      if (!isOKPPublicKey(decoded)) throw new HttpError("Invalid OKP key", 400);
      return decoded;
    case COSEKeyType.Symmetric:
      throw new HttpError("Symmetric keys are not supported", 400);
    default:
      throw new HttpError("Invalid key type", 400);
  }
}

export function toJWK(key: CoseKey): JWK {
  switch (key.kty) {
    case COSEKeyType.EC2:
      return fromEC2PublicKey(key);
    case COSEKeyType.OKP:
      return fromOKPPublicKey(key);
  }
}

export async function toCryptoKey(coseKey: CoseKey): Promise<CryptoKey> {
  const jwk = toJWK(coseKey);
  return await crypto.subtle.importKey("jwk", jwk, jwk.alg, false, [
    "sign",
    "verify",
  ]);
}
