import * as React from 'react';
import {
  MastodonAttachment,
  MastodonTootPost,
  MastodonTootPostParams,
  MastodonTootStatus
} from '../lib/stump/mastodon';
import { TootInput } from './TootInput';

export interface TootBarProps {
  currentToot: MastodonTootPost;
  currentAttachments: MastodonAttachment[];

  changeCurrentToot: (toot: MastodonTootPost) => void;
  changeCurrentAttachments: (attachments: MastodonAttachment[]) => void;
  postToot: (toot: MastodonTootPost) => Promise<MastodonTootStatus>;
}

export class TootBar extends React.Component<TootBarProps> {
  constructor(props: TootBarProps) {
    super(props);
  }

  render() {
    return (
      <div className="tootbar" tabIndex={-1}>
        <TootInput
          currentToot={this.props.currentToot}
          currentAttachments={this.props.currentAttachments}
          changeCurrentToot={this.props.changeCurrentToot}
          changeCurrentAttachments={this.props.changeCurrentAttachments}
          postToot={this.props.postToot}
        />
      </div>
    );
  }
}
