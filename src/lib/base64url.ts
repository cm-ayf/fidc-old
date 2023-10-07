export function atob(str: string) {
  return globalThis.atob(
    str
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(str.length + (-str.length % 4), "=")
  );
}

export function btoa(str: string) {
  return globalThis
    .btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function base64urlToBuffer(str: string) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0)).buffer;
}

export function bufferToBase64url(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
