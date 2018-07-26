import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, Switch } from 'react-router';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import { createHashHistory } from 'history';

import { Register } from './containers/Register';
import { RegisterCode } from './components/RegisterCode';

import { register, RegisterState } from './reducers/register';

const history = createHashHistory();
const middleware = routerMiddleware(history);

const store = createStore(
  combineReducers<any>({
    register,
    routing: routerReducer
  }),
  applyMiddleware(middleware)
);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Switch>
        <Route exact path="/" component={Register} />
        <Route path="/code" component={RegisterCode} />
      </Switch>
    </Router>
  </Provider>,
  document.querySelector('#app')
);
