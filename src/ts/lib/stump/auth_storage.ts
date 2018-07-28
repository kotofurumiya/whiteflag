import { LocalStorage } from '../stump';

interface AuthInfo {
  host: string;
  id: string;
  clientId: string;
  clientSecret: string;
}

export class AuthStorage {
  protected _storage: LocalStorage;

  constructor() {
    this._storage = new LocalStorage();
  }

  public hasAuth(host: string): boolean {
    const map = this.getAuthMap();
    return host in map;
  }

  public getAuth(host: string): AuthInfo {
    const map = this.getAuthMap();
    return map[host];
  }

  public addAuth(auth: AuthInfo) {
    const map = this.getAuthMap();

    const authIsValid = 'host' in auth && 'id' in auth && 'clientId' in auth && 'clientSecret' in auth;
    if (!authIsValid) {
      return false;
    }

    map[auth.host] = auth;
    this._storage.setJson('auth', map);

    return true;
  }

  public getAuthMap(): Object {
    if (this._storage.has('auth')) {
      return this._storage.getJson('auth');
    } else {
      return {};
    }
  }
}
