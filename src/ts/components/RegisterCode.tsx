import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { Whiteflag } from '../lib/whiteflag';
import { RegisterState } from '../reducers/register';

interface RegisterCodeState {
  register: RegisterState
}

interface RegisterCodeProps {
  host: string;
}

class _RegisterCode extends React.Component<RegisterCodeProps, {}> {
  render() {
    const { host } = this.props;

    const auth = (evt: React.MouseEvent<HTMLElement>) => {
      const whiteflag = new Whiteflag(host);
      const code = (this.refs.authCodeInput as HTMLInputElement).value;

      whiteflag.authUser(code)
        .then((success: boolean) => {
          if(success) {
            location.href = 'index.html';
          } else {
            alert('認証に失敗しました。');
          }
        })
        .catch((error) => {
          alert('認証に失敗しました。');
          console.error(error);
        });
    };

    return (
      <div className="register-page">
        <h1 className="page-title">認証コードを入力してください</h1>
        <div className="page-content">
          <input id="auth-code-input" className="auth-code-input" type="text" ref="authCodeInput" placeholder="abcdefg0123456789"/>
        </div>
        <div className="page-content">
          <button className="auth-button" onClick={auth}>認証する</button>
          <a className="button cancel-button" href="index.html">キャンセル</a>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: RegisterCodeState) {
  return {
    host: state.register.host
  };
}

export const RegisterCode = connect(mapStateToProps)(_RegisterCode);
