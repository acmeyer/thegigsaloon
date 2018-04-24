// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AppColors from '../../common/AppColors';
import PureListView from '../../common/PureListView';
import EmptyList from '../../common/EmptyList';
import JobCell from './JobCell';
var Mailer = require('NativeModules').RNMail;
import { Crashlytics } from 'react-native-fabric';
const Mixpanel = require('react-native-mixpanel');
import _ from 'lodash';
import {
  showJob,
  loadingJobsTimeout,
  markUserHasJob,
} from '../../actions';
import { getJobsWithoutCurrent, getJobsWithoutCurrentUnshuffled } from './getJob';
import { createSelector } from 'reselect';
import {connect} from 'react-redux';


const data = createSelector(
  (store) => store.jobs.list,
  (store) => store.user.gigs,
  (jobs, userGigs) => getJobsWithoutCurrent(jobs, userGigs),
);

const unshuffledJobs = createSelector(
  (store) => store.jobs.list,
  (store) => store.user.gigs,
  (jobs, userGigs) => getJobsWithoutCurrentUnshuffled(jobs, userGigs),
);

var loadTimeout;

class AvailableJobsView extends Component {
  constructor(props) {
    super(props);

    this.renderEmptyList = this.renderEmptyList.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.showJobPage = this.showJobPage.bind(this);
    this.markHaveGig = this.markHaveGig.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.loadingJobs) {
      loadTimeout = setTimeout(() => {
        this.props.dispatch(loadingJobsTimeout());
        alert('Loading gigs timed out. Try again when you have a better connection.');
      }, 8000);
    } else {
      clearTimeout(loadTimeout);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.loadingJobs || this.props.loadingJobs !== nextProps.loadingJobs) {
      return true;
    } else if (!_.isEqual(this.props.unshuffledJobs, nextProps.unshuffledJobs)) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    let content;
    if (this.props.loadingJobs) {
      content = (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      content = (
        <PureListView
          data={this.props.jobs}
          renderEmptyList={this.renderEmptyList}
          renderRow={this.renderRow}
          renderFooter={this.renderFooter}
          renderSeparator={() => null}
          style={styles.listView}
          tabBarSpace={true}
        />
      );
    }

    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  }

  renderRow(job) {
    return (
      <JobCell
        key={job.id}
        job={job}
        navigator={this.props.navigator}
        showJobPage={this.showJobPage}
        markHaveGig={this.markHaveGig}
      />
    );
  }

  renderFooter() {
    return (
      <View style={styles.listFooter}>
        <Text>Think we're missing information?</Text>
        <TouchableOpacity onPress={this.reportMissingInformation.bind(this)}>
          <Text style={styles.linkText}>Tell us what we're missing</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderEmptyList() {
    return (
      <View style={{flex: 1}}>
        <EmptyList
          title="No gigs found"
          text="There were no gigs found with these filters. Try changing some filters to see more."
        />
        <View style={styles.listFooter}>
          <TouchableOpacity onPress={this.reportInaccurateResults.bind(this)}>
            <Text style={styles.linkText}>Report inaccurate results</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  showJobPage(jobId) {
    if (jobId) {
      this.props.dispatch(showJob(jobId));
      this.props.navigator.push({ jobPage: true, jobId: jobId });
    }
  }

  markHaveGig(jobId) {
    if (this.props.user.isLoggedIn) {
      this.props.dispatch(markUserHasJob(jobId));
    } else {
      this.props.navigator.push({
        login: true,
      });
    }
  }

  reportInaccurateResults() {
    Mixpanel.track('Tapped to report inaccurate results');
    this.sendEmailMessage('Reporting Inaccurate Results for Gigs');
  }

  reportMissingInformation() {
    Mixpanel.track('Tapped to report missing information');
    this.sendEmailMessage('Reporting Missing Information');
  }

  sendEmailMessage(subject) {
    Mailer.mail({
      subject: subject,
      recipients: ['support@thegigsaloon.com'],
      body: '',
    }, (error, event) => {
        if (error) {
          if (Platform.OS === 'ios') {
            Crashlytics.recordError('Failed to send email. Error: ' + error.message);
          } else {
            Crashlytics.logException('Failed to send email. Error: ' + error.message);
          }
          alert('Could not send mail. Please send an email to support@thegigsaloon.com');
        }
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listView: {
    padding: 10,
    backgroundColor: AppColors.tableViewBackground,
  },
  loadingContainer: {
    flex: 1,
    padding: 0,
    backgroundColor: AppColors.tableViewBackground,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listFooter: {
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  linkText: {
    marginTop: 5,
    color: AppColors.actionText,
  },
});

function select(store) {
  return {
    jobs: data(store),
    unshuffledJobs: unshuffledJobs(store),
    loadingJobs: store.jobs.loading,
    user: store.user,
  };
}

module.exports = connect(select)(AvailableJobsView);
