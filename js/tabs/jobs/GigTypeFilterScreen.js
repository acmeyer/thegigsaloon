//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
} from 'react-native';
import {Heading2} from '../../common/AppText';
import FilterItem from './FilterItem';

class GigTypeFilterScreen extends Component {
  render() {
    var jobTypes = this.props.jobTypes.map((jobType, ii) => (
      <FilterItem
        key={jobType}
        item={jobType}
        isChecked={this.props.selectedJobTypes[jobType]}
        onToggle={() => this.props.toggleJobType(jobType)}
      />
    ));
    return (
      <View style={styles.container}>
        <Heading2 style={styles.text}>
          What kind of gig(s) are you looking for?
        </Heading2>
        <View style={styles.jobTypes}>
          {jobTypes}
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  jobTypes: {
    paddingVertical: 15,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  text: {
    marginBottom: 10,
    textAlign: 'center',
  },
});

module.exports = GigTypeFilterScreen;
