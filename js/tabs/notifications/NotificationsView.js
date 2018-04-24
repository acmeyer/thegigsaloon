//@flow
'use strict';

import React, {Component} from 'React';
import {
  Linking,
  Platform,
  ActionSheetIOS,
  View,
  StyleSheet,
} from 'react-native';
import PushNUXModal from './PushNUXModal';
import AppColors from '../../common/AppColors';
import AppHeader from '../../common/AppHeader';
import PureListView from '../../common/PureListView';
import EmptyList from '../../common/EmptyList';
import NotificationCell from './NotificationCell';
import allNotifications from './allNotifications';
import { connect } from 'react-redux';
import {
  turnOnPushNotifications,
  skipPushNotifications,
  TEST_MENU,
} from '../../actions';
import {dev, version, urlScheme} from '../../env';
import Mixpanel from 'react-native-mixpanel';
import { switchTab, showJob, showPost, switchJobList } from '../../actions';

import { createSelector } from 'reselect';

const data = createSelector(
  allNotifications,
  (store) => store.notifications.enabled,
  (notifications, enabled) => {
    return [...notifications];
  }
);

class NotificationsView extends Component {

  constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
    this.renderEmptyList = this.renderEmptyList.bind(this);
    this.openNotification = this.openNotification.bind(this);
  }

  render() {
    var modal;
    if (this.props.nux) {
      modal = (
        <PushNUXModal
          onTurnOnNotifications={this.props.onTurnOnNotifications}
          onSkipNotifications={this.props.onSkipNotifications}
        />
      );
    }

    return (
      <View style={styles.container}>
        <AppHeader
          title="Notifications"
          {...this.renderTestItems()}
        />
        <PureListView
          data={this.props.notifications}
          renderEmptyList={this.renderEmptyList}
          renderRow={this.renderRow}
          style={styles.listView}
          tabBarSpace={true}
        />
        {modal}
      </View>
    );
  }

  renderRow(notification) {
    return (
      <NotificationCell
        key={notification.id}
        notification={notification}
        onPress={() => this.openNotification(notification)}
      />
    );
  }

  renderEmptyList() {
    return (
      <EmptyList
        title="No Notifications Yet"
        text="Important information or announcements will appear here"
      />
    );
  }

  openNotification(notification) {
    Mixpanel.trackWithProperties('Tapped to view notification', {notification: notification.text, notification_id: notification.id, notification_url: notification.url});
    if (notification.url) {
      let url = notification.url;
      if (notification.url.includes(urlScheme)) {
        var slug = notification.url.replace(urlScheme, '');
        if (slug.includes('post/')) {
          var post_id = url.replace(urlScheme + 'post/', '');
          this.props.dispatch(showPost(post_id));
          this.props.navigator.push({postDetails: true, postId: post_id});
        }
        if (slug.includes('jobReview/')) {
          var jobId = url.replace(urlScheme + 'jobReview/', '');
          this.props.dispatch(showJob(jobId));
          this.props.navigator.push({ jobPage: true, jobId: jobId, review: true });
        }
        if (slug.includes('job/')) {
          if (slug.includes('/feed')) {
            var jobId = url.replace(urlScheme + 'job/', '');
            jobId = jobId.replace('/feed', '');
            this.props.dispatch(showJob(jobId));
            this.props.navigator.push({ jobPage: true, jobId: jobId });
            this.props.dispatch(switchJobList('feed'));
          } else if (slug.includes('/news')) {
            var jobId = url.replace(urlScheme + 'job/', '');
            jobId = jobId.replace('/news', '');
            this.props.dispatch(showJob(jobId));
            this.props.navigator.push({ jobPage: true, jobId: jobId });
            this.props.dispatch(switchJobList('news'));
          } else if (slug.includes('/reviews')) {
            var jobId = url.replace(urlScheme + 'job/', '');
            jobId = jobId.replace('/reviews', '');
            this.props.dispatch(showJob(jobId));
            this.props.navigator.push({ jobPage: true, jobId: jobId });
            this.props.dispatch(switchJobList('reviews'));
          } else {
            var jobId = url.replace(urlScheme + 'job/', '');
            this.props.dispatch(showJob(jobId));
            this.props.navigator.push({ jobPage: true, jobId: jobId });
          }
        }
        // for backwards compatibility
        else if (slug.includes('discuss')) {
          this.props.dispatch(switchTab('jobs'));
        }
        else if (slug.includes('news')) {
          this.props.dispatch(switchTab('jobs'));
        }
        if (slug.includes('jobs')) {
          this.props.dispatch(switchTab('jobs'));
        }
      } else {
        Linking.openURL(notification.url);
      }
    }
  }

  renderTestItems() {
    if (!dev) {
      return {};
    }

    if (Platform.OS === 'ios') {
      return {
        rightItem: {
          title: 'Test',
          onPress: () => this.showTestMenu(),
        },
      };
    }

    if (Platform.OS === 'android') {
      return {
        extraItems: Object.keys(TEST_MENU).map((title) => ({
          title,
          onPress: () => this.props.dispatch(TEST_MENU[title]()),
        })),
      };
    }
  }

  showTestMenu() {
    const itemTitles = Object.keys(TEST_MENU);
    ActionSheetIOS.showActionSheetWithOptions({
      title: 'Testing app v' + version,
      options: ['Cancel', ...itemTitles],
      cancelButtonIndex: 0,
    }, (idx) => {
        if (idx === 0) {
          return;
        }

        const action: any = TEST_MENU[itemTitles[idx - 1]];
        this.props.dispatch(action());
      }
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listView: {
    backgroundColor: AppColors.tableViewBackground,
  },
});

function select(state) {
  return {
    nux: state.notifications.enabled === null,
    notifications: data(state),
    posts: state.posts,
    topics: state.discussTopics,
  };
}

function actions(dispatch) {
  return {
    onTurnOnNotifications: () => dispatch(turnOnPushNotifications()),
    onSkipNotifications: () => dispatch(skipPushNotifications()),
    dispatch,
  };
}

module.exports = connect(select, actions)(NotificationsView);
