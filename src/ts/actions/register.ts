import { Action } from 'redux';

export interface RegisterAction extends Action {
  readonly type: string;
  readonly payload: {
    host: string;
  };
}

export function setHost(host: string): RegisterAction {
  return {
    type: 'SET_HOST',
    payload: {
      host
    }
  };
}
