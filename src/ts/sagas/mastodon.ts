import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import {
  MastodonFetchTootsAction,
  receiveToots,
  receiveFailedToots,
  MastodonFetchAccountAction, receiveAccount
} from '../actions/mastodon';

function* fetchTimeline(action: MastodonFetchTootsAction) {
  try {
    const toots = yield call(() => action.payload.client.fetchTimeline(action.payload.timelineType, action.payload.query));
    yield put(receiveToots(action.payload.columnId, toots));
  } catch (e) {
    yield put(receiveFailedToots(e));
  }
}

export function* MastodonFetchTimelineSaga() {
  yield takeEvery('MASTODON_FETCH_TOOTS_REQUEST', fetchTimeline);
}

function* fetchAccount(action: MastodonFetchAccountAction) {
  try {
    let account;
    if(action.payload.idOrTarget === 'current_user') {
      account = yield call(() => action.payload.client.fetchCurrentAccount());
    } else {
      account = yield call((id) => action.payload.client.fetchAccount(id), action.payload.idOrTarget as number);
    }
    yield put(receiveAccount(account));
  } catch (e) {
    throw new Error(e);
  }
}

export function* MastodonFetchAccountSaga() {
  yield takeEvery('MASTODON_FETCH_ACCOUNT_REQUEST', fetchAccount);
}

