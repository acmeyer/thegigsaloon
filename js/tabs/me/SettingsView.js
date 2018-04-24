//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  Platform,
} from 'react-native';
import AppHeader from '../../common/AppHeader';
import AppColors from '../../common/AppColors';
import PureListView from '../../common/PureListView';
import LinksList from './LinksList';
import NotificationLinks from './NotificationLinks';
import { logOutWithPrompt } from '../../actions';

import { connect } from 'react-redux';

const SUPPORT_LINKS = [{
  title: 'Feedback',
  openMail: true,
}];

const appReviewLink = Platform.OS === 'ios'
  ? 'http://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=1140712550&pageNumber=0&sortOrdering=2&type=Purple+Software&mt=8'
  : 'https://play.google.com/store/apps/details?id=com.gigsaloon';

const REVIEW_LINKS = [{
  title: 'Review this app',
  url: appReviewLink,
}];

const ABOUT_LINKS = [{
  title: 'Website',
  url: 'http://thegigsaloon.com/',
}, {
  title: 'Twitter',
  url: 'https://twitter.com/TheGigSaloon'
}, {
  title: 'Terms of Use',
  url: 'http://thegigsaloon.com/terms.html',
}, {
  title: 'Privacy Policy',
  url: 'http://thegigsaloon.com/privacy.html',
}, {
  title: 'Credits',
  credits: true,
}];

class SettingsView extends Component {
  constructor(props) {
    super(props);

    this.close = this.close.bind(this);
    this.logUserOut = this.logUserOut.bind(this);
  }

  render() {
    var settings, rightItem;
    if (this.props.user.isLoggedIn) {
      settings = this.renderSettingsInfo();
      rightItem = {
        icon: require('./img/logout.png'),
        title: 'Logout',
        onPress: this.logUserOut,
      };
    }
    const leftItem = {
      icon: require('../../common/img/back.png'),
      title: 'Back',
      layout: 'icon',
      onPress: this.close,
    };
    return (
      <View style={styles.container}>
        <AppHeader
          title="Settings"
          leftItem={leftItem}
          rightItem={rightItem}
        />
        <PureListView
          style={styles.listView}
          enableEmptySections={true}
          tabBarSpace={false}
          renderRow={() => null}
          renderEmptyList={() => (
            <View style={{paddingBottom: 20}}>
              {settings}
              <Section title="Support">
                <LinksList links={SUPPORT_LINKS} />
              </Section>
              <Section title="Review">
                <LinksList links={REVIEW_LINKS} />
              </Section>
              <Section title="About">
                <LinksList navigator={this.props.navigator} links={ABOUT_LINKS} />
              </Section>
            </View>
          )}
        />
      </View>
    );
  }

  renderSettingsInfo() {
    return (
      <Section title="Push Notifications">
        <NotificationLinks />
      </Section>
    );
  }

  close() {
    if (this.props.navigator) {
      this.props.navigator.pop();
    }
  }

  logUserOut() {
    this.props.logOut();
  }
}

class Section extends Component {
  render() {
    var header;
    if (this.props.title) {
      header = (
        <View style={styles.header}>
          <Text style={styles.title}>
            {this.props.title.toUpperCase()}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.section, this.props.style]}>
        {header}
        {this.props.children}
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  separator: {
    marginHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  header: {
    paddingHorizontal: 20,
  },
  title: {
    paddingVertical: 5,
    fontSize: 13,
    color: AppColors.inactiveText,
  },
  listView: {
    backgroundColor: AppColors.tableViewBackground,
  },
});

function actions(dispatch) {
  return {
    logOut: () => dispatch(logOutWithPrompt()),
  };
}

function select(store) {
  return {
    user: store.user
  };
}

module.exports = connect(select, actions)(SettingsView);
