//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  Switch,
} from 'react-native';
import ItemsWithSeparator from '../../common/ItemsWithSeparator';

import { toggleNotificationSetting } from '../../actions';
import { connect } from 'react-redux';

class NotificationLinks extends Component {
  constructor(props) {
    super(props);

    this.handleSwitch = this.handleSwitch.bind(this);
  }

  render() {
    return (
      <ItemsWithSeparator separatorStyle={styles.separator}>
        <Row
          title="My Posts"
          key="myPosts"
          handleSwitch={(value) => this.handleSwitch(value, 'allowMyPostNotifications')}
          switchedOn={this.props.user.allowMyPostNotifications}
        />
        <Row
          title="My Comments"
          key="myComments"
          handleSwitch={(value) => this.handleSwitch(value, 'allowMyCommentNotifications')}
          switchedOn={this.props.user.allowMyCommentNotifications}
        />
        <Row
          title="Posts I've Commented On"
          key="myPostComments"
          handleSwitch={(value) => this.handleSwitch(value, 'allowCommentedPostNotifications')}
          switchedOn={this.props.user.allowCommentedPostNotifications}
        />
        <Row
          title="Posts I've Liked"
          key="likedPosts"
          handleSwitch={(value) => this.handleSwitch(value, 'allowLikedPostNotifications')}
          switchedOn={this.props.user.allowLikedPostNotifications}
        />
        <Row
          title="When Someone Likes My Reviews"
          key="likedReviews"
          handleSwitch={(value) => this.handleSwitch(value, 'allowLikedReviewsNotifications')}
          switchedOn={this.props.user.allowLikedReviewsNotifications}
        />
        <Row
          title="When Someone Likes My News Items"
          key="likedArticles"
          handleSwitch={(value) => this.handleSwitch(value, 'allowLikedArticlesNotifications')}
          switchedOn={this.props.user.allowLikedArticlesNotifications}
        />
      </ItemsWithSeparator>
    );
  }

  handleSwitch(value, type) {
    this.props.dispatch(toggleNotificationSetting(type, value));
  }
}

class Row extends Component {
  render() {
    return (
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={2}>
          {this.props.title}
        </Text>
        <Switch
          onValueChange={this.props.handleSwitch}
          value={this.props.switchedOn} />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  separator: {
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 17,
    flex: 1,
  },
});

function select(store) {
  return {
    user: store.user
  };
}

module.exports = connect(select)(NotificationLinks);
