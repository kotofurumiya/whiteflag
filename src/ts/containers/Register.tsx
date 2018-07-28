import * as React from 'react';
import * as Redux from 'redux';
import { push } from 'react-router-redux';

import { Whiteflag } from '../lib/whiteflag';
import { setHost } from '../actions/register';
import { connect } from 'react-redux';
import { remote } from 'electron';
import Menu = Electron.Menu;

interface RegisterProps {
  host: string;
  dispatch: Redux.Dispatch;
}

class _Register extends React.Component<RegisterProps, {}> {
  protected _menu: Menu;
  protected _onRightClick: (evt: React.MouseEvent<HTMLElement>) => any;

  constructor(props: RegisterProps) {
    super(props);

    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({ label: '切り取り', role: 'cut' }));
    menu.append(new remote.MenuItem({ label: 'コピー', role: 'copy' }));
    menu.append(new remote.MenuItem({ label: '貼り付け', role: 'paste' }));
    this._menu = menu;

    this._onRightClick = (evt: React.MouseEvent<HTMLElement>) => {
      evt.preventDefault();
      menu.popup({});
    };
  }

  // 接続ボタンを押した時にクライアントを登録していけなれば登録する。
  // クライアントの登録が済んだらアカウント認証を行うためのウィンドウをブラウザで開く
  protected _register(evt: React.MouseEvent<HTMLElement>) {
    const button = document.querySelector('.register-button') as HTMLButtonElement;
    button.innerText = '接続中……';
    button.disabled = true;

    const hostInput = this.refs.inputHost as HTMLInputElement;
    const host = hostInput.value;

    this.props.dispatch(setHost(host));
    const whiteflag = new Whiteflag(host);

    const registration = whiteflag.isRegistered ? Promise.resolve(true) : whiteflag.registerClient();
    registration
      .then((success: boolean) => {
        if (success) {
          // 成功したら認証用のページをブラウザで開き、
          // こちらはコード入力用の画面に遷移する。
          const authUrl = whiteflag.createAuthUrl();
          window.open(authUrl);
          this.props.dispatch(push('/code'));
        } else {
          alert('接続に失敗しました。');
          button.innerText = '接続する';
          button.disabled = false;
        }
      })
      .catch((e) => {
        alert('接続に失敗しました。');
        button.innerText = '接続する';
        button.disabled = false;
      });
  }

  render() {
    return (
      <div className="register-page">
        <h1 className="page-title">インスタンスのURLを入力してください</h1>
        <div className="page-content instance-url">
          https://
          <input
            className="instance-host-input"
            type="text"
            defaultValue="mimumedon.com"
            ref="inputHost"
            onContextMenu={this._onRightClick}
          />
          /
        </div>
        <div className="page-content">
          <button className="register-button" onClick={this._register.bind(this)}>
            接続する
          </button>
          <a className="button cancel-button" href="index.html">
            キャンセル
          </a>
        </div>
      </div>
    );
  }
}

export const Register = connect((state) => state)(_Register);
