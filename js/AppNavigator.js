// @flow
'use strict';

import React, {Component} from 'React';
import TabsView from './tabs/TabsView';
import FilterScreen from './filter/FilterScreen';
import LoginModal from './login/LoginModal';
import ComposePostScreen from './tabs/discuss/ComposePostScreen';
import AddNewsView from './tabs/jobs/AddNewsView';
import PostDetailsScreen from './tabs/discuss/PostDetailsScreen';
import JobApplicationView from './tabs/jobs/JobApplicationView';
import JobPage from './tabs/jobs/JobPage';
import GigReview from './tabs/jobs/GigReview';
import AccountDetailsView from './tabs/me/AccountDetailsView';
import SettingsView from './tabs/me/SettingsView';
import CreditsView from './tabs/me/CreditsView';
import EditProfileView from './tabs/me/EditProfileView';
import Lightbox from './common/Lightbox';
import {
  StyleSheet,
  Navigator,
  Platform,
  BackAndroid,
  Linking,
} from 'react-native';
const Mixpanel = require('react-native-mixpanel');
const {Crashlytics} = require('react-native-fabric');

import {urlScheme} from './env';
import { connect } from 'react-redux';
import { switchTab, showJob, showPost, switchJobList } from './actions';

class AppNavigator extends Component {
  _handlers = [];

  constructor(props) {
    super(props);

    this.addBackButtonListener = this.addBackButtonListener.bind(this);
    this.removeBackButtonListener = this.removeBackButtonListener.bind(this);
    this.handleBackButton = this.handleBackButton.bind(this);
    this.handleDeepLink = this.handleDeepLink.bind(this);
    this.renderScene = this.renderScene.bind(this);
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', this.handleBackButton);

    Linking.addEventListener('url', this.handleDeepLink);
    if (Platform.OS === 'android') {
      Linking.getInitialURL().then((url) => {
        if (url) {
          this.handleDeepLink(url);
        }
      }).catch(err => {
        if (Platform.OS === 'ios') {
          Crashlytics.recordError('Failed to load post deep link. Error: ' + err.message);
        } else {
          Crashlytics.logException('Failed to load post deep link. Error: ' + err.message);
        }
      });
    }
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress', this.handleBackButton);
    Linking.removeEventListener('url', this.handleDeepLink);
  }

  getChildContext() {
    return {
      addBackButtonListener: this.addBackButtonListener,
      removeBackButtonListener: this.removeBackButtonListener,
    };
  }

  addBackButtonListener(listener) {
    this._handlers.push(listener);
  }

  removeBackButtonListener(listener) {
    this._handlers = this._handlers.filter((handler) => handler !== listener);
  }

  handleBackButton() {
    for (let i = this._handlers.length - 1; i >= 0; i--) {
      if (this._handlers[i]()) {
        return true;
      }
    }

    const {navigator} = this.refs;
    if (navigator && navigator.getCurrentRoutes().length > 1) {
      navigator.pop();
      return true;
    }

    if (this.props.tab !== 'jobs') {
      this.props.dispatch(switchTab('jobs'));
      return true;
    }
    return false;
  }

  handleDeepLink(e) {
    const {navigator} = this.refs;
    // Deep linking
    let url = Platform.OS === 'android' ? e : e.url;
    if (url) {
      var slug;
      if (url.includes(urlScheme)) {
        slug = url.replace(urlScheme, '');
      } else if (url.includes('http://www.thegigsaloon.com/posts/?post=')) {
        // handle thegigsaloon.com urls
        slug = url.replace('http://www.thegigsaloon.com/posts/?post=', 'post/');
      } else {
        return;
      }

      if (slug.includes('post/')) {
        var post_id = url.replace(urlScheme + 'post/', '');
        this.props.dispatch(showPost(post_id));
        navigator.push({postDetails: true, postId: post_id});
      }
      if (slug.includes('jobReview/')) {
        var jobId = url.replace(urlScheme + 'jobReview/', '');
        this.props.dispatch(showJob(jobId));
        navigator.push({ jobPage: true, jobId: jobId, review: true });
      }
      if (slug.includes('job/')) {
        if (slug.includes('/feed')) {
          var jobId = url.replace(urlScheme + 'job/', '');
          jobId = jobId.replace('/feed', '');
          this.props.dispatch(showJob(jobId));
          navigator.push({ jobPage: true, jobId: jobId });
          this.props.dispatch(switchJobList('feed'));
        } else if (slug.includes('/news')) {
          var jobId = url.replace(urlScheme + 'job/', '');
          jobId = jobId.replace('/news', '');
          this.props.dispatch(showJob(jobId));
          navigator.push({ jobPage: true, jobId: jobId });
          this.props.dispatch(switchJobList('news'));
        } else if (slug.includes('/reviews')) {
          var jobId = url.replace(urlScheme + 'job/', '');
          jobId = jobId.replace('/reviews', '');
          this.props.dispatch(showJob(jobId));
          this.props.navigator.push({ jobPage: true, jobId: jobId });
          this.props.dispatch(switchJobList('reviews'));
        } else {
          var jobId = url.replace(urlScheme + 'job/', '');
          this.props.dispatch(showJob(jobId));
          navigator.push({ jobPage: true, jobId: jobId });
        }
      }
      if (slug.includes('jobs')) {
        this.props.dispatch(switchTab('jobs'));
      }
      // for backwards compatibility
      if (slug.includes('discuss')) {
        this.props.dispatch(switchTab('jobs'));
      }
      if (slug.includes('news')) {
        this.props.dispatch(switchTab('jobs'));
      }
    }
  }

  render() {
    return (
      <Navigator
        ref="navigator"
        style={styles.container}
        configureScene={(route) => {
          if (Platform.OS === 'android') {
            if (route.postDetails || route.accountDetailsList || route.jobPage || route.settings || route.credits || route.editProfile || route.postsList) {
              return Navigator.SceneConfigs.FloatFromRight;
            } else if (route.lightbox) {
              return Navigator.SceneConfigs.FadeAndroid;
            } else {
              return Navigator.SceneConfigs.FloatFromBottomAndroid;
            }
          } else {
            if (route.postDetails || route.accountDetailsList || route.jobPage || route.settings || route.credits || route.editProfile || route.postsList) {
              return Navigator.SceneConfigs.FloatFromRight;
            } else {
              return Navigator.SceneConfigs.FloatFromBottom;
            }
          }
        }}
        initialRoute={{}}
        renderScene={this.renderScene}
      />
    );
  }

  renderScene(route, navigator) {
    if (route.filter) {
      Mixpanel.track('Viewed Jobs Filter Screen');
      return (
        <FilterScreen navigator={navigator} />
      );
    }
    if (route.composePost) {
      Mixpanel.track('Viewed Compose Post Screen');
      return (
        <ComposePostScreen navigator={navigator} job={route.job} />
      );
    }
    if (route.addNews) {
      Mixpanel.track('Viewed Add News Screen');
      return (
        <AddNewsView navigator={navigator} job={route.job} />
      );
    }
    if (route.postDetails) {
      return (
        <PostDetailsScreen
          navigator={navigator}
          postId={route.postId}
        />
      );
    }
    if (route.jobPage) {
      return (
        <JobPage
          navigator={navigator}
          review={route.review}
        />
      );
    }
    if (route.reviewGig) {
      Mixpanel.trackWithProperties('Viewed Gig Review Screen', {job_id: route.gig.id});
      return (
        <GigReview
          navigator={navigator}
          gig={route.gig}
        />
      );
    }
    if (route.accountDetailsList) {
      Mixpanel.trackWithProperties('Viewed Account Details Screen', {type: route.type});
      return (
        <AccountDetailsView
          navigator={navigator}
          type={route.type}
        />
      );
    }
    if (route.settings) {
      Mixpanel.track('Viewed Settings Screen');
      return (
        <SettingsView
          navigator={navigator}
        />
      );
    }
    if (route.credits) {
      Mixpanel.track('Viewed Credits Screen');
      return (
        <CreditsView
          navigator={navigator}
        />
      );
    }
    if (route.login) {
      Mixpanel.track('Viewed Login Modal');
      return (
        <LoginModal
          navigator={navigator}
          onLogin={route.callback}
        />
      );
    }
    if (route.editProfile) {
      Mixpanel.track('Viewed Edit Profile Screen');
      return (
        <EditProfileView
          navigator={navigator}
        />
      );
    }
    if (route.lightbox) {
      Mixpanel.track('Viewed Photo Lightbox');
      return (
        <Lightbox
          navigator={navigator}
          photoSource={route.photoSource}
        />
      );
    }
    if (route.jobApplication) {
      Mixpanel.trackWithProperties('Viewed Job Application Screen', {url: route.url});
      return (
        <JobApplicationView
          navigator={navigator}
          url={route.url}
        />
      );
    }

    return <TabsView navigator={navigator} />;
  }
}

AppNavigator.childContextTypes = {
  addBackButtonListener: React.PropTypes.func,
  removeBackButtonListener: React.PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

function select(store) {
  return {
    tab: store.navigation.tab,
    topics: store.discussTopics,
  };
}

module.exports = connect(select)(AppNavigator);
