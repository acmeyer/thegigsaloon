//@flow
'use strict';

import React, {Component} from 'React';
import {
  Navigator,
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import EmailLoginModal from '../login/EmailLoginModal';
var NotificationsView = require('./notifications/NotificationsView');
var JobsView = require('./jobs/JobsView');
var MeView = require('./me/MeView');
var AppDrawerLayout = require('../common/AppDrawerLayout');
var AppColors = require('../common/AppColors');
var MenuItem = require('./MenuItem');
var AppButton = require('../common/AppButton');
var LoginButton = require('../common/LoginButton');
var ProfilePicture = require('../common/ProfilePicture');
var unseenNotificationsCount = require('./notifications/unseenNotificationsCount');

var { switchTab, logOutWithPrompt } = require('../actions');
var { connect } = require('react-redux');

import type {Tab} from '../reducers/navigation';

class TabsView extends Component {
  props: {
    tab: Tab;
    onTabSelect: (tab: Tab) => void;
    navigator: Navigator;
  };

  constructor(props) {
    super(props);

    this.state = {
      emailModalVisible: false,
    };

    this.showEmailLogin = this.showEmailLogin.bind(this);
    this.hideEmailLogin = this.hideEmailLogin.bind(this);
    this.renderNavigationView = this.renderNavigationView.bind(this);
    this.openDrawer = this.openDrawer.bind(this);
    this.openProfileView = this.openProfileView.bind(this);
  }

  getChildContext() {
    return {
      openDrawer: this.openDrawer,
      hasUnreadNotifications: this.props.notificationsBadge > 0,
    };
  }

  openDrawer() {
    this.refs.drawer.openDrawer();
  }

  openProfileView() {
    this.refs.drawer.closeDrawer();
    this.props.onTabSelect('me');
  }

  onTabSelect(tab: Tab) {
    if (this.props.tab !== tab) {
      this.props.onTabSelect(tab);
    }
    this.refs.drawer.closeDrawer();
  }

  renderNavigationView() {
    var accountItem, loginItem;

    if (this.props.user.isLoggedIn) {
      var name = this.props.user.name || '';
      accountItem = (
        <View style={styles.headerImage}>
          <TouchableOpacity onPress={this.openProfileView}>
            <ProfilePicture user={this.props.user} size={80} />
          </TouchableOpacity>
          <Text style={styles.name}>
            {name}
          </Text>
        </View>
      );
      loginItem = (
        <View style={styles.loginPrompt}>
          <AppButton
            style={styles.button}
            type="secondary"
            caption="Log Out"
            onPress={this.props.logOut}
          />
        </View>
      );
    } else {
      accountItem = (
        <View style={styles.headerImage}>
          <Image source={require('./img/logo.png')} />
        </View>
      );
      loginItem = (
        <View style={styles.loginPrompt}>
          <LoginButton source="Drawer" />
          <EmailLoginModal modalVisible={this.state.emailModalVisible} hideEmailLoginModal={this.hideEmailLogin} />
          <AppButton
            style={styles.loginLinks}
            captionStyle={styles.loginLinkText}
            type="secondary"
            caption="Login with Email"
            source="Modal"
            onPress={() => this.showEmailLogin()}
          />
        </View>
      );
    }
    return (
      <View style={styles.drawer}>
        <View style={styles.header}>
          {accountItem}
        </View>
        <MenuItem
          title="Gigs"
          selected={this.props.tab === 'jobs'}
          onPress={this.onTabSelect.bind(this, 'jobs')}
          icon={require('./jobs/img/gigs-icon.png')}
          selectedIcon={require('./jobs/img/gigs-icon-active.png')}
        />
        <MenuItem
          title="Notifications"
          selected={this.props.tab === 'notifications'}
          onPress={this.onTabSelect.bind(this, 'notifications')}
          badge={this.props.notificationsBadge}
          icon={require('./notifications/img/notifications-icon.png')}
          selectedIcon={require('./notifications/img/notifications-icon-active.png')}
        />
        <MenuItem
          title="Me"
          selected={this.props.tab === 'me'}
          onPress={this.onTabSelect.bind(this, 'me')}
          icon={require('./me/img/me-icon.png')}
          selectedIcon={require('./me/img/me-icon-active.png')}
        />
        {loginItem}
      </View>
    );
  }

  renderContent() {
    switch (this.props.tab) {
      case 'jobs':
        return <JobsView navigator={this.props.navigator}/>;

      case 'notifications':
        return <NotificationsView navigator={this.props.navigator} />;

      case 'me':
        return <MeView navigator={this.props.navigator} />;
    }
    throw new Error(`Unknown tab ${this.props.tab}`);
  }

  render() {
    return (
      <AppDrawerLayout
        ref="drawer"
        drawerWidth={290}
        drawerPosition="left"
        renderNavigationView={this.renderNavigationView}>
        <View style={styles.content} key={this.props.tab}>
          {this.renderContent()}
        </View>
      </AppDrawerLayout>
    );
  }

  showEmailLogin() {
    this.setState({emailModalVisible: true});
  }

  hideEmailLogin() {
    this.setState({emailModalVisible: false});
  }
}

TabsView.childContextTypes = {
  openDrawer: React.PropTypes.func,
  hasUnreadNotifications: React.PropTypes.bool,
};

function select(store) {
  return {
    tab: store.navigation.tab,
    user: store.user,
    notificationsBadge: unseenNotificationsCount(store),
  };
}

function actions(dispatch) {
  return {
    onTabSelect: (tab) => dispatch(switchTab(tab)),
    logOut: () => dispatch(logOutWithPrompt()),
  };
}

var styles = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 25,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    backgroundColor: AppColors.actionText,
  },
  headerImage: {
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 17,
    marginTop: 15,
    color: 'white',
  },
  name: {
    marginTop: 15,
    fontSize: 15,
    color: 'white',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  loginText: {
    fontSize: 12,
    color: AppColors.lightText,
    textAlign: 'center',
    marginVertical: 10,
  },
  loginLinks: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginLinkText: {
    color: AppColors.lightText,
  },
  loginLink: {
    paddingHorizontal: 5,
  }
});

module.exports = connect(select, actions)(TabsView);
