import type { IDB } from ".";
import type { Validator } from "lizod";

export default class Model<T extends object, V extends Validator<T>> {
  constructor(public db: IDB, public name: string, public validator: V) {}

  private key(id: string) {
    return `${this.name}:${id}`;
  }

  private grantKey(grantId: string) {
    return `${this.name}/grant:${grantId}`;
  }

  async get(id: string): Promise<T | null> {
    const value = await this.db.kv.get(this.key(id), "json");
    if (!value) return null;
    if (!this.validator(value)) throw new Error("Invalid value");
    return value;
  }

  async deleteByGrantId(grantId: string): Promise<void> {
    const id = await this.db.kv.get(this.grantKey(grantId));
    if (id) await this.delete(id);
  }

  async put(id: string, value: T, expirationTtl?: number): Promise<void> {
    if (!this.validator(value)) throw new Error("Invalid value");
    const grantId =
      "grant_id" in value && typeof value.grant_id === "string"
        ? value.grant_id
        : undefined;

    await Promise.all([
      this.db.kv.put(this.key(id), JSON.stringify(value), { expirationTtl }),
      grantId && this.db.kv.put(this.grantKey(grantId), id, { expirationTtl }),
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.db.kv.delete(this.key(id));
  }
}
