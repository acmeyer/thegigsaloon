//@flow
'use strict';

var allNotifications = require('./allNotifications');
var { createSelector } = require('reselect');

import type {Notification, SeenNotifications} from '../../reducers/notifications';

function unseenNotificationsCount(notifications: Array<Notification>, seen: SeenNotifications): number {
  return notifications.filter((notification) => !seen[notification.id]).length;
}

module.exports = createSelector(
  allNotifications,
  (store) => store.notifications.seen,
  unseenNotificationsCount,
);
