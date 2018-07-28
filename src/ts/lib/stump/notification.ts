import { MastodonNotification, MastodonNotificationType } from '../stump';

export class MastodonUserNotification {
  constructor(notificationData: MastodonNotification) {
    let title = notificationData.account.display_name;
    let body = '';

    switch (notificationData.type) {
      case MastodonNotificationType.MENTION: {
        break;
      }

      case MastodonNotificationType.FAVOURITE: {
        title += 'さんがあなたのトゥートをお気に入りに登録しました';
        break;
      }

      case MastodonNotificationType.REBLOG: {
        title += 'さんがあなたのトゥートをブーストしました';
        break;
      }

      case MastodonNotificationType.FOLLOW: {
        title += 'さんにフォローされました';
        break;
      }
    }

    if (notificationData.status) {
      body = notificationData.status.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
    }

    const notification = new Notification(title, {
      body,
      icon: notificationData.account.avatar
    });
  }
}
