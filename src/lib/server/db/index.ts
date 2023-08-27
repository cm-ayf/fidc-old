import type { KVNamespace } from "@cloudflare/workers-types";
import Model from "./model";
import { user } from "./models/user";

export interface IDB {
  kv: KVNamespace;
}

export default class DB implements IDB {
  user = new Model(this, "user", user);

  constructor(public kv: KVNamespace) {}
}
