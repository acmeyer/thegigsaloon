//@flow
'use strict';

import React, {Component} from 'React';
import {
  Animated,
  StatusBar,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AppButton from '../common/AppButton';
import AppColors from '../common/AppColors';
import LoginButton from '../common/LoginButton';
import Swiper from 'react-native-swiper';
import IntroScreen from './IntroScreen';
import LoginTutorialView from './LoginTutorialView';
import EmailLoginModal from './EmailLoginModal';
import { createStylesheet } from '../common/AppStyleSheet';
import { skipLogin } from '../actions';
import { connect } from 'react-redux';

const BOTTOM_HEIGHT = Platform.OS === 'android' ? 100 : 100;

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anim: new Animated.Value(0),
      emailModalVisible: false,
    };

    this.showEmailLogin = this.showEmailLogin.bind(this);
    this.hideEmailLogin = this.hideEmailLogin.bind(this);
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      StatusBar && StatusBar.setBarStyle('light-content');
    }
    Animated.timing(this.state.anim, {toValue: 3000, duration: 3000}).start();
  }

  render() {
    let statusBar;
    if (Platform.OS === 'android') {
      statusBar = (
        <StatusBar
          translucent={true}
          backgroundColor="rgba(0, 0, 0, 0.3)"
          barStyle="light-content"
        />
      );
    }
    return (
      <View
        style={styles.container}>
        {statusBar}
        <Animated.View style={this.fadeIn(300, 20)}>
          <Swiper
            showsButtons={true}
            loop={false}
            activeDot={<View style={styles.activeDot} />}
            buttonWrapperStyle={styles.buttonWrapper}
            nextButton={<SwiperButton><Text style={styles.swiperButtonText}>Next</Text></SwiperButton>}
            prevButton={<SwiperButton><Text style={styles.swiperButtonText}>Back</Text></SwiperButton>}
            height={Dimensions.get('window').height - BOTTOM_HEIGHT}>
            <IntroScreen />
            <LoginTutorialView
              imageSrc={require('./img/login-tutorial-gigs.png')}
              titleText="Find New Gigs"
              description="Find new gigs based on the requirements you meet and where you live. Apply to gigs with pre-filled applications."
            />
            <LoginTutorialView
              imageSrc={require('./img/login-tutorial-reviews.png')}
              titleText="Review Gigs"
              description="Write reviews for the gigs you've worked. Let others know what to expect."
            />
            <LoginTutorialView
              imageSrc={require('./img/login-tutorial-news.png')}
              titleText="Don't Miss a Beat"
              description="Stay up to date. Follow the gigs you care about."
            />
            <LoginTutorialView
              imageSrc={require('./img/login-tutorial-discuss.png')}
              titleText="Share Your Experience"
              description="Share tips and information with others in the community."
            />
          </Swiper>
        </Animated.View>
        <TouchableOpacity
          accessibilityLabel="Skip login"
          accessibilityTraits="button"
          style={styles.skip}
          onPress={() => this.props.dispatch(skipLogin())}>
          <Animated.Image
            style={this.fadeIn(2800)}
            source={require('../common/img/white-x.png')}
          />
        </TouchableOpacity>
        <Animated.View style={[styles.section, styles.end, this.fadeIn(2000, 20)]}>
          <LoginButton source="First screen" />
          <EmailLoginModal modalVisible={this.state.emailModalVisible} hideEmailLoginModal={this.hideEmailLogin} />
          <AppButton
            style={styles.loginLinks}
            captionStyle={styles.loginLinkText}
            type="secondary"
            caption="Login with Email"
            source="Modal"
            onPress={() => this.showEmailLogin()}
          />
        </Animated.View>
      </View>
    );
  }

  showEmailLogin() {
    this.setState({emailModalVisible: true});
  }

  hideEmailLogin() {
    this.setState({emailModalVisible: false});
  }

  fadeIn(delay, from = 0) {
    const {anim} = this.state;
    return {
      opacity: anim.interpolate({
        inputRange: [delay, Math.min(delay + 500, 3000)],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      transform: [{
        translateY: anim.interpolate({
          inputRange: [delay, Math.min(delay + 500, 3000)],
          outputRange: [from, 0],
          extrapolate: 'clamp',
        }),
      }],
    };
  }
}

class SwiperButton extends Component {
  render() {
    return (
      <View style={styles.swiperButton}>
        {this.props.children}
      </View>
    );
  }
}

var styles = createStylesheet({
  container: {
    flex: 1,
    backgroundColor: AppColors.actionText,
  },
  section: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: {
    position: 'absolute',
    right: 0,
    top: 20,
    padding: 15,
  },
  end: {
    alignItems: 'center',
  },
  activeDot: {
    backgroundColor: 'white',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  buttonWrapper: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  swiperButton: {
    borderWidth: 1,
    borderRadius: 3,
    borderColor: 'white',
  },
  swiperButtonText: {
    color: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  loginLinks: {
    ios: {
      marginVertical: 10,
    },
    android: {
      marginTop: 5,
      paddingVertical: 10,
    }
  },
  loginLinkText: {
    color: 'white',
  },
  loginLink: {
    paddingHorizontal: 5,
  }
});

module.exports = connect()(LoginScreen);
