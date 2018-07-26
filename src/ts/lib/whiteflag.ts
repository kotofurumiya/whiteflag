import {
  MastodonClient, AuthStorage, AccountStorage,
  MastodonClientInfo, MastodonClientAuthInfo, AccountInfo, MastodonAccount, MastodonTootStatus, MastodonAttachment
} from './stump';
import {MastodonStreamType, MastodonTimelineType, MastodonTootPost} from './stump/mastodon';

export enum WhiteflagColumnType {
  WHITEFLAG_TOOT = 'whiteflag:toot',
  WHITEFLAG_COLUMN = 'whiteflag:column',
  WHITEFLAG_PREFERENCES = 'whiteflag:preferences',
  HOME = 'home',
  PUBLIC = 'public',
  PUBLIC_LOCAL = 'public:local',
  ACCOUNT = 'account',
  CURRENT_ACCOUNT = 'account:current',
  HASHTAG_STUMP = 'hashtag:local:stump',
  HASHTAG_FLAG = 'hashtag:local:flag'
}

export interface WhiteflagColumn {
  readonly columnId: string;
  readonly columnType: WhiteflagColumnType;
  readonly title: string;
  readonly query: object;
  readonly isInitialized: boolean;
  readonly stream: {
    readonly webSocket: WebSocket | null,
    readonly query: object;
    readonly state: string
  }
  readonly tootList: MastodonTootStatus[];
}

export enum WhiteflagTootMode {
  COLUMN = 'column',
  BAR_UNDER = 'bar_under'
}

export class Whiteflag {
  protected _host: string;
  protected _clientInfo: MastodonClientInfo;
  protected _client: MastodonClient;
  protected _authStorage: AuthStorage;
  protected _accountStorage: AccountStorage;

  constructor(host: string) {
    this._host = host;

    this._clientInfo = {
      clientName: 'Whiteflag',
      redirectUris: 'urn:ietf:wg:oauth:2.0:oob',
      scopes: ['read', 'write', 'follow'],
      website: 'https://sbfl.net/app/whiteflag/',
    };

    this._authStorage = new AuthStorage();
    const hasAuth = this._authStorage.hasAuth(host);
    const auth = hasAuth ? this._authStorage.getAuth(host) : undefined;

    this._accountStorage = new AccountStorage();
    const accountList = this._accountStorage.getAccountList();
    const account = accountList.length > 0 ? accountList[0] : undefined;

    this._client = new MastodonClient(host, auth, account);
  }

  public get isRegistered(): boolean {
    return this._authStorage.hasAuth(this._host);
  }

  public get isNotRegistered(): boolean {
    return !this.isRegistered;
  }

  public registerClient(): Promise<boolean> {
    return this._client.registerClient(this._clientInfo)
      .then((auth: MastodonClientAuthInfo) => {
        return this._authStorage.addAuth({
          host: this._host,
          ...auth
        });
      });
  }

  public createAuthUrl(redirectUri: string = 'urn:ietf:wg:oauth:2.0:oob'): string {
    return this._client.createAuthUrl(redirectUri, ['read', 'write', 'follow']);
  }

  public authUser(code: string): Promise<boolean> {
    return this._client.requestAccessToken(code)
      .then((accessToken: string) => {
        return this.fetchCurrentAccount();
      })
      .then((account: MastodonAccount) => {
        this._accountStorage.addAccount(this._client.accountInfo!);
        return true;
      });
  }

  public fetchCurrentAccount(): Promise<MastodonAccount> {
    return this._client.fetchCurrentAccount();
  }

  public fetchAccount(id: number): Promise<MastodonAccount> {
    return this._client.fetchAccount(id);
  }

  public fetchTimeline(timelineType: MastodonTimelineType, query: object = []): Promise<object> {
    return this._client.fetchTimeline(timelineType, query);
  }

  public uploadMedia(file: File): Promise<MastodonAttachment> {
    return this._client.uploadMedia(file);
  }

  public postToot(toot: MastodonTootPost): Promise<MastodonTootStatus> {
    return this._client.postToot(toot);
  }

  public favouriteToot(tootId: string): Promise<MastodonTootStatus> {
    return this._client.favouriteToot(tootId);
  }

  public unfavouriteToot(tootId: string): Promise<MastodonTootStatus> {
    return this._client.unfavouriteToot(tootId);
  }

  public boostToot(tootId: string): Promise<MastodonTootStatus> {
    return this._client.boostToot(tootId);
  }

  public unboostToot(tootId: string): Promise<MastodonTootStatus> {
    return this._client.unboostToot(tootId);
  }

  public connectTimeline(type: MastodonStreamType, query: object = {}): WebSocket {
    return this._client.createWebSocketConnection(type, query);
  }
}

export function convertColumnTypeToStreamType(columnType: WhiteflagColumnType): MastodonStreamType {
  switch(columnType) {
    case WhiteflagColumnType.HOME:
      return MastodonStreamType.HOME;

    case WhiteflagColumnType.PUBLIC:
      return MastodonStreamType.PUBLIC;

    case WhiteflagColumnType.PUBLIC_LOCAL:
      return MastodonStreamType.PUBLIC_LOCAL;

    case WhiteflagColumnType.HASHTAG_STUMP:
      return MastodonStreamType.TAG_LOCAL;

    case WhiteflagColumnType.HASHTAG_FLAG:
      return MastodonStreamType.TAG_LOCAL;

    default:
      throw new Error(`カラムタイプ${columnType}に該当するストリームタイプがありません。`);
  }
}
export function convertColumnTypeToTimelineType(columnType: WhiteflagColumnType): MastodonTimelineType {
  switch(columnType) {
    case WhiteflagColumnType.HOME:
      return MastodonTimelineType.HOME;

    case WhiteflagColumnType.PUBLIC:
      return MastodonTimelineType.PUBLIC;

    case WhiteflagColumnType.PUBLIC_LOCAL:
      return MastodonTimelineType.PUBLIC;

    case WhiteflagColumnType.ACCOUNT:
      return MastodonTimelineType.ACCOUNT;

    case WhiteflagColumnType.CURRENT_ACCOUNT:
      return MastodonTimelineType.ACCOUNT;

    case WhiteflagColumnType.HASHTAG_STUMP:
      return MastodonTimelineType.TAG;

    case WhiteflagColumnType.HASHTAG_FLAG:
      return MastodonTimelineType.TAG;

    default:
      throw new Error(`カラムタイプ${columnType}に該当するタイムラインタイプがありません。`);
  }
}

export function convertColumnTypeToTitle(columnType: WhiteflagColumnType, query: any = {}): string {
  switch(columnType) {
    case WhiteflagColumnType.WHITEFLAG_TOOT:
      return 'Toot';

    case WhiteflagColumnType.WHITEFLAG_COLUMN:
      return 'Columns';

    case WhiteflagColumnType.WHITEFLAG_PREFERENCES:
      return 'Preferences';

    case WhiteflagColumnType.HOME:
      return 'Home';

    case WhiteflagColumnType.PUBLIC:
      return 'Public Timeline';

    case WhiteflagColumnType.PUBLIC_LOCAL:
      return 'Local Timeline';

    case WhiteflagColumnType.ACCOUNT: {
      const displayName = 'displayName' in query ? query.displayName : '';
      const acct = 'acct' in query ? query.acct : '';
      return `${displayName}@${acct}`;
    }

    case WhiteflagColumnType.CURRENT_ACCOUNT: {
      const displayName = 'displayName' in query ? query.displayName : '';
      const acct = 'acct' in query ? query.acct : '';
      return `${displayName}@${acct}`;
    }

    case WhiteflagColumnType.HASHTAG_STUMP:
      return '#切り株';

    case WhiteflagColumnType.HASHTAG_FLAG:
      return '#旗';

    default:
      throw new Error(`カラムタイプ${columnType}に該当するタイトルがありません。`);
  }
}

export function cloneColumn(column: WhiteflagColumn): WhiteflagColumn {
  return {
    columnId: column.columnId,
    columnType: column.columnType,
    title: column.title,
    query: column.query,
    isInitialized: column.isInitialized,
    stream: {
      webSocket: column.stream.webSocket,
      query: column.stream.query,
      state: column.stream.state
    },
    tootList: [...column.tootList] // tootはimmutableなのでディープコピー不要。
  };
}
