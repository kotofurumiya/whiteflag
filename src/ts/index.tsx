import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Router, Route } from 'react-router';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';

import { App } from './containers/App';
import { fetchAccountReducer, whiteflagReducer } from './reducers/whiteflag';
import { MastodonFetchTimelineSaga, MastodonFetchAccountSaga } from './sagas/mastodon';
import { createHashHistory } from 'history';
import { WhiteflagConnectStreamSaga } from './sagas/whiteflag';

const history = createHashHistory();
const middleware = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  combineReducers<any>({
    whiteflagData: whiteflagReducer,
    accountData: fetchAccountReducer,
    routing: routerReducer
  }),
  applyMiddleware(middleware, sagaMiddleware)
);

sagaMiddleware.run(MastodonFetchTimelineSaga);
sagaMiddleware.run(MastodonFetchAccountSaga);
sagaMiddleware.run(WhiteflagConnectStreamSaga);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route exact path="/" component={App} />
    </Router>
  </Provider>,
  document.querySelector('#app')
);
