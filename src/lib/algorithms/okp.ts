import { bufferToBase64url } from "$lib/base64url";
import {
  COSEKeyType,
  type BaseCoseKey,
  COSEAlgorithmIdentifier,
  COSEEllipticCurve,
  COSEKeyOperation,
  type JWK,
} from "./types";

export interface OKPPublicKey<A extends OKPAlgorithm = OKPAlgorithm>
  extends BaseCoseKey {
  kty: COSEKeyType.OKP;
  alg: A;
  crv: COSEEllipticCurve;
  x: ArrayBuffer;
}

export type OKPAlgorithm = COSEAlgorithmIdentifier.EdDSA;

export function isOKPPublicKey<A extends OKPAlgorithm>(
  key: BaseCoseKey,
  alg?: A
): key is OKPPublicKey<A> {
  return Boolean(
    key.kty === COSEKeyType.OKP &&
      "crv" in key &&
      typeof key.crv === "number" &&
      key.crv in COSEEllipticCurve &&
      (!alg || key.alg === alg) &&
      key.key_ops?.includes(COSEKeyOperation.sign) &&
      key.key_ops?.includes(COSEKeyOperation.verify)
  );
}

export function fromOKPPublicKey(key: OKPPublicKey<OKPAlgorithm>): JWK {
  return {
    kty: "OKP",
    alg: COSEAlgorithmIdentifier[key.alg],
    crv: COSEEllipticCurve[key.crv],
    ext: true,
    key_ops: key.key_ops?.map((op) => COSEKeyOperation[op]),
    x: bufferToBase64url(key.x),
  };
}
