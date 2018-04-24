'use strict';

import React, {Component} from 'React';
import {
  View,
  WebView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AppHeader from '../../common/AppHeader';
import AppColors from '../../common/AppColors';
import { Crashlytics } from 'react-native-fabric';
import EmptyList from '../../common/EmptyList';
import ApplicationLoginModal from './ApplicationLoginModal';
import { skipApplicationLogin } from '../../actions';

import { connect } from 'react-redux';

let WEBVIEW_REF = 'webview';

class JobApplicationView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: this.props.url,
      backButtonEnabled: false,
      forwardButtonEnabled: false,
      loading: true,
    };

    this.close = this.close.bind(this);
    this.goBack = this.goBack.bind(this);
    this.goForward = this.goForward.bind(this);
    this.renderLoading = this.renderLoading.bind(this);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
    this.onLogin = this.onLogin.bind(this);
  }

  render() {
    let leftItem;
    if (this.props.navigator) {
      leftItem = {
        title: 'Close',
        icon: require('../../common/img/x.png'),
        onPress: this.close
      };
    }

    let jsCode, modal;
    if (this.props.user.isLoggedIn) {
      jsCode = `
        ;(function() {
          var nameField = document.querySelector('input[name="name"],input[name="full_name"],input#application-user-name1,input[name="fullname"]');
          var firstNameField = document.querySelector('input[name="first_name"],input[name="firstName"],input[name="applicant[first_name]"],input#firstName,input[name="forename"],input[name="field41895173-first"],input[name="candidate_provider[first_name]"],input[name="fname"],input[name="profile_walker[account][username][first_name]"],input[name="apply[fname]"]');
          var lastNameField = document.querySelector('input[name="last_name"],input[name="lastName"],input[name="applicant[last_name]"],input#lastName,input[name="surname"],input[name="field41895173-last"],input[name="candidate_provider[last_name]"],input[name="lname"],input[name="profile_walker[account][username][last_name]"],input[name="apply[lname]"]');
          var emailField = document.querySelector('input[name="email"],input[name="email_address"],input[name="courier[email]"],input[name="applicant[email]"],input[name="custEmail"],input#email,input#emailAddress,input[name="field41895177"],input[name="candidate_provider[email]"],input[name="profile_walker[account][mail]"],input#application-user-email1,input[name="apply[email]"]');
          var emailConfirmField = document.querySelector('input[name="email_confirmation"],input[name="email2"],input[name="applicant[email_confirmation]"],input[name="courier[email_confirmation]"]');
          var cityField = document.querySelector('input[name="city"],select[name="applicant[applicant_region_name]"],input[name="locality"],select[name="city"],input[name="market"],select[name="city_code"],select[name="market"],input[name="region"],input[name="funnel_id"],input[placeholder="City"],select[name="utm_campaign"],select[name="timezone"],select[name="current_market_id"]');
          var postalCodeField = document.querySelector('input[name="postal_code"],input#zip,input[name="apply[zip]"],input#zipCode,input#zip_code,input#application-user-zip');
          var phoneNumberField = document.querySelector('input[name="phone"],input[name="phoneNumber"],input[name="phone_number"],input[name="mobile_phone"],input[name="applicant[phone]"],input#phone,input[name="custPhone"],input[name="apply[mobile]"],input[name="contactinfo"],input[name="field41895175"],input[name="profile_walker[account][phone][phone_number]"],input#application-user-phone1');
          var birthMonthField = document.querySelector('input[name="signup[dob_month]"],select[name="dobMonth"]');
          var birthDayField = document.querySelector('input[name="signup[dob_day]"],select[name="dobDay"]');
          var birthYearField = document.querySelector('input[name="signup[dob_year]"],select[name="dobYear"]');
          var dateOfBirthField = document.querySelector('input[name="dob"]');
          if (nameField) {
            nameField.value = "${this.props.user.name}";
          }
          if (firstNameField) {
            firstNameField.value = "${this.props.user.name.split(' ')[0]}"
          }
          if (lastNameField) {
            lastNameField.value = "${this.props.user.name.split(' ')[1]}"
          }
          if (emailField) {
            emailField.value = "${this.props.user.email ? this.props.user.email : ''}";
          }
          if (emailConfirmField) {
            emailConfirmField.value = "${this.props.user.email ? this.props.user.email : ''}";
          }
          if (phoneNumberField) {
            phoneNumberField.value = "${this.props.user.phoneNumber ? this.props.user.phoneNumber : ''}";
          }
          if (cityField) {
            cityField.value = "${this.props.user.city ? this.props.user.city : ''}";
          }
          if (postalCodeField) {
            postalCodeField.value = "${this.props.user.postalCode ? this.props.user.postalCode : ''}";
          }
          if (birthMonthField) {
            birthMonthField.value = "${this.props.user.birthMonth ? this.props.user.birthMonth : ''}";
          }
          if (birthDayField) {
            birthDayField.value = "${this.props.user.birthDay ? this.props.user.birthDay : ''}";
          }
          if (birthYearField) {
            birthYearField.value = "${this.props.user.birthYear ? this.props.user.birthYear : ''}";
          }
          if (dateOfBirthField) {
            dateOfBirthField.value = "${this.props.user.birthMonth ? this.props.user.birthMonth : ''}/${this.props.user.birthDay ? this.props.user.birthDay : ''}/${this.props.user.birthYear ? this.props.user.birthYear : ''}"
          }
        }());
      `;
    } else {
      if (!this.props.user.hasSkippedApplicationLogin) {
        modal = (
          <ApplicationLoginModal
            onLogin={this.onLogin}
            onSkipApplicationLogin={this.props.onSkipApplicationLogin}
          />
        );
      }
    }

    return (
      <View style={styles.container}>
        <AppHeader
          title="Apply Now"
          leftItem={leftItem}
        />
        <WebView
          ref={WEBVIEW_REF}
          source={{uri: this.state.url}}
          style={styles.webView}
          renderError={this.renderError}
          onNavigationStateChange={this.onNavigationStateChange}
          startInLoadingState={true}
          renderLoading={this.renderLoading}
          injectedJavaScript={jsCode}
          javaScriptEnabled={true}
        />
        <View style={styles.toolbar}>
          <View style={styles.navigation}>
            <TouchableOpacity onPress={() => this.goBack()}>
              <Image style={this.state.backButtonEnabled ? styles.navButton : styles.disabledButton} source={require('../../common/img/back.png')} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.goForward()}>
              <Image style={this.state.forwardButtonEnabled ? styles.navButton : styles.disabledButton} source={require('../../common/img/forward.png')} />
            </TouchableOpacity>
          </View>
        </View>
        {modal}
      </View>
    );
  }

  goBack() {
    this.refs[WEBVIEW_REF].goBack();
  }

  goForward() {
    this.refs[WEBVIEW_REF].goForward();
  }

  reload() {
    this.refs[WEBVIEW_REF].reload();
  }

  onLogin() {
    this.reload();
  }

  renderLoading() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  renderError(errorDomain, errorCode, errorDesc) {
    if (Platform.OS === 'ios') {
      Crashlytics.recordError('Error loading application page. Domain: ' + errorDomain + ', code: ' + errorCode + ', description: ' + errorDesc);
    } else {
      Crashlytics.logException('Error loading application page. Domain: ' + errorDomain + ', code: ' + errorCode + ', description: ' + errorDesc);
    }
    return (
      <View style={{flex: 1}}>
        <EmptyList
          title="Error loading page"
          text={errorDesc}
        />
      </View>
    );
  }

  onNavigationStateChange(navState) {
    this.setState({
      backButtonEnabled: navState.canGoBack,
      forwardButtonEnabled: navState.canGoForward,
      url: navState.url,
      status: navState.title,
      loading: navState.loading,
    });
  }

  close() {
    const {navigator, onClose} = this.props;
    if (navigator) {
      requestAnimationFrame(() => navigator.pop());
    }
    if (onClose) {
      onClose();
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.tableViewBackground,
  },
  webView: {
    flex: 1,
    backgroundColor: AppColors.tableViewBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    height: 44,
    paddingHorizontal: 15,
    backgroundColor: AppColors.headerBackground,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: AppColors.cellBorder,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    marginRight: 50,
  },
  disabledButton: {
    marginRight: 50,
    opacity: 0.3,
  },
});

function select(store) {
  return {
    user: store.user,
  };
}

function actions(dispatch) {
  return {
    onSkipApplicationLogin: () => dispatch(skipApplicationLogin()),
    dispatch,
  };
}

module.exports = connect(select, actions)(JobApplicationView);
