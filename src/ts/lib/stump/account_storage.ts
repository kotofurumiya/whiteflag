import { LocalStorage } from '../stump';

export interface AccountInfo {
  host: string,
  id: string,
  username: string,
  displayName: string,
  acct: string
  accessToken: string
}

export class AccountStorage {
  protected _storage: LocalStorage;

  constructor() {
    this._storage = new LocalStorage();
  }

  public addAccount(account: AccountInfo) {
    const list = this.getAccountList();
    list.push(account);
    this._storage.setJson('accounts', list);
  }

  public removeAccountByIndex(index: number) {
    const list = this.getAccountList();
    if(index < 0 || index > list.length) {
      return;
    }

    list.splice(index, 1);
    this._storage.setJson('accounts', list);
  }

  public updateAccountByToken(token: string, newData: AccountInfo) {
    const list = this.getAccountList();
    const account = list.find((a) => a.accessToken === token);
    Object.assign(account, newData);
  }

  public getAccountList(): AccountInfo[] {
    if(this._storage.has('accounts')) {
      return this._storage.getJson('accounts') as AccountInfo[];
    } else {
      return [];
    }
  }
}
