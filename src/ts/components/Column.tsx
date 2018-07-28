import * as React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { Toot } from './Toot';
import {
  MastodonTootStatus,
  MastodonTootPost,
  MastodonTootPostParams,
  MastodonAttachment
} from '../lib/stump';
import { WhiteflagColumn, WhiteflagColumnType } from '../lib/whiteflag';
import { TootInput } from './TootInput';
import { ChangeEvent } from 'react';

interface ColumnProps {
  title: string;
  columnId: string;
  columnType: WhiteflagColumnType;
  query: object;
  tootList: MastodonTootStatus[];
  currentToot: MastodonTootPost;
  currentAttachments: MastodonAttachment[];
  currentDate: Date;
  themeName: string;
  status: string;
  previousColumn?: WhiteflagColumn;

  favourite: (tootId: string) => Promise<MastodonTootStatus>;
  unfavourite: (tootId: string) => Promise<MastodonTootStatus>;
  boost: (tootId: string) => Promise<MastodonTootStatus>;
  unboost: (tootId: string) => Promise<MastodonTootStatus>;
  showMedia: (url: string, type: string) => any;
  addColumn: (type: WhiteflagColumnType, query: any) => any;
  removeColumn: (id: string) => any;
  changeColumnType: (
    columnId: string,
    columnType: WhiteflagColumnType,
    query?: object
  ) => any;
  changeCurrentToot: (toot: MastodonTootPost) => void;
  changeCurrentAttachments: (attachments: MastodonAttachment[]) => void;
  postToot: (toot: MastodonTootPost) => Promise<MastodonTootStatus>;
  changeTheme: (themeName: string) => any;
  columnList?: WhiteflagColumn[];
}

export class Column extends React.Component<ColumnProps> {
  protected _columnMainRef: React.RefObject<HTMLDivElement>;
  protected _tootInputRef: React.RefObject<HTMLTextAreaElement>;

  protected _selectorRef: React.RefObject<HTMLSelectElement>;
  protected _addButtonRef: React.RefObject<HTMLButtonElement>;
  protected _columnListRef: React.RefObject<HTMLOListElement>;

  protected _scrollToTopListener: (evt: React.MouseEvent<HTMLElement>) => void;
  protected _addColumnListener: (
    evt: React.MouseEvent<HTMLButtonElement>
  ) => void;
  protected _removeColumnListener: (
    evt: React.MouseEvent<HTMLButtonElement>
  ) => void;
  protected _changeColumnTypeListener: (
    columnType: WhiteflagColumnType,
    query?: object
  ) => any;
  protected _backPreviousColumnListener: () => any;
  protected _changeThemeListener: (evt: ChangeEvent<HTMLSelectElement>) => void;

  constructor(props: ColumnProps) {
    super(props);

    this._columnMainRef = React.createRef();
    this._tootInputRef = React.createRef();

    this._selectorRef = React.createRef();
    this._addButtonRef = React.createRef();
    this._columnListRef = React.createRef();

    this._scrollToTopListener = this._scrollToTop.bind(this);
    this._addColumnListener = this._addColumn.bind(this);
    this._removeColumnListener = this._removeColumn.bind(this);
    this._changeColumnTypeListener = this._changeColumnType.bind(this);
    this._backPreviousColumnListener = this._backPreviousColumn.bind(this);
    this._changeThemeListener = this._changeTheme.bind(this);
  }

  protected _scrollToTop(evt: React.MouseEvent<HTMLElement>) {
    const main = this._columnMainRef.current;

    if (main) {
      const topToot = main.querySelector('.toot-container:first-child');
      if (topToot) {
        topToot.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  protected _addColumn(evt: Event) {
    if (this._selectorRef.current) {
      const type = this._selectorRef.current.value as WhiteflagColumnType;

      const query = {};
      if (type === WhiteflagColumnType.PUBLIC_LOCAL) {
        query['local'] = true;
      } else if (type === WhiteflagColumnType.HASHTAG_STUMP) {
        query['tag'] = '切り株';
      } else if (type === WhiteflagColumnType.HASHTAG_FLAG) {
        query['tag'] = '旗';
      }

      this.props.addColumn(type, query);
    }
  }

  protected _removeColumn(evt: React.MouseEvent<HTMLButtonElement>) {
    const removeId = (evt.target as HTMLElement).dataset.columnId;
    if (removeId) {
      this.props.removeColumn(removeId);
    }
  }

  protected _changeColumnType(
    columnType: WhiteflagColumnType,
    query?: object
  ): void {
    this.props.changeColumnType(this.props.columnId, columnType, query);
  }

  protected _backPreviousColumn(): void {
    const prevColumn = this.props.previousColumn;
    if (prevColumn) {
      this.props.changeColumnType(
        this.props.columnId,
        prevColumn.columnType,
        prevColumn.query
      );
    }
  }

  protected _changeTheme(evt: ChangeEvent<HTMLSelectElement>) {
    this.props.changeTheme(evt.target.value);
  }

  protected _addAccount() {
    location.href = 'register.html';
  }

  render() {
    const toots: JSX.Element[] = [];

    for (const toot of this.props.tootList) {
      toots.push(
        <CSSTransition
          key={toot.id}
          classNames="toot-transition"
          timeout={{ enter: 1000, exit: 100 }}
        >
          <Toot
            key={toot.id}
            toot={toot}
            currentDate={this.props.currentDate}
            boost={this.props.boost}
            unboost={this.props.unboost}
            favourite={this.props.favourite}
            unfavourite={this.props.unfavourite}
            showMedia={this.props.showMedia}
            changeColumnType={this._changeColumnTypeListener}
          />
        </CSSTransition>
      );
    }

    if (this.props.columnType === WhiteflagColumnType.WHITEFLAG_TOOT) {
      return (
        <div className="column toot-column">
          <div className="toot-column-main" ref={this._columnMainRef}>
            <TootInput
              currentToot={this.props.currentToot}
              currentAttachments={this.props.currentAttachments}
              changeCurrentToot={this.props.changeCurrentToot}
              changeCurrentAttachments={this.props.changeCurrentAttachments}
              postToot={this.props.postToot}
            />
          </div>
        </div>
      );
    }

    if (this.props.columnType === WhiteflagColumnType.WHITEFLAG_COLUMN) {
      const columnListItem = [];
      if (this.props.columnList) {
        for (const column of this.props.columnList) {
          columnListItem.push(
            <CSSTransition
              key={column.columnId}
              classNames="column-list-item-transition"
              timeout={{ enter: 500, exit: 200 }}
            >
              <li key={column.columnId} className="column-list-item">
                <div className="column-list-item-title">{column.title}</div>
                <div className="column-list-item-button">
                  <button
                    className="delete-button delete-column-button"
                    onClick={this._removeColumnListener}
                    data-column-id={column.columnId}
                  >
                    削除
                  </button>
                </div>
              </li>
            </CSSTransition>
          );
        }
      }

      return (
        <div className="column">
          <header className="column-header" onClick={this._scrollToTopListener}>
            <h1 className="column-title">Columns</h1>
          </header>
          <div className="column-main" ref={this._columnMainRef}>
            <ol className="column-list" ref={this._columnListRef}>
              <TransitionGroup>{columnListItem}</TransitionGroup>
            </ol>
            <div className="add-column-container">
              <select className="add-column-selector" ref={this._selectorRef}>
                <option value={WhiteflagColumnType.WHITEFLAG_TOOT}>
                  トゥート
                </option>
                <option value={WhiteflagColumnType.HOME}>ホーム</option>
                <option value={WhiteflagColumnType.PUBLIC_LOCAL}>
                  ローカルタイムライン
                </option>
                <option value={WhiteflagColumnType.PUBLIC}>連合</option>
                <option value={WhiteflagColumnType.HASHTAG_STUMP}>
                  #切り株
                </option>
                <option value={WhiteflagColumnType.HASHTAG_FLAG}>#旗</option>
              </select>
              <button onClick={this._addColumnListener}>追加</button>
            </div>
          </div>
        </div>
      );
    }

    if (this.props.columnType === WhiteflagColumnType.WHITEFLAG_PREFERENCES) {
      return (
        <div className="column">
          <header className="column-header" onClick={this._scrollToTopListener}>
            <h1 className="column-title">設定</h1>
          </header>
          <div className="column-main" ref={this._columnMainRef}>
            <div className="preferences-container">
              <div className="preference-item">
                <h2 className="preference-name">テーマ</h2>
                <select
                  value={this.props.themeName}
                  onChange={this._changeThemeListener}
                >
                  <option value="whiteflag">whiteflag</option>
                  <option value="blackflag">blackflag</option>
                </select>
              </div>

              <div className="preference-item preference-account">
                <h2 className="preference-name">アカウント</h2>
                <button className="button" onClick={this._addAccount}>
                  アカウントを追加
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const supportStreaming =
      this.props.columnType !== WhiteflagColumnType.ACCOUNT &&
      this.props.columnType !== WhiteflagColumnType.CURRENT_ACCOUNT;
    const isConnecting =
      this.props.status === 'uninitialized' ||
      this.props.status === 'connecting' ||
      this.props.status === 'disconnected';
    const status =
      supportStreaming && isConnecting ? '接続を試みています……' : '';
    const statusType = status ? 'error' : 'ok';

    const backButton = this.props.previousColumn ? (
      <button
        className="column-back-button"
        onClick={this._backPreviousColumnListener}
      >
        &lt;
      </button>
    ) : (
      undefined
    );

    return (
      <div className="column">
        <header className="column-header" onClick={this._scrollToTopListener}>
          {backButton}
          <h1 className="column-title">{this.props.title}</h1>
        </header>
        <div className="column-status-indicator" data-status-type={statusType}>
          {status}
        </div>
        <div className="column-main timeline" ref={this._columnMainRef}>
          <TransitionGroup>{toots}</TransitionGroup>
        </div>
      </div>
    );
  }
}
