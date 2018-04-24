// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import AppColors from '../../common/AppColors';


class JobRatingView extends Component {
  render() {
    var content = null;
    let avgWage;
    if (this.props.job.wageReviewsCount && this.props.job.wageReviewsCount > 0) {
      avgWage = (
        <View style={styles.wage}>
          <Text style={styles.text}>${this.props.job.avgWageRate.toFixed(2)}/hr</Text>
          <Text style={styles.ratingsCount}>({this.props.job.wageReviewsCount})</Text>
        </View>
      );
    }
    if (this.props.job.ratingsCount && this.props.job.ratingsCount > 0) {
      const stars = [1, 2, 3, 4, 5].map(
        (value) => (
          <Star
            key={value}
            value={value}
            isFull={this.props.job.avgRating && value <= this.props.job.avgRating}
          />
        )
      );
      content = (
        <View style={styles.reviews}>
          <View style={styles.ratings}>
            {stars}
            <Text style={styles.ratingsCount}>({this.props.job.ratingsCount})</Text>
          </View>
          {avgWage}
        </View>
      );
    }
    return content;
  }
}

function Star({isFull, value, onPress}) {
  const source = isFull
    ? require('./img/full-star.png')
    : require('./img/empty-star.png');

  return (
    <Image style={styles.star} source={source} />
  );
}

const styles = StyleSheet.create({
  ratings: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  ratingsCount: {
    paddingLeft: 5,
    fontSize: 12,
    color: AppColors.inactiveText,
  },
  star: {
    marginRight: 1,
    width: 10,
    height: 9,
  },
  wage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    paddingVertical: 5,
    flexDirection: 'row',
  },
});

module.exports = JobRatingView;
