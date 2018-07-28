import * as React from 'react';
import { MastodonAccount } from '../lib/stump/mastodon';
import { WhiteflagColumn, WhiteflagColumnType } from '../lib/whiteflag';

interface SidebarProps {
  readonly mainColumn: WhiteflagColumn;
  readonly currentAccount: MastodonAccount | null;
  readonly selectedColumnType: WhiteflagColumnType;
  readonly changeColumnType: (
    columnId: string,
    type: WhiteflagColumnType,
    query?: any,
    unlinkPreviousColumn?: boolean
  ) => any;
}

export class Sidebar extends React.Component<SidebarProps> {
  render() {
    const avatarSrc = this.props.currentAccount
      ? this.props.currentAccount.avatar
      : '';
    const currentAccountId = this.props.currentAccount
      ? this.props.currentAccount.id
      : 'invalid';
    const currentAccountDisplayName = this.props.currentAccount
      ? this.props.currentAccount.display_name
      : '';
    const currentAccountAcct = this.props.currentAccount
      ? this.props.currentAccount.acct
      : '';
    const currentAccountQuery = {
      id: currentAccountId,
      displayName: currentAccountDisplayName,
      acct: currentAccountAcct
    };

    return (
      <nav className="sidebar">
        <div className="current-user-avatar-container">
          <img className="current-user-avatar" src={avatarSrc} />
        </div>

        <div
          className="sidebar-item"
          onClick={() =>
            this.props.changeColumnType(
              this.props.mainColumn.columnId,
              WhiteflagColumnType.WHITEFLAG_TOOT,
              {},
              true
            )
          }
          data-selected={
            this.props.selectedColumnType === WhiteflagColumnType.WHITEFLAG_TOOT
          }
        >
          <img className="sidebar-item-icon" src="images/toot.svg" />
        </div>

        <div
          className="sidebar-item"
          onClick={() =>
            this.props.changeColumnType(
              this.props.mainColumn.columnId,
              WhiteflagColumnType.HOME,
              {},
              true
            )
          }
          data-selected={
            this.props.selectedColumnType === WhiteflagColumnType.HOME
          }
        >
          <img className="sidebar-item-icon" src="images/home.svg" />
        </div>

        <div
          className="sidebar-item"
          onClick={() =>
            this.props.changeColumnType(
              this.props.mainColumn.columnId,
              WhiteflagColumnType.PUBLIC_LOCAL,
              {},
              true
            )
          }
          data-selected={
            this.props.selectedColumnType === WhiteflagColumnType.PUBLIC_LOCAL
          }
        >
          <img className="sidebar-item-icon" src="images/localtimeline.svg" />
        </div>

        <div
          className="sidebar-item"
          onClick={() =>
            this.props.changeColumnType(
              this.props.mainColumn.columnId,
              WhiteflagColumnType.PUBLIC,
              {},
              true
            )
          }
          data-selected={
            this.props.selectedColumnType === WhiteflagColumnType.PUBLIC
          }
        >
          <img className="sidebar-item-icon" src="images/timeline.svg" />
        </div>

        <div
          className="sidebar-item"
          onClick={() =>
            this.props.changeColumnType(
              this.props.mainColumn.columnId,
              WhiteflagColumnType.CURRENT_ACCOUNT,
              currentAccountQuery,
              true
            )
          }
          data-selected={
            this.props.selectedColumnType ===
            WhiteflagColumnType.CURRENT_ACCOUNT
          }
        >
          <img className="sidebar-item-icon" src="images/account.svg" />
        </div>

        <div
          className="sidebar-item"
          onClick={() =>
            this.props.changeColumnType(
              this.props.mainColumn.columnId,
              WhiteflagColumnType.HASHTAG_STUMP,
              {},
              true
            )
          }
          data-selected={
            this.props.selectedColumnType === WhiteflagColumnType.HASHTAG_STUMP
          }
        >
          <img className="sidebar-item-icon" src="images/stump.svg" />
        </div>

        <div
          className="sidebar-item"
          onClick={() =>
            this.props.changeColumnType(
              this.props.mainColumn.columnId,
              WhiteflagColumnType.HASHTAG_FLAG,
              {},
              true
            )
          }
          data-selected={
            this.props.selectedColumnType === WhiteflagColumnType.HASHTAG_FLAG
          }
        >
          <img className="sidebar-item-icon" src="images/flag.svg" />
        </div>

        <div
          className="sidebar-item"
          onClick={() =>
            this.props.changeColumnType(
              this.props.mainColumn.columnId,
              WhiteflagColumnType.WHITEFLAG_COLUMN,
              {},
              true
            )
          }
          data-selected={
            this.props.selectedColumnType ===
            WhiteflagColumnType.WHITEFLAG_COLUMN
          }
        >
          <img className="sidebar-item-icon" src="images/column.svg" />
        </div>

        <div
          className="sidebar-item"
          onClick={() =>
            this.props.changeColumnType(
              this.props.mainColumn.columnId,
              WhiteflagColumnType.WHITEFLAG_PREFERENCES,
              {},
              true
            )
          }
          data-selected={
            this.props.selectedColumnType ===
            WhiteflagColumnType.WHITEFLAG_PREFERENCES
          }
        >
          <img className="sidebar-item-icon" src="images/preferences.svg" />
        </div>
      </nav>
    );
  }
}
