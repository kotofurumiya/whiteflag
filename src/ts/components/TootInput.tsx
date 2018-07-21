import * as React from 'react';
import { MastodonTootStatus, MastodonTootPost, MastodonAttachment } from '../lib/stump';

export interface TootInputProps {
  postToot: (toot: MastodonTootPost) => Promise<any>;
}

interface TootInputState {
  remainLength: number;
  enableContentWarning: boolean;
}

export class TootInput extends React.Component<TootInputProps, TootInputState> {
  protected _maxLength: number;

  protected _tootInputRef: React.RefObject<HTMLTextAreaElement>;
  protected _spoilerInputRef: React.RefObject<HTMLInputElement>;

  protected _toggleContentWarningListener: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  protected _onInputListener: (evt: React.KeyboardEvent<any>) => void;
  protected _postTootListener: (evt: React.MouseEvent<HTMLButtonElement>) => void;

  constructor(props:TootInputProps) {
    super(props);

    this._maxLength = 500;

    this._tootInputRef = React.createRef();
    this._spoilerInputRef = React.createRef();

    this._toggleContentWarningListener = this._toggleContentWarning.bind(this);
    this._postTootListener = this._postToot.bind(this);
    this._onInputListener = this._onInput.bind(this);

    this.state = {
      remainLength: this._maxLength,
      enableContentWarning: false
    };
  }

  protected _toggleContentWarning(evt: React.MouseEvent<HTMLButtonElement>) {
    this.setState({ enableContentWarning: !this.state.enableContentWarning });
  }

  protected _onInput(evt: React.KeyboardEvent<any>) {
    const textArea = this._tootInputRef.current;
    const spoiler = this._spoilerInputRef.current;

    let lengthSum = 0;

    if(textArea) {
      lengthSum += textArea.value.length;
    }

    if(spoiler) {
      lengthSum += spoiler.value.length;
    }

    const remainLength = this._maxLength - lengthSum;
    this.setState({ remainLength });
  }

  protected _postToot(evt: React.MouseEvent<HTMLButtonElement>) {
    const button = evt.target as HTMLButtonElement;
    const textArea = this._tootInputRef.current;
    const spoiler = this._spoilerInputRef.current;

    if(textArea && textArea.value && this.state.remainLength >= 0) {
      button.disabled = true;
      const toot = { status: textArea.value };

      if(spoiler && this.state.enableContentWarning) {
        toot['spoiler_text'] = spoiler.value;
      }

      this.props.postToot(toot).then((toot) => {
        // 非同期処理なのでもう一度存在チェックしてから操作。
        const textAreaAfter = this._tootInputRef.current;
        const spoilerAfter = this._spoilerInputRef.current;

        if(textAreaAfter) {
          textAreaAfter.value = '';
          textAreaAfter.dispatchEvent(new Event('input'));
        }

        if(spoilerAfter) {
          spoilerAfter.value = '';
          spoilerAfter.dispatchEvent(new Event('input'));
        }

        button.disabled = false;
      }).catch((e) => {
        button.disabled = false;
      });
    }
  }

  render() {
    return (
      <div className="toot-input-container">
        {this.state.enableContentWarning ? <input
          className="toot-input-cw"
          placeholder="ここに警告を書いてください"
          onInput={this._onInputListener}
          ref={this._spoilerInputRef}
        /> : undefined}
        <textarea
          className="toot-input"
          placeholder="今なにしてる？"
          onInput={this._onInputListener}
          ref={this._tootInputRef}
          required
        />

        <div className="toot-option-bar">
          <button
            className="content-warning-button"
            onClick={this._toggleContentWarningListener}
            data-on={this.state.enableContentWarning}
          >
            CW
          </button>
          <div className="toot-count">{this.state.remainLength}</div>
        </div>

        <div className="toot-button-container">
          <button className="toot-button" onClick={this._postTootListener}>トゥート！</button>
        </div>
      </div>
    )
  }
}
