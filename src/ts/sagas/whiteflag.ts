import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { WhiteflagStreamConnectionAction, changeConnectionState } from '../actions/whiteflag';
import { fetchToots, MastodonFetchTootsAction } from '../actions/mastodon';
import { convertColumnTypeToStreamType, convertColumnTypeToTimelineType, WhiteflagColumnType } from '../lib/whiteflag';
import { fetchTimeline } from './mastodon';

function* connectStream(action: WhiteflagStreamConnectionAction) {
  try {
    const supportsStreaming =
      action.payload.columnType !== WhiteflagColumnType.ACCOUNT &&
      action.payload.columnType !== WhiteflagColumnType.CURRENT_ACCOUNT;

    if (supportsStreaming) {
      // ストリーミングをサポートしていればストリームにつなぐ。
      const query = action.payload.query;
      const streamType = convertColumnTypeToStreamType(action.payload.columnType);
      const webSocket = action.payload.whiteflag.connectTimeline(streamType, query);
      const state = yield call(() => {
        return new Promise((resolve, reject) => {
          webSocket!.addEventListener('open', (evt) => {
            resolve('connected');
          });

          webSocket!.addEventListener('error', (evt) => {
            reject('disconnected');
          });
        });
      });

      const timelineType = convertColumnTypeToTimelineType(action.payload.columnType);
      const fetchTimelineAction: MastodonFetchTootsAction = fetchToots(
        action.payload.whiteflag,
        action.payload.columnId,
        timelineType,
        action.payload.query
      );
      yield call(fetchTimeline, fetchTimelineAction);

      yield put(changeConnectionState(action.payload.columnId, webSocket, state));
    } else {
      // ストリーミングをサポートしていなければトゥートの取得だけ行う。
      const timelineType = convertColumnTypeToTimelineType(action.payload.columnType);
      const fetchTimelineAction: MastodonFetchTootsAction = fetchToots(
        action.payload.whiteflag,
        action.payload.columnId,
        timelineType,
        action.payload.query
      );
      yield call(fetchTimeline, fetchTimelineAction);
    }
  } catch (e) {
    yield put(changeConnectionState(action.payload.columnId, null, 'disconnected'));
  }
}

export function* WhiteflagConnectStreamSaga() {
  yield takeEvery('WHITEFLAG_COLUMN_CONNECT_STREAM_REQUEST', connectStream);
}
