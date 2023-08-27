export function atob(str: string) {
  return global.atob(
    str
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(str.length + (-str.length % 4), "=")
  );
}

export function btoa(str: string) {
  return global
    .btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
