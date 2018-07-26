import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  WhiteflagStreamConnectionAction,
  changeConnectionState
} from '../actions/whiteflag';

function* connectStream(action: WhiteflagStreamConnectionAction) {
  try {
    const query = action.payload.query;
    const webSocket = action.payload.whiteflag.connectTimeline(
      action.payload.streamType,
      query
    );
    const state = yield call(() => {
      return new Promise((resolve, reject) => {
        webSocket.addEventListener('open', (evt) => {
          resolve('connected');
        });

        webSocket.addEventListener('error', (evt) => {
          reject('disconnected');
        });
      });
    });

    yield put(changeConnectionState(action.payload.columnId, webSocket, state));
  } catch (e) {
    yield put(
      changeConnectionState(action.payload.columnId, null, 'disconnected')
    );
  }
}

export function* WhiteflagConnectStreamSaga() {
  yield takeEvery('WHITEFLAG_COLUMN_CONNECT_STREAM_REQUEST', connectStream);
}
