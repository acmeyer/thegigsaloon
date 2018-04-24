// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
} from 'react-native';
import AppColors from '../../common/AppColors';
import ItemsWithSeparator from '../../common/ItemsWithSeparator';


class JobDetailsView extends Component {

  render() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        alwaysBounceVertical={false}
        contentContainerStyle={styles.container}>
        <ItemsWithSeparator>
          <DetailsList
            title="Description"
            data={this.props.job.description}
          />
          <DetailsList
            title="Positions"
            data={this.props.job.roles}
          />
          <DetailsList
            title="Requirements"
            data={this.props.job.requirements}
          />
        </ItemsWithSeparator>
      </ScrollView>
    );
  }
}

class DetailsList extends Component {
  render() {
    var content;
    if (!this.props.data) {
      content = <Text style={styles.mutedText}>Not available</Text>;
    } else if (typeof this.props.data === 'string') {
      content = <Text>{this.props.data}</Text>;
    } else {
      if (this.props.data.length > 0) {
        content = this.props.data.map(function(field, key) {
          return (
            <Text key={key}>
              - {field}
            </Text>
          );
        });
      } else {
        content = <Text style={styles.requirement}>- None</Text>;
      }
    }

    return (
      <View style={styles.detailsListWrap}>
        <Text style={styles.detailsListTitle}>{this.props.title}</Text>
        <View style={styles.detailsList}>
          {content}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  position: {
    marginBottom: 10,
    alignItems: 'center',
  },
  positionText: {
    color: AppColors.inactiveText,
  },
  detailsListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsListWrap: {
    marginVertical: 10,
  },
  detailsList: {
    paddingVertical: 5,
  },
  requirement: {
    fontSize: 15,
  },
  mutedText: {
    color: AppColors.inactiveText,
  },
});

module.exports = JobDetailsView;
