//@flow
'use strict';

import AppColors from '../../common/AppColors';
import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import Share from 'react-native-share';
import JobRatingView from './JobRatingView';
import JobFollowButton from './JobFollowButton';
import CompanyLogo from '../../common/CompanyLogo';
import _ from 'lodash';
const { Crashlytics } = require('react-native-fabric');
const Mixpanel = require('react-native-mixpanel');
import {
  followGig,
  unfollowGig,
} from '../../actions';

import {connect} from 'react-redux';

class JobCell extends Component {
  constructor(props) {
    super(props);

    this.showApplicationURL = this.showApplicationURL.bind(this);
    this.showReviewGig = this.showReviewGig.bind(this);
    this.shareJob = this.shareJob.bind(this);
    this.toggleFollowingGig = this.toggleFollowingGig.bind(this);
  }

  render() {
    let footer;
    let userGigs = this.props.user.gigs.map((gig) => gig.id);
    if (!userGigs.includes(this.props.job.id)) {
      footer = (
        <View style={styles.cellFooter}>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => this.props.markHaveGig(this.props.job.id)}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>I Have This Gig</Text>
          </TouchableOpacity>
          <ApplicationButton
            onPressButton={() => this.showApplicationURL()}
            url={this.props.job.applicationURL}
          />
        </View>
      );
    } else if (!this.props.user.gigsReviewed.includes(this.props.job.id)) {
      footer = (
        <View style={styles.cellFooter}>
          <TouchableOpacity style={[styles.button]} onPress={() => this.showReviewGig()}>
            <Text style={[styles.buttonText]}>Review Gig</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.jobCell}>
        <TouchableHighlight onPress={() => this.props.showJobPage(this.props.job.id)}>
          <View style={styles.cell}>
            <View style={styles.cellHead}>
              <View style={styles.logoWrapper}>
                <CompanyLogo job={this.props.job} size={60} />
              </View>
              <View style={styles.bodyHeadRight}>
                <View style={styles.title}>
                  <Text style={styles.titleText}>
                    {this.props.job.jobType} with {this.props.job.companyName}
                  </Text>
                </View>
                <JobRatingView job={this.props.job} />
                <JobFollowButton
                  job={this.props.job}
                  followingGig={this.props.user.gigsFollowing.includes(this.props.job.id)}
                  handlePress={this.toggleFollowingGig} />
              </View>
              <View style={styles.shareButton}>
                <TouchableOpacity style={styles.shareJob} onPress={this.shareJob}>
                  <Image source={require('../../common/img/share.png')} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.cellBody}>
              <View style={styles.description}>
                <Text style={styles.descriptionText}>
                  {_.truncate(this.props.job.description, {length: 140})}
                </Text>
              </View>
              <View style={styles.showMore}>
                <Text style={styles.showMoreText}>Tap to see more</Text>
              </View>
            </View>
            {footer}
          </View>
        </TouchableHighlight>
      </View>
    );
  }

  toggleFollowingGig(jobId) {
    if (this.props.user.isLoggedIn) {
      if (this.props.user.gigsFollowing.includes(jobId)) {
        this.props.dispatch(unfollowGig(jobId));
      } else {
        this.props.dispatch(followGig(jobId));
      }
    } else {
      this.props.navigator.push({
        login: true,
      });
    }
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

  showReviewGig() {
    Mixpanel.trackWithProperties('Tapped to Review Gig', {job_id: this.props.job.id});
    this.props.navigator.push({ reviewGig: true, gig: this.props.job });
  }

  showApplicationURL() {
    Mixpanel.trackWithProperties('Tapped to Apply for Gig', {job_id: this.props.job.id, url: this.props.job.applicationURL});
    this.props.navigator.push({ jobApplication: true, url: this.props.job.applicationURL });
  }
}

class ApplicationButton extends Component {
  render() {
    return (
      <TouchableOpacity style={styles.button} onPress={this.props.onPressButton}>
        <Text style={styles.buttonText}>Apply Now</Text>
      </TouchableOpacity>
    );
  }
}


const styles = StyleSheet.create({
  jobCell: {
    marginBottom: 10,
    borderColor: AppColors.cellBorder,
    borderWidth: 1,
    backgroundColor: 'white',
  },
  cell: {
    backgroundColor: 'white',
  },
  cellHead: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  cellBody: {
    padding: 10,
  },
  cellFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  bodyHeadRight: {
    flex: 1,
  },
  logoWrapper: {
    width: 75,
    height: 60,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 15,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  requirementsList: {
    paddingHorizontal: 5,
    marginVertical: 10,
  },
  requirement: {
    fontSize: 15,
  },
  button: {
    backgroundColor: AppColors.actionText,
    padding: 10,
    flex: 1,
    marginTop: 10,
    borderRadius: 3,
    margin: 5,
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
    color: '#555555',
  },
  shareButton: {
    alignSelf: 'flex-start',
  },
  shareJob: {
    padding: 5,
  },
  showMore: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showMoreText: {
    color: AppColors.inactiveText,
  },
});

function select(store) {
  return {
    user: store.user,
  };
}

module.exports = connect(select)(JobCell);
