//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import moment from 'moment';
import AppColors from '../../common/AppColors';
import ProfilePicture from '../../common/ProfilePicture';
import Autolink from 'react-native-autolink';

class CommentCell extends Component {
  render() {
    let content;
    if (this.props.showPost) {
      content = (
        <TouchableHighlight onPress={this.props.showPost}>
          {this.renderComment()}
        </TouchableHighlight>
      );
    } else {
      content = this.renderComment();
    }

    return (
      <View>
        {content}
      </View>
    );
  }

  renderComment() {
    let likeIcon = this.props.commentLiked
      ? <Image style={styles.footerIcon} source={require('./img/like_filled.png')} />
      : <Image style={styles.footerIcon} source={require('./img/like.png')} />;

    var author;
    if (this.props.comment.author) {
      author = (
        <View style={styles.author}>
          <ProfilePicture user={this.props.comment.author} size={16} />
          <Text style={[styles.authorName, {paddingLeft: 5}]}>
            {this.props.comment.author.name}
          </Text>
          <Text style={styles.separator}>
            |
          </Text>
          <Text style={styles.footerText}>
            {moment(this.props.comment.createdAt).fromNow()}
          </Text>
        </View>
      );
    } else if (this.props.comment.source) {
      author = (
        <View style={styles.author}>
          <Text style={styles.authorName}>
            {this.props.comment.sourceAuthor}
          </Text>
          <Text style={styles.footerText}>
            {''} from {this.props.comment.source}
          </Text>
          <Text style={styles.separator}>
            |
          </Text>
          <Text style={styles.footerText}>
            {moment.unix(this.props.comment.sourceCreatedAt).fromNow()}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.cell}>
        <View style={styles.content}>
          {author}
          <Autolink text={this.props.comment.text} style={styles.text} />
          <View style={styles.footer}>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={this.props.onToggleLike}
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.footerText}>
                  {this.props.comment.likeCount}
                </Text>
                {likeIcon}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cell: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 15,
    marginBottom: 10,
  },
  author: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorName: {
    fontSize: 12,
    color: AppColors.inactiveText,
  },
  separator: {
    fontSize: 12,
    color: AppColors.inactiveText,
    paddingHorizontal: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: AppColors.inactiveText,
    fontSize: 12,
  },
  footerIcon: {
    height: 20,
    width: 20,
    marginLeft: 5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: AppColors.inactiveText,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

module.exports = CommentCell;
