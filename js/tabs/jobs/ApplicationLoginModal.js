//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
} from 'react-native';
import AppButton from '../../common/AppButton';
import LoginButton from '../../common/LoginButton';
import {Heading1, Paragraph} from '../../common/AppText';

class ApplicationLoginModal extends Component {

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.content}>
            <Heading1>
              Want to make this easier?
            </Heading1>
            <Paragraph style={styles.text}>
              Login with Facebook and we'll prefill fields with your basic information, helping to make your life just a little easier :)
            </Paragraph>
            <LoginButton onLoggedIn={() => this.props.onLogin()} />
            <AppButton
              style={styles.button}
              type="secondary"
              caption="No thanks"
              onPress={this.props.onSkipApplicationLogin}
            />
          </View>
        </View>
      </View>
    );
  }
}


var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.66)',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  inner: {
    overflow: 'hidden',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  image: {
    alignSelf: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    marginVertical: 20,
  },
  page: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: undefined,
    paddingBottom: 0,
  },
  button: {
    marginTop: 10,
    alignSelf: 'stretch',
  },
});

module.exports = ApplicationLoginModal;
