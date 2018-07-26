import { Action } from 'redux';
import { Whiteflag } from '../lib/whiteflag';
import { MastodonAccount } from '../lib/stump';
import { AccountInfo } from '../lib/stump/account_storage';
import { MastodonTimelineType } from '../lib/stump/mastodon';

export interface MastodonAction extends Action {
  readonly type: string;
}

export interface MastodonTootAction extends MastodonAction {
  readonly payload: {
    readonly columnId: string;
  };
}

export interface MastodonFetchTootsAction extends MastodonTootAction {
  readonly payload: {
    readonly columnId: string;
    readonly timelineType: MastodonTimelineType;
    readonly client: Whiteflag;
    readonly query: object;
  };
}

export interface MastodonReceiveTootsAction extends MastodonTootAction {
  readonly payload: {
    readonly columnId: string;
    readonly tootList: any[];
  };
}

export interface MastodonReceiveFailedAction extends MastodonAction {
  readonly payload: {
    readonly message: string;
  };
  readonly error: boolean;
}

export interface MastodonUpdateAccountInfoListAction extends MastodonAction {
  readonly payload: {
    readonly accountInfoList: AccountInfo[];
  };
}

export interface MastodonFetchAccountAction extends MastodonAction {
  readonly payload: {
    readonly client: Whiteflag;
    readonly idOrTarget: number | string;
  };
}

export interface MastodonReceiveAccountAction extends MastodonAction {
  readonly payload: {
    readonly account: MastodonAccount;
  };
}

export interface MastodonReceiveEventAction extends MastodonTootAction {
  readonly payload: {
    readonly columnId: string;
    readonly event: string;
    readonly data: any;
  };
}

export function fetchToots(
  whiteflag: Whiteflag,
  columnId: string,
  timelineType: MastodonTimelineType,
  query: object = {}
): MastodonFetchTootsAction {
  return {
    type: 'MASTODON_FETCH_TOOTS_REQUEST',
    payload: {
      columnId,
      timelineType,
      client: whiteflag,
      query
    }
  };
}

export function receiveToots(
  columnId: string,
  tootList: any[]
): MastodonReceiveTootsAction {
  return {
    type: 'MASTODON_RECEIVE_INITIAL_TOOTS',
    payload: {
      columnId,
      tootList
    }
  };
}

export function receiveFailedToots(
  message: string
): MastodonReceiveFailedAction {
  return {
    type: 'MASTODON_RECEIVE_FAILED_TOOTS',
    payload: {
      message
    },
    error: true
  };
}

export function updateAccountInfoList(
  accountInfoList: AccountInfo[]
): MastodonUpdateAccountInfoListAction {
  return {
    type: 'MASTODON_UPDATE_ACCOUNT_INFO_LIST',
    payload: {
      accountInfoList
    }
  };
}

export function fetchAccount(
  whiteflag: Whiteflag,
  idOrTarget: number | string = 'current_user'
): MastodonFetchAccountAction {
  return {
    type: 'MASTODON_FETCH_ACCOUNT_REQUEST',
    payload: {
      client: whiteflag,
      idOrTarget
    }
  };
}

export function receiveAccount(
  account: MastodonAccount
): MastodonReceiveAccountAction {
  return {
    type: 'MASTODON_RECEIVE_ACCOUNT',
    payload: {
      account
    }
  };
}

export function receiveEvent(
  columnId: string,
  eventType: string,
  data: object
): MastodonReceiveEventAction {
  return {
    type: 'MASTODON_RECEIVE_EVENT',
    payload: {
      columnId,
      event: eventType,
      data
    }
  };
}
