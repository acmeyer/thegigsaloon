//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
} from 'react-native';
import {Heading2} from '../../common/AppText';
import FilterItem from './FilterItem';

class RequirementsFilterScreen extends Component {
  render() {
    var requirements = this.props.requirements.map((requirement, ii) => (
      <FilterItem
        key={requirement}
        item={requirement}
        isChecked={this.props.selectedRequirements[requirement]}
        onToggle={() => this.props.toggleRequirement(requirement)}
      />
    ));
    return (
      <View style={styles.container}>
        <Heading2 style={styles.text}>
          Select all of the requirements that you meet below.
        </Heading2>
        <View style={styles.requirements}>
          {requirements}
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
  requirements: {
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

module.exports = RequirementsFilterScreen;
