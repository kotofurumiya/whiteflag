export class LocalStorage {
  protected _storage: Storage;

  constructor() {
    this._storage = localStorage;
  }

  public has(key: string): boolean {
    return this._storage.getItem(key) !== null;
  }

  public getString(key: string): string {
    const value = this._storage.getItem(key);
    if (value !== null) {
      return value;
    } else {
      throw new Error(`キー ${key} がありません。`);
    }
  }

  public setString(key: string, value: string): void {
    this._storage.setItem(key, value);
  }

  public getJson(key: string): Object {
    const value = this._storage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    } else {
      throw new Error(`キー ${key} がありません。`);
    }
  }

  public setJson(key: string, value: object): void {
    const strValue = JSON.stringify(value);
    this._storage.setItem(key, strValue);
  }
}
