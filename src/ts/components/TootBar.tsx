import * as React from 'react';
import { MastodonTootPost } from '../lib/stump/mastodon';
import {TootInput} from "./TootInput";

export interface TootBarProps {
  postToot: (toot: MastodonTootPost) => Promise<any>;
}


export class TootBar extends React.Component<TootBarProps> {
  constructor(props:TootBarProps) {
    super(props);
  }

  render() {
    return (
      <div className="tootbar" tabIndex={-1}>
        <TootInput postToot={this.props.postToot}/>
      </div>
    );
  }
}
