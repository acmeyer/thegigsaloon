//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
import AppColors from '../../common/AppColors';
import moment from 'moment';
import ProfilePicture from '../../common/ProfilePicture';

class ReviewCell extends Component {
  render() {
    var likeImage = this.props.reviewLiked
      ? <Image style={styles.footerIcon} source={require('../discuss/img/like_filled.png')} />
      : <Image style={styles.footerIcon} source={require('../discuss/img/like.png')} />;

    const stars = [1, 2, 3, 4, 5].map(
      (value) => (
        <Star
          key={value}
          value={value}
          isFull={this.props.review.rating && value <= this.props.review.rating}
        />
      )
    );
    let wage;
    if (this.props.review.wageRate && this.props.review.wageRate > 0) {
      wage = (
        <View style={styles.wage}>
          <Text style={styles.label}>Average Wage</Text>
          <Text style={styles.text}>${Number(this.props.review.wageRate).toFixed(2)}/hr</Text>
        </View>
      );
    }
    return (
      <View style={styles.cell}>
        <View style={styles.header}>
          <View style={styles.rating}>
            {stars}
          </View>
          <View style={styles.author}>
            <View style={styles.authorImage}>
              <ProfilePicture user={this.props.review.author} size={30} />
            </View>
            <View style={styles.authorView}>
              <Text style={styles.authorName}>
                {this.props.review.author.name}
              </Text>
              <View style={styles.timeago}>
                <Text style={styles.mutedText}>{moment(this.props.review.createdAt).fromNow()}</Text>
              </View>
            </View>
          </View>
        </View>
        {wage}
        <View style={styles.comment}>
          <Text style={styles.label}>Comment</Text>
          <Text style={styles.text}>
            {this.props.review.comment ? this.props.review.comment : 'None'}
          </Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.footerLikes}>
            <TouchableOpacity style={[styles.likes, this.props.reviewLiked && styles.liked]} onPress={this.props.toggleLike}>
              {likeImage}
              <Text style={styles.footerText}>
                {this.props.review.likeCount}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
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
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: AppColors.cellBorder,
  },
  author: {
    flexDirection: 'row',
  },
  authorImage: {
    marginRight: 10,
  },
  authorName: {
    fontWeight: 'bold',
  },
  mutedText: {
    fontSize: 11,
    color: AppColors.inactiveText,
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  wage: {
    paddingVertical: 5,
  },
  comment: {
    paddingVertical: 5,
  },
  star: {
    marginRight: 2,
    width: 20,
    height: 19,
  },
  rating: {
    paddingVertical: 5,
    flexDirection: 'row',
  },
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  footerLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    height: 20,
    width: 20,
    marginRight: 5,
  },
  footerText: {
    color: AppColors.inactiveText,
    fontSize: 12,
  },
});

module.exports = ReviewCell;
