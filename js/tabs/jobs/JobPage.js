// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AppColors from '../../common/AppColors';
import AppHeader from '../../common/AppHeader';
import AppButton from '../../common/AppButton';
import JobPageControl from './JobPageControl';
import JobPageHeader from './JobPageHeader';
import JobDetailsView from './JobDetailsView';
import JobReviewsView from './JobReviewsView';
import JobFeedView from './JobFeedView';
import JobNewsView from './JobNewsView';
import Share from 'react-native-share';
import { Crashlytics } from 'react-native-fabric';
import Mixpanel from 'react-native-mixpanel';
import { getJob } from './getJob';
import { createSelector } from 'reselect';
import {connect} from 'react-redux';
import {
  switchJobList,
  loadPosts,
  loadArticles,
  loadReviews,
  markUserHasJob,
  followGig,
  unfollowGig,
} from '../../actions';

const data = createSelector(
  (store) => store.jobs.list,
  (store) => store.user.gigs,
  (store) => store.navigation.currentJobId,
  (jobs, userGigs, jobId) => getJob(jobs, userGigs, jobId),
);

class JobPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoadingReviews: true,
      isLoadingPosts: true,
      isLoadingArticles: true,
    };

    this.close = this.close.bind(this);
    this.shareJob = this.shareJob.bind(this);
    this.markHaveGig = this.markHaveGig.bind(this);
    this.showApplicationURL = this.showApplicationURL.bind(this);
    this.showReviewGig = this.showReviewGig.bind(this);
    this.switchList = this.switchList.bind(this);
    this.selectedSegment = this.selectedSegment.bind(this);
    this.composePost = this.composePost.bind(this);
    this.addNews = this.addNews.bind(this);
    this.finshedLoadingReviews = this.finshedLoadingReviews.bind(this);
    this.finshedLoadingPosts = this.finshedLoadingPosts.bind(this);
    this.finshedLoadingArticles = this.finshedLoadingArticles.bind(this);
    this.toggleFollowingGig = this.toggleFollowingGig.bind(this);
  }

  componentDidMount() {
    if (this.props.review && !this.props.user.gigsReviewed.includes(this.props.job.id)) {
      this.props.navigator.push({ reviewGig: true, gig: this.props.job });
    }
    this.props.loadReviews(this.props.job.id, 0).then(() => {
      this.finshedLoadingReviews();
    });
    this.props.loadPosts(this.props.job.companyName.toLowerCase(), 0).then(() => {
      this.finshedLoadingPosts();
    });
    this.props.loadArticles(this.props.job.companyName.toLowerCase(), 0).then(() => {
      this.finshedLoadingArticles();
    });
  }

  finshedLoadingReviews() {
    this.setState({isLoadingReviews: false});
  }

  finshedLoadingPosts() {
    this.setState({isLoadingPosts: false});
  }

  finshedLoadingArticles() {
    this.setState({isLoadingArticles: false});
  }

  render() {
    let leftItem, footer, extraListPadding;
    if (this.props.navigator) {
      leftItem = {
        title: 'Back',
        icon: require('../../common/img/back.png'),
        onPress: this.close,
        layout: 'icon'
      };
    }
    let rightItem = {
      title: 'Share',
      icon: Platform.OS === 'android' ? require('../../common/img/share.png') : require('../../common/img/share_blue.png'),
      onPress: this.shareJob,
      layout: 'icon'
    };
    if (this.props.list === 'details' || this.props.list === 'reviews') {
      let userGigs = this.props.user.gigs.map((gig) => gig.id);
      if (!userGigs.includes(this.props.job.id)) {
        footer = (
          <View style={[styles.applicationButtonWrap, {flexDirection: 'row'}]}>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => this.markHaveGig()}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>I Have This Gig</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => this.showApplicationURL()}>
              <Text style={styles.buttonText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        );
        extraListPadding = 50;
      } else if (!this.props.user.gigsReviewed.includes(this.props.job.id)) {
        footer = (
          <View style={styles.applicationButtonWrap}>
            <AppButton
              caption="Review Gig"
              onPress={() => this.showReviewGig()}
            />
          </View>
        );
        extraListPadding = 50;
      } else {
        extraListPadding = 0;
      }
    }
    if (this.props.list === 'feed') {
      footer = (
        <View style={styles.applicationButtonWrap}>
          <AppButton
            caption="Add Post"
            onPress={() => this.composePost()}
          />
        </View>
      );
      extraListPadding = 50;
    }
    if (this.props.list === 'news') {
      footer = (
        <View style={styles.applicationButtonWrap}>
          <AppButton
            caption="Add News"
            onPress={() => this.addNews()}
          />
        </View>
      );
      extraListPadding = 50;
    }
    return (
      <View style={styles.container}>
        <AppHeader
          rightItem={rightItem}
          leftItem={leftItem}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          alwaysBounceVertical={false}
          contentContainerStyle={{flex: 1}}>
          <View style={[styles.gigContainer, {paddingBottom: extraListPadding}]}>
            <JobPageHeader
              job={this.props.job}
              toggleFollowingGig={this.toggleFollowingGig}
              followingGig={this.props.followingGig}
            />
            <JobPageControl
              selectedSegment={this.selectedSegment(this.props.list)}
              onSegmentChange={this.switchList}>
              <JobDetailsView
                title="Details"
                job={this.props.job}
                navigator={this.props.navigator}
              />
              <JobReviewsView
                title="Reviews"
                job={this.props.job}
                navigator={this.props.navigator}
                isLoading={this.state.isLoadingReviews}
              />
              <JobFeedView
                title="Feed"
                job={this.props.job}
                navigator={this.props.navigator}
                isLoading={this.state.isLoadingPosts}
              />
              <JobNewsView
                title="News"
                job={this.props.job}
                navigator={this.props.navigator}
                isLoading={this.state.isLoadingArticles}
              />
            </JobPageControl>
          </View>
        </ScrollView>
        {footer}
      </View>
    );
  }

  toggleFollowingGig(jobId) {
    if (this.props.user.isLoggedIn) {
      if (this.props.user.gigsFollowing.includes(jobId)) {
        this.props.unfollowGig(jobId);
      } else {
        this.props.followGig(jobId);
      }
    } else {
      this.props.navigator.push({
        login: true,
      });
    }
  }

  selectedSegment(list) {
    switch (list) {
      case 'details':
        return 0;
      case 'reviews':
        return 1;
      case 'feed':
        return 2;
      case 'news':
        return 3;
      default:
        return 0;
    }
  }

  switchList(list) {
    let jobList;
    switch (list) {
      case 0:
        jobList = 'details';
        break;
      case 1:
        jobList = 'reviews';
        this.props.loadReviews(this.props.job.id, 0);
        break;
      case 2:
        jobList = 'feed';
        this.props.loadPosts(this.props.job.companyName.toLowerCase(), 0);
        break;
      case 3:
        jobList = 'news';
        this.props.loadArticles(this.props.job.companyName.toLowerCase(), 0);
        break;
    }
    this.props.switchJobList(jobList);
  }

  markHaveGig() {
    if (this.props.user.isLoggedIn) {
      this.props.markUserHasJob(this.props.job.id);
    } else {
      this.props.navigator.push({
        login: true,
      });
    }
  }

  close() {
    requestAnimationFrame(() => this.props.navigator.pop());
  }

  shareJob() {
    Mixpanel.trackWithProperties('Tapped to share job', {job_id: this.props.job.id});
    Share.open({
      message: 'Gig Economy Job: ' + `${this.props.job.jobType} with ${this.props.job.companyName}` + '\n--\nvia The Gig Saloon app',
      url: this.props.job.applicationURL
    },(e) => {
      if (Platform.OS === 'ios') {
        Crashlytics.recordError('Failed to load share job. Error: ' + e.message);
      } else {
        Crashlytics.logException('Failed to load share job. Error: ' + e.message);
      }
    });
  }

  showApplicationURL() {
    Mixpanel.trackWithProperties('Tapped to Apply for Gig', {job_id: this.props.job.id, url: this.props.job.applicationURL});
    this.props.navigator.push({ jobApplication: true, url: this.props.job.applicationURL });
  }

  showReviewGig() {
    Mixpanel.trackWithProperties('Tapped to Review Gig', {job_id: this.props.job.id});
    this.props.navigator.push({ reviewGig: true, gig: this.props.job });
  }

  composePost() {
    Mixpanel.trackWithProperties('Tapped to create post', {jobId: this.props.job.id, loggedIn: this.props.user.isLoggedIn});
    if (!this.props.user.isLoggedIn) {
      this.props.navigator.push({
        login: true,
      });
    } else {
      this.props.navigator.push({ composePost: true, job: this.props.job });
    }
  }

  addNews() {
    Mixpanel.trackWithProperties('Tapped to add news', {jobId: this.props.job.id, loggedIn: this.props.user.isLoggedIn});
    if (!this.props.user.isLoggedIn) {
      this.props.navigator.push({
        login: true,
      });
    } else {
      this.props.navigator.push({ addNews: true, job: this.props.job });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gigContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  applicationButtonWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: AppColors.cellBorder,
  },
  button: {
    backgroundColor: AppColors.actionText,
    padding: 10,
    flex: 1,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  secondaryButton: {
    backgroundColor: AppColors.secondaryButton,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: AppColors.mediumText,
  },
});

function select(store) {
  return {
    job: data(store),
    list: store.navigation.jobList,
    user: store.user,
    followingGig: store.user.gigsFollowing.includes(store.navigation.currentJobId),
  };
}

function actions(dispatch) {
  return {
    switchJobList: (list) => dispatch(switchJobList(list)),
    loadReviews: (jobId, page) => dispatch(loadReviews(jobId, page)),
    loadPosts: (tag, page) => dispatch(loadPosts(tag, page)),
    loadArticles: (tag, page) => dispatch(loadArticles(tag, page)),
    markUserHasJob: (jobId) => dispatch(markUserHasJob(jobId)),
    followGig: (jobId) => dispatch(followGig(jobId)),
    unfollowGig: (jobId) => dispatch(unfollowGig(jobId)),
  };
}

module.exports = connect(select, actions)(JobPage);
