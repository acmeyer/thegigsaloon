// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  StatusBar,
  View,
  AppState
} from 'react-native';

import AppNavigator from './AppNavigator';
import LoginScreen from './login/LoginScreen';
import CollectUserInfoScreen from './login/CollectUserInfoScreen';
import PushNotificationsController from './PushNotificationsController';
import AppToast from './AppToast';
import CodePush from 'react-native-code-push';
import DeviceInfo from 'react-native-device-info';
import {version} from './env';
import {
  loadConfig,
  loadJobs,
  loadNotifications,
  loadFilters,
  syncUser,
  appLaunched,
  updateAppVersion,
} from './actions';
import { updateInstallation } from './actions/installation';
import { connect } from 'react-redux';

class GSApp extends Component {
  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));

    this.props.dispatch(loadConfig());

    if (this.props.isLoggedIn) {
      this.props.dispatch(syncUser());
    }
    this.props.dispatch(loadNotifications());
    this.props.dispatch(loadFilters());
    this.props.dispatch(loadJobs(this.props.filter));

    this.props.dispatch(appLaunched());

    if (DeviceInfo.getVersion() !== this.props.appVersion) {
      this.props.dispatch(updateAppVersion());
    }

    updateInstallation({version});
    CodePush.sync({installMode: CodePush.InstallMode.ON_NEXT_RESUME});
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange.bind(this));
  }

  handleAppStateChange(appState) {
    if (appState === 'active') {
      this.props.dispatch(loadConfig());

      if (this.props.isLoggedIn) {
        this.props.dispatch(syncUser());
      }
      this.props.dispatch(loadNotifications());
      this.props.dispatch(loadFilters());
      CodePush.sync({installMode: CodePush.InstallMode.ON_NEXT_RESUME});
    }
  }

  render() {
    if (!this.props.isLoggedIn && !this.props.hasSkippedLogin) {
      return <LoginScreen />;
    }
    if (this.props.isLoggedIn && !this.props.hasSkippedInfoCollection) {
      return <CollectUserInfoScreen />;
    }
    return (
      <View style={styles.container}>
        <StatusBar
          translucent={true}
          backgroundColor="rgba(0, 0, 0, 0.3)"
          barStyle="default"
        />
        <AppNavigator />
        <PushNotificationsController />
        <AppToast />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function select(store) {
  return {
    appVersion: store.user.appVersion,
    isLoggedIn: store.user.isLoggedIn,
    hasSkippedLogin: store.user.hasSkippedLogin,
    hasSkippedInfoCollection: store.user.hasSkippedInfoCollection,
    filter: store.filter,
  };
}

module.exports = connect(select)(GSApp);
