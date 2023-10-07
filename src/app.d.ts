import type { KVNamespace } from "@cloudflare/workers-types";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      status: "failed";
      errorMessage: string;
    }
    // interface Locals {}
    // interface PageData {}
    interface Platform {
      KV: KVNamespace;
    }
  }
}

export {};
