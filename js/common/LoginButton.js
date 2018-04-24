//@flow
'use strict';

import React, {Component} from 'React';
import {StyleSheet} from 'react-native';
import AppButton from './AppButton';

const { logInWithFacebook, logInWithEmail } = require('../actions');
const {connect} = require('react-redux');

class LoginButton extends Component {
  props: {
    style: any;
    source?: string; // For Analytics
    dispatch: (action: any) => Promise;
    onLoggedIn: ?() => void;
  };
  state: {
    isLoading: boolean;
  };
  _isMounted: boolean;

  constructor() {
    super();
    this.state = { isLoading: false };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    if (this.props.type && this.props.type === 'email') {
      if (this.state.isLoading) {
        return (
          <AppButton
            buttonStyle={this.props.style}
            captionStyle={this.props.captionStyle}
            caption="Please wait..."
            type="square"
          />
        );
      }
      return (
        <AppButton
          caption="Login"
          buttonStyle={this.props.style}
          captionStyle={this.props.captionStyle}
          onPress={() => this.emailLogIn()}
          type="square"
        />
      );
    } else {
      if (this.state.isLoading) {
        return (
          <AppButton
            style={[styles.button, this.props.style]}
            caption="Please wait..."
            type="fb-login"
          />
        );
      }
      return (
        <AppButton
          style={[styles.button, this.props.style]}
          icon={require('../login/img/f-logo.png')}
          caption="Log in with Facebook"
          type="fb-login"
          onPress={() => this.fbLogIn()}
        />
      );
    }
  }

  async emailLogIn() {
    const {dispatch, email, code} = this.props;

    this.setState({isLoading: true});
    try {
      await Promise.race([
        dispatch(logInWithEmail(email, code, this.props.source)),
        // timeout(15000),
      ]);
    } catch (e) {
      const message = e.message || e;
      if (message !== 'Timed out' && message !== 'Canceled by user') {
        alert(message);
        console.warn(e);
      }
      return;
    } finally {
      this._isMounted && this.setState({isLoading: false});
    }
  }

  async fbLogIn() {
    const {dispatch, onLoggedIn} = this.props;

    this.setState({isLoading: true});
    try {
      await Promise.race([
        dispatch(logInWithFacebook(this.props.source)),
        // timeout(15000),
      ]);
    } catch (e) {
      const message = e.message || e;
      if (message !== 'Timed out' && message !== 'Canceled by user') {
        alert(message);
        console.warn(e);
      }
      return;
    } finally {
      this._isMounted && this.setState({isLoading: false});
    }

    onLoggedIn && onLoggedIn();
  }
}

// async function timeout(ms: number): Promise {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => reject(new Error('Timed out')), ms);
//   });
// }

var styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    width: 270,
  },
});

module.exports = connect()(LoginButton);
