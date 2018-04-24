'use strict';

import React, { Component } from 'react';
import {
  Modal,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  View,
  StatusBar,
} from 'react-native';
import AppColors from '../common/AppColors';
import AppButton from '../common/AppButton';
import LoginButton from '../common/LoginButton';
import {Paragraph, Heading1} from '../common/AppText';
import {createStylesheet} from '../common/AppStyleSheet';
import {validEmail} from '../common/validators';
import {sendLoginCodeViaEmail} from '../actions';
import { connect } from 'react-redux';

class EmailLoginModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emailAddress: '',
      confirmCode: '',
      isLoading: false,
      isConfirming: false,
      visibleBottom: 0,
    };

    this.updateEmail = this.updateEmail.bind(this);
    this.updateConfirmCode = this.updateConfirmCode.bind(this);
    this.continueWithEmail = this.continueWithEmail.bind(this);
    this.continueToConfirmCode = this.continueToConfirmCode.bind(this);
  }

  render() {
    var content;
    if (this.state.isLoading) {
      content = this.renderLoading();
    } else if (this.state.isConfirming) {
      content = this.renderConfirmForm();
    } else {
      content = this.renderEmailForm();
    }
    return (
      <Modal
        animationType={'slide'}
        transparent={false}
        visible={this.props.modalVisible}
        onRequestClose={() => this.props.hideEmailLoginModal()}
        >
        {content}
      </Modal>
    );
  }

  renderLoading() {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="white" size="large" />
        </View>
      </View>
    );
  }

  renderEmailForm() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityTraits="button"
          style={styles.backButton}
          onPress={() => this.props.hideEmailLoginModal()}>
          <Image
            source={require('../common/img/back_white.png')}
          />
        </TouchableOpacity>
        <View
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          style={styles.loginForm}>
          <Heading1 style={styles.title}>Login with email</Heading1>
          <View style={styles.textInputWrap}>
            <TextInput
              autoFocus={true}
              placeholder="Email address"
              multiline={false}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={'white'}
              returnKeyType="next"
              onSubmitEditing={() => this.continueWithEmail()}
              onChangeText={(text) => this.updateEmail(text)}
              style={styles.textField}
              value={this.state.emailAddress}
              underlineColorAndroid="transparent"
            />
          </View>
          <AppButton
            caption="Continue"
            buttonStyle={styles.continueButton}
            captionStyle={styles.continueButtonText}
            onPress={() => this.continueWithEmail()}
            type="square"
          />
        </View>
      </View>
    );
  }

  renderConfirmForm() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityTraits="button"
          style={styles.backButton}
          onPress={() => this.showEmailForm()}>
          <Image
            source={require('../common/img/back_white.png')}
          />
        </TouchableOpacity>
        <View
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          style={styles.loginForm}>
          <Heading1 style={styles.title}>Enter Login Code</Heading1>
          <View style={styles.explanation}>
            <Paragraph style={styles.explanationText}>
              A login code was just sent to your email.
              Look for an email from accounts@thegigsaloon.com and enter the code in the box below.
            </Paragraph>
          </View>
          <View style={styles.textInputWrap}>
            <TextInput
              autoFocus={false}
              placeholder="Login code"
              multiline={false}
              autoCapitalize="none"
              keyboardType="phone-pad"
              placeholderTextColor={'white'}
              onChangeText={(text) => this.updateConfirmCode(text)}
              style={styles.textField}
              value={this.state.confirmCode}
              underlineColorAndroid="transparent"
            />
          </View>
          <LoginButton
            type="email"
            source="First screen"
            style={styles.continueButton}
            captionStyle={styles.continueButtonText}
            email={this.state.emailAddress}
            code={this.state.confirmCode}
          />
          <TouchableOpacity style={styles.resendWrap} onPress={() => this.resendConfirmationCode()}>
            <Paragraph style={styles.resendLink}>
              Resend Code
            </Paragraph>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  updateConfirmCode(text) {
    text = text.trim();
    if ((text.length < 7 && /^\d+$/.test(text)) || text === '') {
      this.setState({confirmCode: text});
    }
  }

  resendConfirmationCode() {
    this.setState({isLoading: true});
    this.props.dispatch(sendLoginCodeViaEmail(this.state.emailAddress)).then(() => {
      this.setState({
        isLoading: false,
        isConfirming: true
      });
    });
  }

  continueToConfirmCode() {
    this.setState({isLoading: true});
    this.props.dispatch(sendLoginCodeViaEmail(this.state.emailAddress)).then(() => {
      this.setState({
        isLoading: false,
        isConfirming: true
      });
    });
  }

  continueWithEmail() {
    if (validEmail(this.state.emailAddress)) {
      Alert.alert(
        'Confirm Email',
        `Is ${this.state.emailAddress} correct?`,
        [
          {text: 'No', onPress: () => null, style: 'cancel'},
          {text: 'Yes', onPress: () => this.continueToConfirmCode()},
        ]
      );
    } else {
      alert('Please enter a valid email address!');
    }
  }

  showEmailForm() {
    this.setState({isConfirming: false});
  }

  updateEmail(text) {
    this.setState({emailAddress: text});
  }
}

var styles = createStylesheet({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 50,
    backgroundColor: AppColors.actionText,
    justifyContent: 'flex-start',
    android: {
      marginTop: -StatusBar.currentHeight
    }
  },
  backButton: {
    position: 'absolute',
    top: 35,
    left: 15,
  },
  title: {
    color: 'white',
  },
  formText: {
    color: 'white',
  },
  loginForm: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputWrap: {
    borderBottomWidth: 1,
    borderColor: 'white',
    marginVertical: 10,
    flexGrow: 1,
  },
  textField: {
    fontSize: 18,
    flexGrow: 1,
    height: 40,
    color: 'white',
    android: {
      textAlignVertical: 'top',
    },
  },
  continueButton: {
    backgroundColor: 'white',
    borderWidth: 0,
  },
  continueButtonText: {
    color: AppColors.actionText,
  },
  resendWrap: {
    marginTop: 10,
  },
  resendLink: {
    textAlign: 'center',
    color: 'white',
  },
  explanationText: {
    paddingVertical: 5,
    lineHeight: 17,
    color: 'white',
  },
});

module.exports = connect()(EmailLoginModal);
