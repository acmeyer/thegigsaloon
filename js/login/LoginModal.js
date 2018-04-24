//@flow
'use strict';

import React, {Component} from 'React';
import LoginButton from '../common/LoginButton';
import {
  StyleSheet,
  View,
  Navigator,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import AppButton from '../common/AppButton';
import EmailLoginModal from './EmailLoginModal';
import {Heading1, Paragraph} from '../common/AppText';

class LoginModal extends Component {
  props: {
    navigator: Navigator;
    onLogin: () => void;
  };

  constructor(props) {
    super(props);

    this.state = {
      emailModalVisible: false,
    };

    this.showEmailLogin = this.showEmailLogin.bind(this);
    this.hideEmailLogin = this.hideEmailLogin.bind(this);
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.content}
          source={require('./img/login-background.png')}>
          <Heading1 style={styles.h1}>
            Log in to join the gig community.
          </Heading1>
          <Paragraph style={styles.h2}>
            By logging in you'll be able to:
          </Paragraph>
          <View style={styles.feature}>
            <Paragraph style={styles.featureBullet}>{'\u2022'}</Paragraph>
            <Paragraph style={styles.featureText}>Create a profile and have new gig applications pre-filled with your information.</Paragraph>
          </View>
          <View style={styles.feature}>
            <Paragraph style={styles.featureBullet}>{'\u2022'}</Paragraph>
            <Paragraph style={styles.featureText}>Create, comment, and like posts.</Paragraph>
          </View>
          <View style={styles.feature}>
            <Paragraph style={styles.featureBullet}>{'\u2022'}</Paragraph>
            <Paragraph style={styles.featureText}>Add news items.</Paragraph>
          </View>
          <View style={styles.feature}>
            <Paragraph style={styles.featureBullet}>{'\u2022'}</Paragraph>
            <Paragraph style={styles.featureText}>Keep track of the gigs you work and follow them.</Paragraph>
          </View>
          <View style={styles.actions}>
            <LoginButton onLoggedIn={() => this.loggedIn()} />
            <EmailLoginModal modalVisible={this.state.emailModalVisible} hideEmailLoginModal={this.hideEmailLogin} />
            <AppButton
              style={styles.button}
              captionStyle={styles.notNowLabel}
              type="secondary"
              caption="Login with Email"
              source="Modal"
              onPress={() => this.showEmailLogin()}
            />
            <AppButton
              style={styles.button}
              captionStyle={styles.notNowLabel}
              type="secondary"
              caption="Not Now"
              source="Modal"
              onPress={() => this.props.navigator.pop()}
            />
          </View>
        </Image>
      </View>
    );
  }

  showEmailLogin() {
    this.setState({emailModalVisible: true});
  }

  hideEmailLogin() {
    this.setState({emailModalVisible: false});
  }

  loggedIn() {
    this.props.navigator.pop();
    this.props.onLogin();
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    padding: 30,
    backgroundColor: 'transparent',
    borderRadius: 3,
    alignItems: 'center',
    // Image's source contains explicit size, but we want
    // it to prefer flex: 1
    width: undefined,
    height: undefined,
  },
  h1: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  h2: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  feature: {
    flexDirection: 'row'
  },
  featureText: {
    flex: 1,
    paddingLeft: 5,
    color: 'white',
  },
  featureBullet: {
    color: 'white',
  },
  actions: {
    marginTop: 30,
  },
  button: {
    marginTop: 10,
    alignSelf: 'center',
  },
  notNowLabel: {
    color: 'white',
  },
  loginLinks: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginLinkText: {
    color: 'white',
  },
  loginLink: {
    paddingHorizontal: 5,
  }
});

module.exports = LoginModal;
