//@flow
'use strict';

import {
  Platform,
  VibrationIOS,
} from 'react-native';
import OneSignal from 'react-native-onesignal';
import Mixpanel from 'react-native-mixpanel';
const { updateInstallation } = require('./installation');
const { loadNotifications } = require('./parse');
const { switchTab } = require('./navigation');

import type { Action, ThunkAction } from './types';

function normalizeData(s: string | Object): Object {
  if (s && typeof s === 'object') {
    return s;
  }
  try {
    return JSON.parse(s);
  } catch (e) {
    return {};
  }
}

async function storeDeviceToken(deviceToken: string): Promise<Action> {
  const pushType = Platform.OS === 'android' ? 'gcm' : 'apns';
  if (deviceToken) {
    // Register device tokens with Mixpanel
    if (Platform.OS === 'android') {
      Mixpanel.setPushRegistrationId(deviceToken);
    } else {
      Mixpanel.addPushDeviceToken(deviceToken);
    }
  }
  await updateInstallation({
    pushType,
    deviceToken,
    deviceTokenLastModified: Date.now(),
  });
  return {
    type: 'REGISTERED_PUSH_NOTIFICATIONS',
  };
}

function turnOnPushNotifications(): Action {
  return {
    type: 'TURNED_ON_PUSH_NOTIFICATIONS',
  };
}

function skipPushNotifications(): Action {
  return {
    type: 'SKIPPED_PUSH_NOTIFICATIONS',
  };
}

function receivePushNotification(notification): ThunkAction {
  return (dispatch) => {
    const data = normalizeData(notification.payload.additionalData);

    if (!notification.isAppInFocus) {
      dispatch(switchTab('notifications'));
    }

    if (notification.isAppInFocus) {
      dispatch(loadNotifications());

      if (Platform.OS === 'ios') {
        VibrationIOS.vibrate();
      }
    }

    if (data.e) {
      return;
    }

    const timestamp = new Date().getTime();
    dispatch({
      type: 'RECEIVED_PUSH_NOTIFICATION',
      notification: {
        title: notification.payload.title,
        text: notification.payload.body,
        url: data.url,
        time: timestamp,
      },
    });
  };
}

function markAllNotificationsAsSeen(): Action {
  if (Platform.OS === 'android') {
    OneSignal.clearOneSignalNotifications();
  }
  return {
    type: 'SEEN_ALL_NOTIFICATIONS',
  };
}

module.exports = {
  turnOnPushNotifications,
  storeDeviceToken,
  skipPushNotifications,
  receivePushNotification,
  markAllNotificationsAsSeen,
};
