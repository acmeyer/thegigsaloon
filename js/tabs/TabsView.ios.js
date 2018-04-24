//@flow
'use strict';

import React, {Component} from 'React';
import {
  TabBarIOS,
} from 'react-native';
import AppColors from '../common/AppColors';
import JobsView from './jobs/JobsView';
import NotificationsView from './notifications/NotificationsView';
import MeView from './me/MeView';
import unseenNotificationsCount from './notifications/unseenNotificationsCount';

import { switchTab } from '../actions';
import { connect } from 'react-redux';

class TabsView extends Component {

  onTabSelect(tab) {
    if (this.props.tab !== tab) {
      this.props.onTabSelect(tab);
    }
  }

  render() {
    return (
      <TabBarIOS
        barTintColor={AppColors.headerBackground}
        translucent={true}
        tintColor={AppColors.actionText}>
        <TabBarIOS.Item
          title="Gigs"
          selected={this.props.tab === 'jobs'}
          onPress={this.onTabSelect.bind(this, 'jobs')}
          icon={require('./jobs/img/gigs-icon.png')}
          selectedIcon={require('./jobs/img/gigs-icon-active.png')}>
          <JobsView navigator={this.props.navigator} />
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title="Notifications"
          selected={this.props.tab === 'notifications'}
          onPress={this.onTabSelect.bind(this, 'notifications')}
          badge={this.props.notificationsBadge || null}
          icon={require('./notifications/img/notifications-icon.png')}
          selectedIcon={require('./notifications/img/notifications-icon-active.png')}>
          <NotificationsView navigator={this.props.navigator} />
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title="Me"
          selected={this.props.tab === 'me'}
          onPress={this.onTabSelect.bind(this, 'me')}
          icon={require('./me/img/me-icon.png')}
          selectedIcon={require('./me/img/me-icon-active.png')}>
          <MeView navigator={this.props.navigator} />
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  }
}

function select(store) {
  return {
    tab: store.navigation.tab,
    notificationsBadge: unseenNotificationsCount(store),
  };
}

function actions(dispatch) {
  return {
    onTabSelect: (tab) => dispatch(switchTab(tab)),
  };
}

module.exports = connect(select, actions)(TabsView);
