import {
  MastodonAction,
  MastodonReceiveTootsAction,
  MastodonReceiveAccountAction,
  MastodonReceiveEventAction,
  MastodonTootAction, MastodonUpdateAccountInfoListAction
} from '../actions/mastodon';

import { MastodonAccount, MastodonTootStatus } from '../lib/stump';
import {
  cloneColumn,
  convertColumnTypeToTitle,
  WhiteflagColumn,
  WhiteflagColumnType,
  WhiteflagTootMode
} from '../lib/whiteflag';
import {
  WhiteflagChangeMainColumnAction, WhiteflagChangeThemeAction,
  WhiteflagColumnAction, WhiteflagColumnAddAction,
  WhiteflagStreamChangeConnectionStateAction, WhiteflagUpdateCurrentDateAction
} from '../actions/whiteflag';
import { Action } from 'redux';
import { AccountInfo } from '../lib/stump/account_storage';

export interface WhiteflagState {
  readonly mainColumn: WhiteflagColumn;
  readonly notificationColumn: WhiteflagColumn;
  readonly columnList: WhiteflagColumn[];
  readonly tootMode: WhiteflagTootMode;
  readonly currentDate: Date;
  readonly themeName: string;
}

export interface MastodonAccountState {
  readonly accountInfoList: AccountInfo[];
  readonly currentAccount: MastodonAccount | null;
}

const initialWhiteflagState: WhiteflagState = {
  mainColumn: {
    columnId: 'whiteflag:main:whiteflag:toot',
    columnType: WhiteflagColumnType.WHITEFLAG_TOOT,
    title: 'Toot',
    query: {},
    isInitialized: false,
    stream: {
      webSocket: null,
      query: {},
      state: 'uninitialized'
    },
    tootList: []
  },
  notificationColumn: {
    columnId: 'notification',
    columnType: WhiteflagColumnType.HOME,
    title: 'Notification',
    query: {},
    isInitialized: false,
    stream: {
      webSocket: null,
      query: {},
      state: 'uninitialized'
    },
    tootList: []
  },
  columnList: [],
  tootMode: WhiteflagTootMode.COLUMN,
  currentDate: new Date(),
  themeName: 'whiteflag'
};

const initialAccountState: MastodonAccountState = {
  accountInfoList: [],
  currentAccount: null
};

function filterToots(tootList: MastodonTootStatus[]) {
  const newTootList: MastodonTootStatus[] = [];

  for(const toot of tootList) {
    const newToot = {};
    Object.assign(newToot, toot);

    // 切り株タグにはボタンをつける
    if(toot.tags.some((t) => t.name === '切り株')) {
      // <p>DEADBEEF<br /> みたいなIDをボタンに置き換える。
      const pattern = /(\W|<[\w\s/]+>)([0-9a-fA-F]{5,})(\s|<[\w\s/]+>|$)/g;
      const replace = '$1<button class="button multibattle-button">$2</button>$3';
      newToot['content'] = toot.content.replace(pattern, replace);
      newToot['spoiler_text'] = toot.spoiler_text.replace(pattern, replace);
    }

    // 絵文字のショートコードをimgタグに置き換える。
    for(const emoji of toot.emojis) {
      const pattern = new RegExp(`:${emoji.shortcode}:`, 'g');
      const replace = `<img class="emoji" src="${emoji.url}">`;
      newToot['content'] = toot.content.replace(pattern, replace);
      newToot['spoiler_text'] = toot.spoiler_text.replace(pattern, replace);
    }

    newTootList.push(newToot as MastodonTootStatus);
  }

  return newTootList;
}

export function whiteflagReducer(state: WhiteflagState = initialWhiteflagState, action: Action): WhiteflagState {
  const mainColumn: WhiteflagColumn = cloneColumn(state.mainColumn);
  const notificationColumn: WhiteflagColumn = cloneColumn(state.notificationColumn);
  const columnList: WhiteflagColumn[] = state.columnList.map((c) => cloneColumn(c));
  const themeName = state.themeName;

  switch(action.type) {
    // 時刻がアップデートされたとき。
    case 'WHITEFLAG_UPDATE_CURRENT_DATE': {
      return {
        mainColumn,
        notificationColumn,
        columnList,
        tootMode: state.tootMode,
        currentDate: (action as WhiteflagUpdateCurrentDateAction).payload.currentDate,
        themeName
      }
    }

    // カラム追加の命令を受け取った時は、
    // カラムを追加する。
    case 'WHITEFLAG_ADD_COLUMN': {
      const whiteflagColumnAction = action as WhiteflagColumnAddAction;
      const columnId = whiteflagColumnAction.payload.columnId;
      const columnType = whiteflagColumnAction.payload.columnType;
      const query = whiteflagColumnAction.payload.query;

      columnList.push({
        columnId,
        columnType,
        title: whiteflagColumnAction.payload.title,
        isInitialized: false,
        query,
        stream: {
          webSocket: null,
          query,
          state: 'uninitialized'
        },
        tootList: []
      });

      const includesTootColumn = [mainColumn, ...columnList].some((col) => col.columnType === WhiteflagColumnType.WHITEFLAG_TOOT);
      const tootMode = includesTootColumn ? WhiteflagTootMode.COLUMN : WhiteflagTootMode.BAR_UNDER;

      return {
        mainColumn,
        notificationColumn,
        columnList,
        tootMode,
        currentDate: state.currentDate,
        themeName
      };
    }

    // カラムを削除するとき。
    case 'WHITEFLAG_REMOVE_COLUMN': {
      const whiteflagColumnAction = action as WhiteflagColumnAction;
      const columnId = whiteflagColumnAction.payload.columnId;

      const removeIndex = columnList.findIndex((col) => col.columnId === columnId);

      const websocket = columnList[removeIndex].stream.webSocket;
      if(websocket) {
        websocket.close();
      }

      if(removeIndex >= 0) {
        columnList.splice(removeIndex, 1);
      }

      const includesTootColumn = [mainColumn, ...columnList].some((col) => col.columnType === WhiteflagColumnType.WHITEFLAG_TOOT);
      const tootMode = includesTootColumn ? WhiteflagTootMode.COLUMN : WhiteflagTootMode.BAR_UNDER;

      return {
        mainColumn,
        notificationColumn,
        columnList,
        tootMode,
        currentDate: state.currentDate,
        themeName
      };
    }

    // カラムのストリーム接続ステートが変更されたとき。
    case 'WHITEFLAG_CHANGE_COLUMN_CONNECTION_STATE': {
      const whiteflagAction = action as WhiteflagStreamChangeConnectionStateAction;
      const columnId = whiteflagAction.payload.columnId;
      const isMainColumn = mainColumn.columnId === columnId;
      const isNotificationColumn = notificationColumn.columnId === columnId;
      const columnIndex = columnList.findIndex((c) => c.columnId === columnId);

      let newMainColumn = mainColumn;
      let newNotificationColumn = notificationColumn;

      if (!isMainColumn && !isNotificationColumn && columnIndex < 0) {
        return state;
      }

      let targetColumn = null;

      if(isMainColumn) {
        targetColumn = mainColumn;
      } else if(isNotificationColumn) {
        targetColumn = notificationColumn;
      } else {
        targetColumn = columnList[columnIndex];
      }

      const newColumn = {
        columnId,
        columnType: targetColumn.columnType,
        title: targetColumn.title,
        isInitialized: targetColumn.isInitialized,
        query: targetColumn.query,
        stream: {
          webSocket: whiteflagAction.payload.webSocket,
          query: targetColumn.stream.query,
          state: whiteflagAction.payload.state
        },
        tootList: targetColumn.tootList
      };

      if(isMainColumn) {
        newMainColumn = newColumn;
      } else if(isNotificationColumn) {
        newNotificationColumn = newColumn;
      } else {
        columnList[columnIndex] = newColumn;
      }

      const tootMode = state.tootMode;

      return {
        mainColumn: newMainColumn,
        notificationColumn: newNotificationColumn,
        columnList,
        tootMode,
        currentDate: state.currentDate,
        themeName
      };
    }

    // メインカラムの種類変更。
    case 'WHITEFLAG_CHANGE_MAIN_COLUMN': {
      const whiteflagMainColumnAction = action as WhiteflagChangeMainColumnAction;

      const query = whiteflagMainColumnAction.payload.query;
      const title = convertColumnTypeToTitle(whiteflagMainColumnAction.payload.columnType, query);

      if(mainColumn.columnType === whiteflagMainColumnAction.payload.columnType) {
        return state;
      }

      if(mainColumn.stream.webSocket) {
        mainColumn.stream.webSocket.close();
      }

      const newMainColumn: WhiteflagColumn = {
        columnId: 'whiteflag:main:' + whiteflagMainColumnAction.payload.columnType,
        columnType: whiteflagMainColumnAction.payload.columnType,
        title,
        query,
        isInitialized: false,
        stream: {
          webSocket: null,
          query,
          state: 'uninitialized'
        },
        tootList: []
      };

      const includesTootColumn = [newMainColumn, ...columnList].some((col) => col.columnType === WhiteflagColumnType.WHITEFLAG_TOOT);
      const tootMode = includesTootColumn ? WhiteflagTootMode.COLUMN : WhiteflagTootMode.BAR_UNDER;

      return {
        mainColumn: newMainColumn,
        notificationColumn,
        columnList: state.columnList,
        tootMode,
        currentDate: state.currentDate,
        themeName
      };
    }

    // 初期トゥートの一覧を受け取ったときは、
    // 該当カラムのトゥート一覧にセットする。
    case 'MASTODON_RECEIVE_INITIAL_TOOTS': {
      const columnId = (action as MastodonTootAction).payload.columnId;
      const isMainColumn = state.mainColumn.columnId === columnId;
      const columnIndex = columnList.findIndex((c) => c.columnId === columnId);

      if (!isMainColumn && columnIndex < 0) {
        return state;
      }

      let newMainColumn = mainColumn;

      const targetColumn = isMainColumn ? state.mainColumn : columnList[columnIndex];

      const newColumn = {
        columnId,
        columnType: targetColumn.columnType,
        title: targetColumn.title,
        query: targetColumn.query,
        isInitialized: true,
        stream: targetColumn.stream,
        tootList: filterToots((action as MastodonReceiveTootsAction).payload.tootList)
      };

      if(isMainColumn) {
        newMainColumn = newColumn;
      } else {
        columnList[columnIndex] = newColumn;
      }

      const tootMode = state.tootMode;

      return {
        mainColumn: newMainColumn,
        notificationColumn,
        columnList,
        tootMode,
        currentDate: state.currentDate,
        themeName
      };
    }

    // ストリームでイベントを受け取ったときは、
    // トゥートを追加or削除する。
    // 通知はコンポーネント側で行うので、ここでは無視する。
    case 'MASTODON_RECEIVE_EVENT': {
      const columnId = (action as MastodonTootAction).payload.columnId;
      const isMainColumn = mainColumn.columnId === columnId;
      const columnIndex = columnList.findIndex((c) => c.columnId === columnId);

      if (!isMainColumn && columnIndex < 0) {
        return state;
      }

      const targetColumn = isMainColumn ? mainColumn : columnList[columnIndex];
      const data = (action as MastodonReceiveEventAction).payload.data;
      const tootMode = state.tootMode;

      let newMainColumn = mainColumn;

      switch ((action as MastodonReceiveEventAction).payload.event) {
        // updateのときはトゥートを追加。
        case 'update': {
          const tootList = targetColumn.tootList;
          const newColumn = {
            columnId,
            columnType: targetColumn.columnType,
            title: targetColumn.title,
            query: targetColumn.query,
            isInitialized: targetColumn.isInitialized,
            stream: targetColumn.stream,
            tootList: [...filterToots([data]), ...tootList]
          };

          if (isMainColumn) {
            newMainColumn = newColumn;
          } else {
            columnList[columnIndex] = newColumn;
          }

          return {
            mainColumn: newMainColumn,
            notificationColumn,
            columnList,
            tootMode,
            currentDate: state.currentDate,
            themeName
          };
        }

        // 通知は無視。コンポーネント側で行う。
        case 'notification': {
          return state;
        }

        // deleteのときはトゥートを消す。
        case 'delete': {
          const deleteId = data;
          const newTootList = [...targetColumn.tootList];
          const deleteIndex = newTootList.findIndex((t) => t.id.toString() === deleteId.toString());

          if (deleteIndex >= 0) {
            newTootList.splice(deleteIndex, 1);
          }

          const newColumn = {
            columnId,
            columnType: targetColumn.columnType,
            title: targetColumn.title,
            query: targetColumn.query,
            isInitialized: targetColumn.isInitialized,
            stream: targetColumn.stream,
            tootList: newTootList
          };

          if (isMainColumn) {
            newMainColumn = newColumn;
          } else {
            columnList[columnIndex] = newColumn;
          }

          return {
            mainColumn: newMainColumn,
            notificationColumn,
            columnList,
            tootMode,
            currentDate: state.currentDate,
            themeName
          };
        }

        // それ以外のイベントならstateをそのまま返す。
        default:
          return state;
      }
    }

    case 'WHITEFLAG_CHANGE_THEME': {
      return {
        mainColumn,
        notificationColumn,
        columnList,
        tootMode: state.tootMode,
        currentDate: state.currentDate,
        themeName: (action as WhiteflagChangeThemeAction).payload.themeName
      };
    }

    // それ以外のときはstateをそのまま返す。
    default: {
      return state;
    }
  }
}

export function fetchAccountReducer(state: MastodonAccountState = initialAccountState, action: MastodonAction): MastodonAccountState {
  switch(action.type) {
    case 'MASTODON_UPDATE_ACCOUNT_INFO_LIST' : {
      return {
        accountInfoList: (action as MastodonUpdateAccountInfoListAction).payload.accountInfoList,
        currentAccount: state.currentAccount
      }
    }

    case 'MASTODON_RECEIVE_ACCOUNT': {
      return {
        accountInfoList: [...state.accountInfoList],
        currentAccount: (action as MastodonReceiveAccountAction).payload.account
      };
    }

    default: {
      return state;
    }
  }
}
