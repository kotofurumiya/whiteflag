export class LocalStorage {
  protected _storage: Storage;

  constructor() {
    this._storage = localStorage;
  }

  public has(key: string): boolean {
    return this._storage.getItem(key) !== null;
  }

  public getJson(key: string): any {
    const value = this._storage.getItem(key);
    return value !== null ? JSON.parse(value) : value;
  }

  public setJson(key: string, value: object): void {
    const strValue = JSON.stringify(value);
    this._storage.setItem(key, strValue);
  }
}
