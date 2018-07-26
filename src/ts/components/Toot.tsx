import * as React from 'react';
import { MastodonTootStatus, MastodonAttachment } from '../lib/stump';

export interface TootProps {
  toot: MastodonTootStatus;
  currentDate: Date;
  favourite: (tootId: string) => Promise<MastodonTootStatus>;
  unfavourite: (tootId: string) => Promise<MastodonTootStatus>;
  boost: (tootId: string) => Promise<MastodonTootStatus>;
  unboost: (tootId: string) => Promise<MastodonTootStatus>;
  showMedia: (url: string, type: string) => any;
}

interface TootState {
  reblogged: boolean;
  favourited: boolean;
}

export class Toot extends React.Component<TootProps, TootState> {
  protected _timestamp: number;
  protected _timestampDate: Date;

  protected _tootContentRef: React.RefObject<HTMLDivElement>;
  protected _spoilerRef: React.RefObject<HTMLDetailsElement>;

  protected _onClickImgListener: (
    event: React.MouseEvent<HTMLImageElement>
  ) => any;
  protected _onClickVideoListener: (
    event: React.MouseEvent<HTMLVideoElement>
  ) => any;

  protected _onClickFavouriteButtonListener: (
    event: React.MouseEvent<HTMLElement>
  ) => any;
  protected _onClickBoostButtonListener: (
    event: React.MouseEvent<HTMLElement>
  ) => any;

  constructor(props: TootProps) {
    super(props);

    this._timestampDate = new Date(this.props.toot.created_at);
    this._timestamp = Date.parse(this.props.toot.created_at);

    this._tootContentRef = React.createRef<HTMLDivElement>();
    this._spoilerRef = React.createRef();

    this._onClickImgListener = this._onClickImg.bind(this);
    this._onClickVideoListener = this._onClickVideo.bind(this);

    this._onClickFavouriteButtonListener = this._onClickFavouriteButton.bind(
      this
    );
    this._onClickBoostButtonListener = this._onClickBoostButton.bind(this);

    const reblogged = this.props.toot.reblogged
      ? this.props.toot.reblogged
      : false;
    const favourited = this.props.toot.favourited
      ? this.props.toot.favourited
      : false;
    this.state = { reblogged, favourited };
  }

  // 参戦IDをクリックした時の動作。
  protected _onClickMultibattleButton(evt: Event) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNode(evt.target as HTMLElement);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  }

  // CWの「もっと見る」ボタンをクリックした時の動作。
  protected _onToggleSpoiler(evt: Event) {
    const detailsElement = evt.target as HTMLDetailsElement;
    const summaryElement = detailsElement.querySelector(
      'summary'
    ) as HTMLSummaryElement;
    summaryElement.innerText = detailsElement.open ? '隠す' : 'もっと見る';
  }

  protected _onClickSensitiveMedia(evt: React.MouseEvent<any>) {
    const elem = evt.target as HTMLElement;
    elem.style.display = 'none';
  }

  // 画像クリック時の動作。
  protected _onClickImg(evt: Event) {
    const media = evt.target as HTMLImageElement;
    this.props.showMedia(media.src, 'img');
  }

  // 動画クリック時の動作。
  protected _onClickVideo(evt: Event) {
    const media = evt.target as HTMLVideoElement;
    this.props.showMedia(media.src, 'video');
  }

  // ブーストボタンクリック時の動作。
  protected _onClickBoostButton(evt: React.MouseEvent<HTMLElement>) {
    if (this.state.reblogged) {
      this.props.unboost(this.props.toot.id);
      this.setState({ reblogged: false });
    } else {
      if (confirm('このトゥートをブーストしますか？')) {
        this.props.boost(this.props.toot.id);
        this.setState({ reblogged: true });
      }
    }
  }

  protected _onClickFavouriteButton(evt: React.MouseEvent<HTMLElement>) {
    if (this.state.favourited) {
      this.props.unfavourite(this.props.toot.id);
    } else {
      this.props.favourite(this.props.toot.id);
    }

    const favourited = !this.state.favourited;
    this.setState({ favourited });
  }

  protected _generateRelativeTimestamp() {
    const currentMs = this.props.currentDate.valueOf();
    const timeDiff = currentMs - this._timestamp;
    if (timeDiff < 1000 * 10) {
      return '今';
    } else if (timeDiff < 1000 * 60) {
      const sec = Math.floor(timeDiff / 1000);
      return `${sec}秒前`;
    } else if (timeDiff < 1000 * 60 * 60) {
      const minutes = Math.floor(timeDiff / (1000 * 60));
      return `${minutes}分前`;
    } else if (timeDiff < 1000 * 60 * 60 * 24) {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      return `${hours}時間前`;
    } else if (timeDiff < 1000 * 60 * 60 * 24 * 7) {
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      return `${days}日前`;
    } else {
      return `${this._timestampDate.getMonth() +
        1}/${this._timestampDate.getDate()}`;
    }
  }

  render() {
    const sensitiveCover = (
      <div
        className="toot-media-attachment-spoiler-warning"
        onClick={this._onClickSensitiveMedia}
      >
        <div>クリックで表示</div>
      </div>
    );

    const mediaList = this.props.toot.media_attachments.map(
      (media: MastodonAttachment) => {
        if (media.type === 'video' || media.type === 'gifv') {
          return (
            <div key={media.id} className="toot-media-attachment">
              <video
                className="toot-media-attachment-content"
                src={media.url}
                width="500"
                height="500"
                onClick={this._onClickVideoListener}
                controls={true}
              >
                video
              </video>
              {this.props.toot.sensitive ? sensitiveCover : null}
            </div>
          );
        } else {
          return (
            <div key={media.id} className="toot-media-attachment">
              <img
                className="toot-media-attachment-content"
                src={media.url}
                width="500"
                height="500"
                onClick={this._onClickImgListener}
              />
              {this.props.toot.sensitive ? sensitiveCover : null}
            </div>
          );
        }
      }
    );

    const timestamp = this._generateRelativeTimestamp();

    let tootContent = this.props.toot.spoiler_text
      ? this.props.toot.spoiler_text
      : this.props.toot.content;
    let spoiler = undefined;
    if (this.props.toot.spoiler_text) {
      spoiler = (
        <details className="spoiler" ref={this._spoilerRef}>
          <summary className="spoiler-summary">もっと見る</summary>
          <div
            className="spoiler-content"
            dangerouslySetInnerHTML={{ __html: this.props.toot.content }}
          />
        </details>
      );
    }

    return (
      <div className="toot-container">
        <div className="toot">
          <div className="toot-avatar-container">
            <img className="toot-avatar" src={this.props.toot.account.avatar} />
          </div>
          <div className="toot-main">
            <div className="toot-info">
              <span className="toot-name">
                {this.props.toot.account.display_name}
                <span className="toot-acct">
                  @{this.props.toot.account.acct}
                </span>
              </span>
              <span className="toot-timestamp">{timestamp}</span>
            </div>

            <div
              className="toot-content"
              dangerouslySetInnerHTML={{ __html: tootContent }}
              ref={this._tootContentRef}
            />
            {spoiler}
            <div className="toot-media-attachments-container">{mediaList}</div>

            <div className="toot-action-bar">
              <button
                className="toot-action-button toot-action-reply"
                data-toot-id={this.props.toot.id}
              />
              <button
                className="toot-action-button toot-action-boost"
                onClick={this._onClickBoostButtonListener}
                data-toot-id={this.props.toot.id}
                data-activated={this.state.reblogged}
              />
              <button
                className="toot-action-button toot-action-favourite"
                onClick={this._onClickFavouriteButtonListener}
                data-toot-id={this.props.toot.id}
                data-activated={this.state.favourited}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    // ボタンをクリックしたときIDをコピーする。
    if (this._tootContentRef.current) {
      const buttons = Array.from(
        this._tootContentRef.current.querySelectorAll('.multibattle-button')
      );
      for (const button of buttons) {
        button.addEventListener('click', this._onClickMultibattleButton);
      }
    }

    // CWの開閉時に表記を変える。
    if (this._spoilerRef.current) {
      const spoiler = this._spoilerRef.current;
      spoiler.addEventListener('toggle', this._onToggleSpoiler);
    }
  }

  componentWillUnmount() {
    // アンマウント時にイベントリスナを解除する。
    if (this._tootContentRef.current) {
      const buttons = Array.from(
        this._tootContentRef.current.querySelectorAll('.multibattle-button')
      );
      for (const button of buttons) {
        button.removeEventListener('click', this._onClickMultibattleButton);
      }
    }

    // CWのトグル時リスナー。
    if (this._spoilerRef.current) {
      const spoiler = this._spoilerRef.current;
      spoiler.removeEventListener('toggle', this._onToggleSpoiler);
    }
  }
}
