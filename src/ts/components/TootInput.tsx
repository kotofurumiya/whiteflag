import { remote } from 'electron';

import * as React from 'react';
import { MastodonTootStatus, MastodonTootPost, MastodonAttachment, MastodonTootPostParams } from '../lib/stump';
import Menu = Electron.Menu;

export interface TootInputProps {
  currentToot: MastodonTootPost;
  currentAttachments: MastodonAttachment[];
  changeCurrentToot: (params: MastodonTootPost) => any;
  changeCurrentAttachments: (attachments: MastodonAttachment[]) => void;
  postToot: (toot: MastodonTootPost) => Promise<MastodonTootStatus>;
}

interface TootInputState {
  enableContentWarning: boolean;
}

export class TootInput extends React.Component<TootInputProps, TootInputState> {
  protected _menu: Menu;

  protected _tootInputRef: React.RefObject<HTMLTextAreaElement>;
  protected _spoilerInputRef: React.RefObject<HTMLInputElement>;
  protected _tootButtonRef: React.RefObject<HTMLButtonElement>;

  protected _toggleContentWarningListener: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  protected _deleteMediaListener: (evt: React.MouseEvent<HTMLElement>) => void;
  protected _onInputListener: (evt: React.KeyboardEvent<any>) => void;
  protected _onKeyDownListener: (evt: React.KeyboardEvent<HTMLElement>) => void;
  protected _onRightClickListener: (evt: React.MouseEvent<HTMLElement>) => void;
  protected _postTootListener: (evt: React.MouseEvent<HTMLButtonElement>) => void;

  constructor(props:TootInputProps) {
    super(props);

    const menu = new remote.Menu();
    menu.append(new remote.MenuItem({ label: '切り取り', role: 'cut' }));
    menu.append(new remote.MenuItem({ label: 'コピー', role: 'copy' }));
    menu.append(new remote.MenuItem({ label: '貼り付け', role: 'paste' }));
    this._menu = menu;

    this._tootInputRef = React.createRef();
    this._spoilerInputRef = React.createRef();
    this._tootButtonRef = React.createRef();

    this._toggleContentWarningListener = this._toggleContentWarning.bind(this);
    this._deleteMediaListener = this._deleteMedia.bind(this);
    this._postTootListener = this._postToot.bind(this);
    this._onInputListener = this._onInput.bind(this);
    this._onKeyDownListener = this._onKeyDown.bind(this);
    this._onRightClickListener = this._onRightClick.bind(this);

    this.state = {
      enableContentWarning: false
    };
  }

  protected _onRightClick(evt: React.MouseEvent<HTMLElement>) {
    evt.preventDefault();
    this._menu.popup({});
  }

  protected _toggleContentWarning(evt: React.MouseEvent<HTMLButtonElement>) {
    this.setState({ enableContentWarning: !this.state.enableContentWarning });
  }

  protected _onInput(evt: React.KeyboardEvent<any>) {
    const textArea = this._tootInputRef.current;
    const spoiler = this._spoilerInputRef.current;

    const tootChangeParams = {};

    if(textArea) {
      tootChangeParams['status'] = textArea.value;
    }

    if(spoiler) {
      if(this.state.enableContentWarning) {
        tootChangeParams['spoiler_text'] = spoiler.value;
      }
    }

    this.props.changeCurrentToot(this.props.currentToot.replace(tootChangeParams));
  }

  protected _onKeyDown(evt: React.KeyboardEvent<HTMLElement>) {
    if(evt.ctrlKey && evt.key === 'Enter') {
      evt.preventDefault();
      this._postToot();
    }
  }

  protected _deleteMedia(evt: React.MouseEvent<HTMLElement>): void {
    const id = (evt.target as HTMLElement).dataset.mediaId;
    const attachments = [...this.props.currentAttachments];

    const removeIndex = attachments.findIndex((a) => a.id === id);
    if(removeIndex >= 0) {
      attachments.splice(removeIndex, 1);
      const media_ids = attachments.map((a) => a.id);

      this.props.changeCurrentAttachments(attachments);
      this.props.changeCurrentToot(this.props.currentToot.replace({media_ids}));
    }
  }

  protected _postToot() {
    const button = this._tootButtonRef.current;
    const textArea = this._tootInputRef.current;
    const spoiler = this._spoilerInputRef.current;

    if(textArea && textArea.value && this.props.currentToot.remainTootLength >= 0) {
      if(button) {
        button.disabled = true;
      }

      this.props.postToot(this.props.currentToot).then((tootStatus) => {
        this.props.changeCurrentToot(new MastodonTootPost());
        this.props.changeCurrentAttachments([]);

        if(button) {
          button.disabled = false;
        }
      }).catch((e) => {
        if(button) {
          button.disabled = false;
        }
      });
    }
  }

  render() {
    let mediaList = this.props.currentAttachments.map((attachment) => {
      if(attachment.type === 'image' || attachment.type === 'gifv') {
        return (
          <div key={attachment.id} className="toot-input-attachment-item">
            <img className="toot-input-attachment-media" src={attachment.preview_url}/>
            <div
              className="toot-input-attachment-delete-button"
              onClick={this._deleteMediaListener}
              data-media-id={attachment.id}
            >
              x
            </div>
          </div>
        );
      } else {
        return (
          <div key={attachment.id} className="toot-input-attachment-item">
            <video className="toot-input-attachment-media" src={attachment.preview_url}/>
            <div
              className="toot-input-attachment-delete-button"
              onClick={this._deleteMediaListener}
              data-media-id={attachment.id}
            >
              x
            </div>
          </div>
        );
      }
    });

    return (
      <div className="toot-input-container">
        {this.state.enableContentWarning ? <input
          className="toot-input-cw"
          placeholder="ここに警告を書いてください"
          value={this.props.currentToot.spoiler_text}
          onInput={this._onInputListener}
          onKeyDown={this._onKeyDownListener}
          onContextMenu={this._onRightClickListener}
          ref={this._spoilerInputRef}
        /> : undefined}
        <textarea
          className="toot-input"
          placeholder="今なにしてる？"
          value={this.props.currentToot.status}
          onInput={this._onInputListener}
          onKeyDown={this._onKeyDownListener}
          onContextMenu={this._onRightClickListener}
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
          <div className="toot-count">{this.props.currentToot.remainTootLength}</div>
        </div>

        <div className="toot-button-container">
          <button
            className="toot-button"
            onClick={this._postTootListener}
            ref={this._tootButtonRef}
          >
            トゥート！
          </button>
        </div>

        <div className="toot-input-attachment-container">
          {mediaList}
        </div>
      </div>
    )
  }
}
