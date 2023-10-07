import { bufferToBase64url } from "$lib/base64url";
import {
  COSEKeyOperation,
  COSEKeyType,
  type BaseCoseKey,
  COSEAlgorithmIdentifier,
  COSEEllipticCurve,
  type JWK,
} from "./types";

export interface EC2PublicKey<A extends EC2Algorithm = EC2Algorithm>
  extends BaseCoseKey {
  kty: COSEKeyType.EC2;
  alg: A;
  crv: COSEEllipticCurve;
  x: ArrayBuffer;
  y: ArrayBuffer;
}

export type EC2Algorithm =
  | COSEAlgorithmIdentifier.ES256
  | COSEAlgorithmIdentifier.ES384
  | COSEAlgorithmIdentifier.ES512;

export function isEC2PublicKey<A extends EC2Algorithm>(
  key: BaseCoseKey,
  alg?: A
): key is EC2PublicKey<A> {
  return Boolean(
    key.kty === COSEKeyType.EC2 &&
      (!alg || key.alg === alg) &&
      key.key_ops?.includes(COSEKeyOperation.sign) &&
      key.key_ops?.includes(COSEKeyOperation.verify)
  );
}

export function fromEC2PublicKey(key: EC2PublicKey<EC2Algorithm>): JWK {
  return {
    kty: "EC",
    alg: COSEAlgorithmIdentifier[key.alg],
    crv: COSEEllipticCurve[key.crv],
    ext: true,
    key_ops: key.key_ops?.map((op) => COSEKeyOperation[op]),
    x: bufferToBase64url(key.x),
    y: bufferToBase64url(key.y),
  };
}
