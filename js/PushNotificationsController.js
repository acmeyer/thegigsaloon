//@flow
'use strict';

import {Component} from 'React';
import {
  AppState,
  Platform,
  PushNotificationIOS,
} from 'react-native';
import unseenNotificationsCount from './tabs/notifications/unseenNotificationsCount';
import OneSignal from 'react-native-onesignal';
import { connect } from 'react-redux';
import {
  storeDeviceToken,
  receivePushNotification,
  updateInstallation,
  markAllNotificationsAsSeen,
} from './actions';

import type {Dispatch} from './actions/types';

class AppBadgeController extends Component {
  props: {
    tab: string;
    enabled: boolean;
    badge: number;
    dispatch: Dispatch;
  };

  constructor() {
    super();

    (this: any).handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  handleAppStateChange(appState) {
    if (appState === 'active') {
      this.updateAppBadge();
      if (this.props.tab === 'notifications') {
        this.eventuallyMarkNotificationsAsSeen();
      }
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    const {dispatch} = this.props;
    OneSignal.configure({
      onIdsAvailable: (device) => dispatch(storeDeviceToken(device.pushToken)),
      onNotificationReceived: (notification) => dispatch(receivePushNotification(notification)),
      onNotificationOpened: (openResult) => dispatch(receivePushNotification(openResult.notification))
    });
    OneSignal.inFocusDisplaying(0);

    this.updateAppBadge();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.enabled && this.props.enabled) {
      OneSignal.registerForPushNotifications();
    }
    if (this.props.badge !== prevProps.badge) {
      this.updateAppBadge();
    }
    if (this.props.tab === 'notifications' && prevProps.tab !== 'notifications') {
      this.eventuallyMarkNotificationsAsSeen();
    }
  }

  updateAppBadge() {
    if (this.props.enabled && Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(this.props.badge);
      updateInstallation({badge: this.props.badge});
    }
  }

  eventuallyMarkNotificationsAsSeen() {
    const {dispatch} = this.props;
    setTimeout(() => dispatch(markAllNotificationsAsSeen()), 1000);
  }

  render() {
    return null;
  }
}

function select(store) {
  return {
    enabled: store.notifications.enabled === true,
    badge: unseenNotificationsCount(store),
    tab: store.navigation.tab,
  };
}

module.exports = connect(select)(AppBadgeController);
