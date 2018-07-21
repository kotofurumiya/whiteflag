import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';

import { AccountInfo, AccountStorage, MastodonAccount, MastodonTootPost, MastodonUserNotification } from '../lib/stump';
import { Column } from '../components/Column';
import { Sidebar } from '../components/Sidebar';
import { TootBar } from '../components/TootBar';

import { fetchAccount, fetchToots, receiveEvent, updateAccountInfoList } from '../actions/mastodon';
import {
  convertColumnTypeToStreamType,
  convertColumnTypeToTimelineType, convertColumnTypeToTitle,
  Whiteflag,
  WhiteflagColumn,
  WhiteflagColumnType, WhiteflagTootMode
} from '../lib/whiteflag';
import {
  addColumn,
  changeConnectionState,
  changeMainColumn,
  connectColumnToStream, removeColumn,
  updateCurrentDate
} from '../actions/whiteflag';

interface AppProps {
  readonly mainColumn: WhiteflagColumn;
  readonly notificationColumn: WhiteflagColumn;
  readonly columnList: WhiteflagColumn[];
  readonly currentDate: Date;
  readonly accountInfoList: AccountInfo[];
  readonly currentAccount: MastodonAccount;
  readonly tootMode: WhiteflagTootMode;
  readonly changeMainColumnType: (type: WhiteflagColumnType, query: any) => any;
  readonly dispatch: Redux.Dispatch;
}

interface AppState {
  readonly whiteflagData: any;
  readonly accountData: any;
}

class _App extends React.Component<AppProps> {
  protected _accountStorage: AccountStorage;
  protected _whiteflag: Whiteflag | null;
  protected _nextColumnId: number;

  protected _mediaDialogRef: React.RefObject<HTMLDialogElement>;

  protected _showMediaBound: (url: string, type: string) => any;
  protected _closeMediaBound: () => any;
  protected _addColumnBound: (type: WhiteflagColumnType, query: any) => any;
  protected _removeColumnBound: (columnId: string) => any;
  protected _postTootBound: (toot: MastodonTootPost) => Promise<any>;

  constructor(props: AppProps) {
    super(props);
    this._accountStorage = new AccountStorage();
    const accountList = this._accountStorage.getAccountList();
    this._whiteflag = null;
    this._nextColumnId = 0;

    this._mediaDialogRef = React.createRef();

    this._showMediaBound = this._showMedia.bind(this);
    this._closeMediaBound = this._closeMedia.bind(this);
    this._addColumnBound = this._addColumn.bind(this);
    this._removeColumnBound = this._removeColumn.bind(this);
    this._postTootBound = this._postToot.bind(this);

    setInterval(() => {
      this.props.dispatch(updateCurrentDate(new Date()));
    }, 1000);

    if(accountList.length > 0) {
      const whiteflag = new Whiteflag(accountList[0].host);
      this._whiteflag = whiteflag;
      this.props.dispatch(updateAccountInfoList(accountList));
      this.props.dispatch(addColumn('Local Timeline', WhiteflagColumnType.PUBLIC_LOCAL, this._generateNextColumnId(), {local: true}));
      this.props.dispatch(fetchAccount(whiteflag));
    }
  }

  protected _generateNextColumnId(): string {
    const next = this._nextColumnId.toString();
    this._nextColumnId += 1;
    return next;
  }

  protected _showMedia(url: string, type: string) {
    const dialog = this._mediaDialogRef.current;
    if(dialog) {
      const contentElement = dialog.querySelector('.media-dialog-content') as HTMLDivElement;
      if(type === 'video') {
        contentElement.innerHTML = `<video src=${url} controls>`;
      } else {
        contentElement.innerHTML = `<img src=${url}>`;
      }

      dialog.showModal();
    }
  }

  protected _closeMedia() {
    const dialog = this._mediaDialogRef.current;
    if(dialog && dialog.open) {
      const contentElement = dialog.querySelector('.media-dialog-content') as HTMLDivElement;
      contentElement.innerHTML = '';
      dialog.close();
    }
  }

  protected _addColumn(columnType: WhiteflagColumnType, query: any = {}) {
    const title = convertColumnTypeToTitle(columnType);
    this.props.dispatch(addColumn(title, columnType, this._generateNextColumnId(), query));
  }

  protected _removeColumn(columnId: string) {
    this.props.dispatch(removeColumn(columnId));
  }

  protected _postToot(toot: MastodonTootPost): Promise<any> {
    if(this._whiteflag) {
      return this._whiteflag.postToot(toot);
    }

    return Promise.reject('whiteflagが初期化されていません。');
  }

  // componentDidUpdateでdispatchすると再帰的にcomponentDidUpdateが走り、条件によっては無限ループになるので注意。
  // static getDerivedStateFromPropsに処理を移すべきかもしれない。
  componentDidUpdate(prevProps: AppProps, prevState: AppState) {
    if(this.props.accountInfoList.length > 0) {

      for(const column of [this.props.mainColumn, this.props.notificationColumn, ...this.props.columnList]) {
        const isNotWhiteflagColumn = !column.columnType.startsWith('whiteflag:');
        const supportsStreaming = column.columnType !== WhiteflagColumnType.ACCOUNT &&
                                  column.columnType !== WhiteflagColumnType.CURRENT_ACCOUNT;
        const needsConnect = column.stream.state === 'uninitialized' || column.stream.state === 'disconnected';

        // Whiteflag独自カラムではない（タイムライン表示カラムである）かつ
        // ストリーミングに対応しているかつ
        // コネクションを張る必要がある時は、ストリームにつなぎに行く。
        if (isNotWhiteflagColumn && supportsStreaming && needsConnect) {
          this.props.dispatch(changeConnectionState(column.columnId, null, 'connecting'));
          const streamType = convertColumnTypeToStreamType(column.columnType);
          this.props.dispatch(connectColumnToStream(this._whiteflag!, column.columnId, streamType, column.stream.query));
        }

        // ストリームに接続済みの場合、メッセージを受信したときに
        // イベントをカラムに伝える。
        if (column.stream.state === 'connected') {
          this.props.dispatch(changeConnectionState(column.columnId, column.stream.webSocket, 'listening'));
          column.stream.webSocket!.addEventListener('message', (message) => {
            const data = JSON.parse(message.data);
            const eventType = data.event;
            const payload = JSON.parse(data.payload);

            // notificationの場合は通知を表示する。
            if(column.columnId === this.props.notificationColumn.columnId) {
              if(eventType === 'notification') {
                const notification = new MastodonUserNotification(payload);
              }
            } else {
              this.props.dispatch(receiveEvent(column.columnId, eventType, payload));
            }
          });

          // 接続が切れたら状態をdisconnectedにする。
          column.stream.webSocket!.addEventListener('close', (evt: CloseEvent) => {
            // 正常終了ではない場合のみ。
            if(!evt.wasClean) {
              this.props.dispatch(changeConnectionState(column.columnId,null, 'disconnected'));
            }
          });

          column.stream.webSocket!.addEventListener('error', (evt) => {
            this.props.dispatch(changeConnectionState(column.columnId,null, 'disconnected'));
          });
        }
      }
    }
  }

  render() {
    const accountList = this._accountStorage.getAccountList();

    if(accountList.length > 0) {
      const columns = [this.props.mainColumn, ...this.props.columnList].map((cData) => {
        let onInit;

        if (cData.columnType === WhiteflagColumnType.WHITEFLAG_TOOT || cData.columnType === WhiteflagColumnType.WHITEFLAG_COLUMN) {
          onInit = () => {};
        } else {
          const timelineType = convertColumnTypeToTimelineType(cData.columnType);
          onInit = () => this.props.dispatch(fetchToots(this._whiteflag!, cData.columnId, timelineType, cData.query));
        }

        return (
          <Column
            key={cData.columnId}
            title={cData.title}
            columnId={cData.columnId}
            columnType={cData.columnType}
            query={cData.query}
            tootList={cData.tootList}
            currentDate={this.props.currentDate}
            status={cData.stream.state}
            showMedia={this._showMediaBound}
            addColumn={this._addColumnBound}
            removeColumn={this._removeColumnBound}
            postToot={this._postTootBound}
            columnList={this.props.columnList}
            onInit={onInit}
          />
        );
      });

      return (
        <div className="whiteflag">
          <Sidebar
            mainColumn={this.props.mainColumn}
            currentAccount={this.props.currentAccount}
            selectedColumnType={this.props.mainColumn.columnType}
            changeMainColumnType={this.props.changeMainColumnType}
          />

          <main className="main-container">
            <div className="columns-container">
              {columns}
            </div>
            {this.props.tootMode === WhiteflagTootMode.BAR_UNDER ? <TootBar postToot={this._postTootBound}/> : undefined}
          </main>

          <dialog className="media-dialog" onClick={this._closeMediaBound} ref={this._mediaDialogRef}>
            <div className="media-dialog-content"/>
          </dialog>
        </div>
      );
    }

    return (
      <div className="no-account-page">
        <div className="no-account-container">
          <h1>アカウントを追加してください</h1>
          <a className="button" href="register.html">アカウントを追加する</a>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: AppState): object {
  return {
    mainColumn: state.whiteflagData.mainColumn,
    notificationColumn: state.whiteflagData.notificationColumn,
    columnList: state.whiteflagData.columnList,
    currentDate: state.whiteflagData.currentDate,
    accountInfoList: state.accountData.accountInfoList,
    currentAccount: state.accountData.currentAccount,
    tootMode: state.whiteflagData.tootMode
  };
}

function mapDispatchToProps(dispatch: Redux.Dispatch): object {
  return {
    changeMainColumnType: (type: WhiteflagColumnType, query: any = {}) => {
      if(type === WhiteflagColumnType.PUBLIC_LOCAL) {
        query['local'] = true;
      } else if(type === WhiteflagColumnType.HASHTAG_STUMP) {
        query['tag'] = '切り株';
      } else if(type === WhiteflagColumnType.HASHTAG_FLAG) {
        query['tag'] = '旗';
      }

      dispatch(changeMainColumn(type, query));
    },

    dispatch
  }
}

export const App = connect(mapStateToProps, mapDispatchToProps)(_App);
