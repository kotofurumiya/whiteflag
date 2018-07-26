import { RegisterAction } from '../actions/register';

export interface RegisterState {
  host: string | undefined;
}

export function register(
  state: RegisterState = { host: undefined },
  action: RegisterAction
): RegisterState {
  switch (action.type) {
    case 'SET_HOST':
      return { host: action.payload.host };
    default:
      return state;
  }
}
