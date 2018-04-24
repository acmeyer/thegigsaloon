// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import AppColors from '../../common/AppColors';
import JobRatingView from './JobRatingView';
import JobFollowButton from './JobFollowButton';
import CompanyLogo from '../../common/CompanyLogo';

class JobPageHeader extends Component {

  render() {
    return (
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <CompanyLogo job={this.props.job} size={60} />
        </View>
        <View style={styles.title}>
          <Text style={styles.titleText}>
            {this.props.job.jobType} with {this.props.job.companyName}
          </Text>
          <JobRatingView job={this.props.job} />
          <JobFollowButton
            job={this.props.job}
            followingGig={this.props.followingGig}
            handlePress={this.props.toggleFollowingGig} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: AppColors.cellBorder,
  },
  logoWrapper: {
    width: 75,
    height: 60,
  },
  title: {
    flex: 1,
    flexWrap: 'wrap',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

module.exports = JobPageHeader;
