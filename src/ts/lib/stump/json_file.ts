import * as fs from 'fs';

export class JsonFile {
  protected _path: string;
  protected _json: object;

  constructor(path: string, defaultValue: object | null = null) {
    this._path = path;
    this._json = this._readJsonFile(defaultValue);
    this.writeJsonFile();
  }

  protected _readJsonFile(defaultValue: object | null = null): object {
    // すでにjsonファイルが存在すれば読み込む。
    if(fs.existsSync(this._path)) {
      const jsonText: string = fs.readFileSync(this._path, 'utf-8' );
      try {
        return JSON.parse(jsonText);
      } catch(e) {
        console.error(`JSONのパースに失敗しました： ${this._path}`);
        return defaultValue ? defaultValue : {};
      }
    }

    // ファイルが無ければ初期値を返す。
    return defaultValue ? defaultValue : {};
  }

  public writeJsonFile() {
    const jsonText: string = JSON.stringify(this._json, null, 2);

    try {
      fs.writeFileSync(this._path, jsonText);
    } catch(e) {
      console.error(`ファイルの書き込みに失敗しました： ${this._path}`);
    }
  }

  public has(key: string) {
    return key in this._json;
  }

  public get(key: string): any {
    return this._json[key];
  }

  public set(key: string, value: any) {
    this._json[key] = value;
  }

  public toString(): string {
    return JSON.stringify(this._json, null, 2);
  }
}
