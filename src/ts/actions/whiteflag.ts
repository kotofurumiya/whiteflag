import { Action } from 'redux';
import { Whiteflag, WhiteflagColumnType } from '../lib/whiteflag';
import {
  MastodonAttachment,
  MastodonStreamType,
  MastodonTootPost,
  MastodonTootPostParams
} from '../lib/stump/mastodon';

export interface WhiteflagUpdateCurrentDateAction extends Action {
  readonly type: string;
  readonly payload: {
    readonly currentDate: Date;
  };
}

export interface WhiteflagChangeColumnTypeAction extends Action {
  readonly type: string;
  readonly payload: {
    readonly columnId: string;
    readonly columnType: WhiteflagColumnType;
    readonly query: object;
    readonly unlinkPreviousColumn: boolean;
  };
}

export interface WhiteflagColumnAction extends Action {
  readonly type: string;
  readonly payload: {
    readonly columnId: string;
  };
}

export interface WhiteflagColumnAddAction extends WhiteflagColumnAction {
  readonly payload: {
    readonly columnId: string;
    readonly columnType: WhiteflagColumnType;
    readonly query: object;
    readonly title: string;
  };
}

export interface WhiteflagStreamConnectionAction extends Action {
  readonly type: string;
  readonly payload: {
    readonly whiteflag: Whiteflag;
    readonly columnId: string;
    readonly columnType: WhiteflagColumnType;
    readonly query: object;
    readonly state: string;
  };
}

export interface WhiteflagStreamChangeConnectionStateAction extends Action {
  readonly type: string;
  readonly payload: {
    readonly columnId: string;
    readonly webSocket: WebSocket | null;
    readonly state: string;
  };
}

export interface WhiteflagChangeCurrentTootAction extends Action {
  readonly type: string;
  readonly payload: {
    readonly toot: MastodonTootPost;
  };
}

export interface WhiteflagChangeCurrentAttachmentsAction extends Action {
  readonly type: string;
  readonly payload: {
    readonly attachments: MastodonAttachment[];
  };
}

export interface WhiteflagChangeThemeAction extends Action {
  readonly type: string;
  readonly payload: {
    readonly themeName: string;
  };
}

export function updateCurrentDate(
  currentDate: Date
): WhiteflagUpdateCurrentDateAction {
  return {
    type: 'WHITEFLAG_UPDATE_CURRENT_DATE',
    payload: {
      currentDate
    }
  };
}

export function changeColumnType(
  columnId: string,
  columnType: WhiteflagColumnType,
  query: object = {},
  unlinkPreviousColumn: boolean = false
): WhiteflagChangeColumnTypeAction {
  return {
    type: 'WHITEFLAG_CHANGE_COLUMN_TYPE',
    payload: {
      columnId,
      columnType,
      query,
      unlinkPreviousColumn
    }
  };
}

export function addColumn(
  title: string,
  columnType: WhiteflagColumnType,
  columnId: string,
  query: object = {}
): WhiteflagColumnAddAction {
  return {
    type: 'WHITEFLAG_ADD_COLUMN',
    payload: {
      columnId,
      columnType,
      query,
      title
    }
  };
}

export function removeColumn(columnId: string): WhiteflagColumnAction {
  return {
    type: 'WHITEFLAG_REMOVE_COLUMN',
    payload: {
      columnId
    }
  };
}

export function connectColumnToStream(
  whiteflag: Whiteflag,
  columnId: string,
  columnType: WhiteflagColumnType,
  query: object = {}
): WhiteflagStreamConnectionAction {
  return {
    type: 'WHITEFLAG_COLUMN_CONNECT_STREAM_REQUEST',
    payload: {
      whiteflag,
      columnId,
      columnType,
      query,
      state: 'uninitialized'
    }
  };
}

export function changeConnectionState(
  columnId: string,
  webSocket: WebSocket | null,
  state: string
): WhiteflagStreamChangeConnectionStateAction {
  return {
    type: 'WHITEFLAG_CHANGE_COLUMN_CONNECTION_STATE',
    payload: {
      columnId,
      webSocket,
      state
    }
  };
}

export function changeCurrentToot(
  toot: MastodonTootPost
): WhiteflagChangeCurrentTootAction {
  return {
    type: 'WHITEFLAG_CHANGE_CURRENT_TOOT',
    payload: {
      toot
    }
  };
}

export function changeCurrentAttachments(
  attachments: MastodonAttachment[]
): WhiteflagChangeCurrentAttachmentsAction {
  return {
    type: 'WHITEFLAG_CHANGE_CURRENT_ATTACHMENTS',
    payload: {
      attachments
    }
  };
}

export function changeTheme(themeName: string): WhiteflagChangeThemeAction {
  return {
    type: 'WHITEFLAG_CHANGE_THEME',
    payload: {
      themeName
    }
  };
}
