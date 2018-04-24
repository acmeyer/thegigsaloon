//@flow
'use strict';

var { createSelector } = require('reselect');

import type {Notification} from '../../reducers/notifications';

// Merges lists of notifications from server and notifications
// received via push and makes sure there is no duplicates.
function mergeAndSortByTime(server: Array<Notification>, push: Array<Notification>): Array<Notification> {
  var uniquePush = push.filter((pushNotification) => {
    var existsOnServer = server.find(
      (serverNotification) => serverNotification.text === pushNotification.text
    );
    return !existsOnServer;
  });

  var all = [].concat(server, uniquePush);
  return all.sort((a, b) => b.time - a.time);
}

module.exports = createSelector(
  (store) => store.notifications.server,
  (store) => store.notifications.push,
  mergeAndSortByTime
);
