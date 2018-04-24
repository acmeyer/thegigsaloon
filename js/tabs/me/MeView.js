// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import AppButton from '../../common/AppButton';
import AppHeader from '../../common/AppHeader';
import AppColors from '../../common/AppColors';
import EmailLoginModal from '../../login/EmailLoginModal';
import {Heading1, Heading3, Paragraph} from '../../common/AppText';
import LoginButton from '../../common/LoginButton';
import ProfilePicture from '../../common/ProfilePicture';
import MyLinks from './MyLinks';
import moment from 'moment';

import {connect} from 'react-redux';

class MeView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emailModalVisible: false,
    };

    this.openSettings = this.openSettings.bind(this);
    this.showEmailLogin = this.showEmailLogin.bind(this);
    this.hideEmailLogin = this.hideEmailLogin.bind(this);
    this.showEditProfile = this.showEditProfile.bind(this);
  }

  render() {
    const rightItem = {
      icon: require('./img/settings.png'),
      title: 'Settings',
      layout: 'icon',
      onPress: this.openSettings,
    };
    var content, user, login, myLinks;
    if (this.props.user.isLoggedIn) {
      user = this.renderUserInfo();
      myLinks = this.renderMyLinks();
      content = (
        <ScrollView
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          style={styles.listView}>
          {myLinks}
        </ScrollView>
      );
    } else {
      user = this.renderEmptyUser();
      login = this.renderLoginView();
      content = (
        <View style={styles.loginContainer}>
          {login}
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <AppHeader
          rightItem={rightItem}>
          <View style={styles.user}>
            {user}
          </View>
        </AppHeader>
        {content}
      </View>
    );
  }

  renderUserInfo() {
    var memberSince;
    if (this.props.user.createdAt) {
      memberSince = <Text style={styles.memberSince}>Member since: {moment(this.props.user.createdAt).format('MMM \'YY')}</Text>;
    }
    return (
      <View style={styles.userWrap}>
        <ProfilePicture user={this.props.user} size={100} />
        <Heading3 style={styles.userName}>{this.props.user.name}</Heading3>
        <TouchableOpacity style={styles.link} onPress={this.showEditProfile}>
          <Text style={styles.linkText}>
            Edit Profile
          </Text>
        </TouchableOpacity>
        {memberSince}
      </View>
    );
  }

  renderMyLinks() {
    return (
      <MyLinks navigator={this.props.navigator} />
    );
  }

  renderEmptyUser() {
    return (
      <View>
        <Image style={styles.defaultUserImage} source={require('./img/default-user.png')} />
      </View>
    );
  }

  renderLoginView() {
    return (
      <View>
        <Heading1 style={styles.loginHeading}>Login to create a profile.</Heading1>
        <Paragraph style={styles.loginParagraph}>
          Create a profile and have new gig applications pre-filled with your information.
          After logging in, you will be able to add, like, and comment on posts.
          You can also keep track of the gigs you work and subscribe to their notifications.
        </Paragraph>
        <LoginButton source="Info screen" />
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

  showEditProfile() {
    this.props.navigator.push({ editProfile: true });
  }

  showEmailLogin() {
    this.setState({emailModalVisible: true});
  }

  hideEmailLogin() {
    this.setState({emailModalVisible: false});
  }

  openSettings() {
    this.props.navigator.push({settings: true});
  }
}

const TAB_SPACE = Platform.OS === 'ios' ? 49 : 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  user: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  userWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    paddingTop: 10,
    textAlign: 'center',
  },
  defaultUserImage: {
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
  },
  listView: {
    flex: 1,
    backgroundColor: AppColors.tableViewBackground,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: TAB_SPACE,
  },
  loginDescription: {
    color: AppColors.inactiveText,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 10,
  },
  loginHeading: {
    marginBottom: 15,
    textAlign: 'center',
  },
  loginParagraph: {
    textAlign: 'center',
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  memberSince: {
    marginTop: 5,
    color: AppColors.inactiveText,
  },
  loginLinks: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginLinkText: {
    color: AppColors.inactiveText,
  },
  loginLink: {
    paddingHorizontal: 5,
  },
  link: {
    paddingVertical: 5,
  },
  linkText: {
    color: AppColors.actionText,
  }
});

function select(store) {
  return {
    user: store.user,
  };
}

module.exports = connect(select)(MeView);
