import { AccountInfo } from '../stump';

export interface MastodonClientInfo {
  readonly clientName: string;
  readonly redirectUris: string;
  readonly scopes: string[];
  readonly website: string | null;
}

export interface MastodonClientAuthInfo {
  readonly id: string;
  readonly clientId: string;
  readonly clientSecret: string;
}

export enum MastodonNotificationType {
  MENTION = 'mention',
  REBLOG = 'reblog',
  FAVOURITE = 'favourite',
  FOLLOW = 'follow'
}

export enum MastodonTimelineType {
  HOME = 'home',
  PUBLIC = 'public',
  TAG = 'tag',
  LIST = 'list',
  ACCOUNT = 'account'
}

export enum MastodonStreamType {
  HOME = 'user',
  PUBLIC = 'public',
  PUBLIC_LOCAL = 'public:local',
  TAG = 'hashtag',
  TAG_LOCAL = 'hashtag:local'
}

export enum MastodonTootVisibilityType {
  DIRECT = 'direct',
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
  PUBLIC = 'public'
}

export interface MastodonAccount {
  readonly id: string;
  readonly username: string;
  readonly acct: string;
  readonly display_name: string;
  readonly locked: boolean;
  readonly created_at: string;
  readonly followers_count: number;
  readonly following_count: number;
  readonly statuses_count: number;
  readonly note: string;
  readonly url: string;
  readonly avatar: string;
  readonly avatar_static: string;
  readonly header: string;
  readonly header_static: string;
  readonly moved: MastodonAccount | null;
}

export interface MastodonEmoji {
  readonly shortcode: string;
  readonly static_url: string;
  readonly url: string;
}

export interface MastodonAttachment {
  readonly id: string;
  readonly type: string; // "image", "video", "gifv", "unknown"
  readonly url: string;
  readonly remote_url: string | null;
  readonly preview_url: string;
  readonly text_url: string | null;
  readonly meta: null | {
    readonly small: string;
    readonly origin: string;
    readonly width?: number;
    readonly height?: number;
    readonly size?: any; // TODO: 型を調べる
    readonly aspect?: number;
    readonly frame_rate?: number;
    readonly duration?: any; // TODO: 型を調べる
    readonly bitrate?: number;
    readonly focus?: { readonly x: number, readonly y: number }
  }
  readonly description: string | null;
}

export interface MastodonMention {
  readonly url: string;
  readonly username: string;
  readonly acct: string;
  readonly id: string;
}

export interface MastodonTag {
  readonly name: string;
  readonly url: string;
}

export interface MastodonNotification {
  readonly id: string;
  readonly type: MastodonNotificationType;
  readonly created_at: string;
  readonly account: MastodonAccount;
  readonly status: MastodonTootStatus | null;
}

export interface MastodonTootStatus {
  readonly id: string;
  readonly uri: string;
  readonly url: string;
  readonly account: MastodonAccount;
  readonly in_reply_to_id: string | null;
  readonly in_reply_to_account_id: string | null;
  readonly reblog: MastodonTootStatus | null;
  readonly content: string;
  readonly created_at: string;
  readonly emojis: MastodonEmoji[];
  readonly reblogs_count: number;
  readonly favourites_count: number;
  readonly reblogged: boolean | null;
  readonly favourited: boolean | null;
  readonly muted: boolean | null;
  readonly sensitive: boolean;
  readonly spoiler_text: string;
  readonly visibility: string;
  readonly media_attachments: MastodonAttachment[];
  readonly mentions: MastodonMention[];
  readonly tags: MastodonTag[];
  readonly application: { readonly name: string, readonly website: string | null } | null;
  readonly language: string | null;
  readonly pinned: boolean | null;
}

export interface MastodonTootPostParams {
  readonly status?: string;
  readonly in_reply_to_id?: number;
  readonly media_ids?: string[];
  readonly sensitive?: boolean;
  readonly spoiler_text?: string;
  readonly visibility?: MastodonTootVisibilityType;
  readonly language?: string;
}

export class MastodonTootPost {
  readonly status: string;
  readonly in_reply_to_id?: number;
  readonly media_ids?: string[];
  readonly sensitive?: boolean;
  readonly spoiler_text?: string;
  readonly visibility?: MastodonTootVisibilityType;
  readonly language?: string;

  constructor(params: MastodonTootPostParams = {}) {
    this.status = 'status' in params ? params.status! : '';

    if(params.in_reply_to_id) { this.in_reply_to_id = params.in_reply_to_id; }
    if(params.media_ids) { this.media_ids = params.media_ids; }
    if(params.sensitive) { this.sensitive = params.sensitive; }
    if(params.spoiler_text) { this.spoiler_text = params.spoiler_text; }
    if(params.visibility) { this.visibility = params.visibility; }
    if(params.language) { this.language = params.language; }
  }
  
  get remainTootLength(): number {
    const maxLength = 500;
    
    let lengthSum = this.status.length;
    if(this.spoiler_text) {
      lengthSum += this.spoiler_text.length;
    }
    
    return maxLength - lengthSum;
  }

  replace(params: MastodonTootPostParams = {}): MastodonTootPost {
    const status = 'status' in params ? params.status : this.status;

    const newTootParams = {
      status
    };

    if(this.in_reply_to_id) { newTootParams['in_reply_to_id'] = this.in_reply_to_id; }
    if(this.media_ids) { newTootParams['media_ids'] = this.media_ids; }
    if(this.sensitive) { newTootParams['sensitive'] = this.sensitive; }
    if(this.spoiler_text) { newTootParams['spoiler_text'] = this.spoiler_text; }
    if(this.visibility) { newTootParams['visibility'] = this.visibility; }
    if(this.language) { newTootParams['language'] = this.language; }

    for(const p in params) {
      if(params.hasOwnProperty(p)) {
        newTootParams[p] = params[p];
      }
    }

    return new MastodonTootPost(newTootParams);
  }
}

export class MastodonClient {
  protected _host: string;
  protected _authInfo: MastodonClientAuthInfo | null;
  protected _accountInfo: AccountInfo | null;

  constructor(host: string, authInfo: MastodonClientAuthInfo | null = null, accountInfo: AccountInfo | null = null) {
    this._host = host;
    this._authInfo = authInfo;
    this._accountInfo = accountInfo;
  }

  // APIを叩いてクライアントを登録する。
  public registerClient(clientInfo: MastodonClientInfo): Promise<MastodonClientAuthInfo> {
    // 登録に必要なデータはclient_name, redirect_uris, scopeの3つ。
    // websiteは任意。
    const formData: FormData = new FormData();
    formData.append('client_name', clientInfo.clientName);
    formData.append('redirect_uris', clientInfo.redirectUris);
    formData.append('scopes', clientInfo.scopes.join(' '));
    if(clientInfo.website) {
      formData.append('website', clientInfo.website);
    }

    // 上記のデータを用いてAPIをPOSTで叩く。
    // id, client_id, client_secretが返ってくるので保持しておく。
    return fetch(`https://${this._host}/api/v1/apps`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    }).then((response) => response.json())
      .then((json) => {
        const authInfo: MastodonClientAuthInfo = {
          id: json.id,
          clientId: json.client_id,
          clientSecret: json.client_secret
        };
        this._authInfo = authInfo;
        return authInfo;
      });
  }

  // アカウント認証用のURLを生成する。
  //
  // リダイレクト先にURLを指定すると、パラメータとしてコードを渡してくれる。
  //     https://example.com/redirect?code=0123456
  // エラーの場合はエラー文字列が渡される。
  //     https://example.com/redirect?error=access_denied
  // リダイレクトしない場合は「urn:ietf:wg:oauth:2.0:oob」を指定する。
  // scopeは「read」「write」「follow」の3種類。
  public createAuthUrl(redirectUri: string, scopeList: string[]): string {
    if(!this._authInfo) {
      throw new Error('クライアントの認証情報がありません。');
    }

    const client_id = 'client_id=' + encodeURIComponent(this._authInfo.clientId);
    const response_type = 'response_type=code';
    const redirect_uri = 'redirect_uri=' + encodeURIComponent(redirectUri);
    const scope = 'scope=' + encodeURIComponent(scopeList.join(' '));

    const params = [client_id, response_type, redirect_uri, scope].join('&');

    return `https://${this._host}/oauth/authorize?${params}`;
  }

  // 認証コードを用いてアクセストークンを取得する。
  public requestAccessToken(code: string): Promise<string> {
    if(!this._authInfo) {
      return Promise.reject('クライアントの認証情報がありません。');
    }

    const formData: FormData = new FormData();
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', 'urn:ietf:wg:oauth:2.0:oob');
    formData.append('client_id', this._authInfo.clientId);
    formData.append('client_secret', this._authInfo.clientSecret);
    formData.append('code', code);

    // 上記のデータを用いてAPIをPOSTで叩く。
    // access_token, token_type, scope, created_atが返ってくる。
    return fetch(`https://${this._host}/oauth/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    }).then((response) => response.json())
      .then((json) => {
        if(json.error) {
          console.error(json.error);
          throw new Error('コード認証に失敗しました。');
        }

        this._accountInfo = {
          host: this._host,
          id: '',
          username: '',
          displayName: '',
          acct: '',
          accessToken: json.access_token
        };

        return json.access_token;
      });
  }

  protected _fetchGetApi(endpoint: string): Promise<any> {
    if(!this._accountInfo || !this._accountInfo.accessToken) {
      return Promise.reject('アカウントの認証情報がありません。');
    }

    return fetch(endpoint, {
      headers: {
        'Authorization': ` Bearer ${this._accountInfo.accessToken}`,
        'Accept': 'application/json'
      }
    }).then((response) => response.json());
  }

  protected _fetchPostApi(endpoint: string, data: FormData): Promise<any> {
    if(!this._accountInfo || !this._accountInfo.accessToken) {
      return Promise.reject('アカウントの認証情報がありません。');
    }

    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': ` Bearer ${this._accountInfo.accessToken}`,
        'Accept': 'application/json'
      },
      body: data
    }).then((response) => response.json());
  }

  // 現在のアカウントの情報を取得する。
  public fetchCurrentAccount(): Promise<MastodonAccount> {
    return this._fetchGetApi(`https://${this._host}/api/v1/accounts/verify_credentials`)
      .then((json) => {
        if('error' in json) {
          throw new Error('Error:' + json.error);
        }

        this._accountInfo = {
          host: this._host,
          id: json.id,
          username: json.username,
          displayName: json.display_name,
          acct: json.acct,
          accessToken: this._accountInfo!.accessToken
        };

        return json;
      });
  }

  public fetchAccount(id: number): Promise<MastodonAccount> {
    return this._fetchGetApi(`https://${this._host}/api/v1/accounts/${id}`)
      .then((json) => {
        if('error' in json) {
          throw new Error(json.error);
        }

        return json;
      });
  }

  public fetchTimeline(timelineType: MastodonTimelineType, query: object = {}): Promise<object> {
    const params = new URLSearchParams();
    for(const [key, value] of Object.entries(query)) {
      params.append(key, value);
    }

    const paramStr = params.toString();

    switch(timelineType) {
      case MastodonTimelineType.HOME:
        return this._fetchGetApi(`https://${this._host}/api/v1/timelines/home?${paramStr}`);
      case MastodonTimelineType.PUBLIC:
        return this._fetchGetApi(`https://${this._host}/api/v1/timelines/public?${paramStr}`);
      case MastodonTimelineType.ACCOUNT:
        return this._fetchGetApi(`https://${this._host}/api/v1/accounts/${query['id']}/statuses?${paramStr}`);
      case MastodonTimelineType.TAG:
        return this._fetchGetApi(`https://${this._host}/api/v1/timelines/tag/${query['tag']}`);
      default:
        throw new Error(`無効なタイムラインタイプ：${timelineType}。`)
    }
  }

  public uploadMedia(file: File): Promise<MastodonAttachment> {
    const data = new FormData();
    data.append('file', file);

    return this._fetchPostApi(`https://${this._host}/api/v1/media`, data)
      .then((json) => {
        if('error' in json) {
          throw new Error(json.error);
        }

        return json;
      });
  }

  public postToot(toot: MastodonTootPost): Promise<MastodonTootStatus> {
    const data = new FormData();
    data.append('status', toot.status);

    if(toot.in_reply_to_id) {
      data.append('in_reply_to_id', toot.in_reply_to_id.toString());
    }

    if(toot.media_ids) {
      for(const mediaId of toot.media_ids) {
        data.append('media_ids[]', mediaId);
        console.log('media_ids[]=', mediaId);
      }
    }

    if(toot.sensitive) {
      data.append('sensitive', toot.sensitive.toString());
    }

    if(toot.spoiler_text) {
      data.append('spoiler_text', toot.spoiler_text)
    }

    if(toot.visibility) {
      data.append('visibility', toot.visibility);
    }

    return this._fetchPostApi(`https://${this._host}/api/v1/statuses`, data)
      .then((json) => {
        if('error' in json) {
          throw new Error(json.error);
        }

        return json;
      });
  }

  public favouriteToot(id: string): Promise<MastodonTootStatus> {
    return this._fetchPostApi(`https://${this._host}/api/v1/statuses/${id}/favourite`, new FormData());
  }

  public unfavouriteToot(id: string): Promise<MastodonTootStatus> {
    return this._fetchPostApi(`https://${this._host}/api/v1/statuses/${id}/unfavourite`, new FormData());
  }

  public boostToot(id: string): Promise<MastodonTootStatus> {
    return this._fetchPostApi(`https://${this._host}/api/v1/statuses/${id}/reblog`, new FormData());
  }

  public unboostToot(id: string): Promise<MastodonTootStatus> {
    return this._fetchPostApi(`https://${this._host}/api/v1/statuses/${id}/unreblog`, new FormData());
  }

  // typeはpublic, public:local, user, hashtag, hashtag:local
  public createWebSocketConnection(type: MastodonStreamType, query: object = {}): WebSocket {
    if(!this._accountInfo) {
      throw new Error('アカウントの認証情報がありません。');
    }

    const params = new URLSearchParams();
    for(const [key, value] of Object.entries(query)) {
      params.append(key, value);
    }

    const paramStr = params.toString();

    const token = this._accountInfo.accessToken;
    return new WebSocket(`wss://${this._host}/api/v1/streaming?access_token=${token}&stream=${type}&${paramStr}`);
  }

  public get accountInfo(): AccountInfo | null {
    return this._accountInfo;
  }
}
