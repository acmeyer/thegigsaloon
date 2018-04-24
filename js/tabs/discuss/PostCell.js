//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  TouchableHighlight,
  View,
  Linking,
} from 'react-native';
import AppColors from '../../common/AppColors';
import moment from 'moment';
import ProfilePicture from '../../common/ProfilePicture';
import _ from 'lodash';
import Autolink from 'react-native-autolink';

class PostCell extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageLoading: false
    };

    this.openSourceLink = this.openSourceLink.bind(this);
  }

  render() {
    var likeImage = this.props.postLiked
      ? <Image style={styles.footerIcon} source={require('./img/like_filled.png')} />
      : <Image style={styles.footerIcon} source={require('./img/like.png')} />;

    var title, text;
    if (this.props.post.title) {
      title = (
        <Text style={styles.title}>
          {this.props.post.title}
        </Text>
      );
    }
    if (this.props.post.text) {
      text = (
        <Autolink
          text={_.truncate(this.props.post.text, {'length': 140})}
          style={styles.text}
        />
      );
    }

    var postImage;
    if (this.props.post.photo) {
      postImage = (<Image
        source={{uri: this.props.post.photo}}
        style={[styles.postImage, this.state.imageLoading ? { backgroundColor: AppColors.gray } : {}]}
        onLoadStart={(e) => this.setState({imageLoading: true})}
        onLoad={(e) => this.setState({imageLoading: false})}
      />);
    }

    var author, commentsCount;
    if (this.props.post.author) {
      commentsCount = this.props.post.commentsCount;
      author = (
        <View style={styles.footerAuthor}>
          <Text style={styles.footerText}>
            {moment(this.props.post.createdAt).fromNow()} by
          </Text>
          <View style={styles.commenterImage}>
            <ProfilePicture user={this.props.post.author} size={20} />
          </View>
          <Text style={styles.footerText}>
            {this.props.post.author.name}
          </Text>
        </View>
      );
    } else if (this.props.post.source) {
      commentsCount = this.props.post.sourceCommentCount;
      let sourceIcon;
      switch (this.props.post.source) {
        case 'reddit':
          sourceIcon = <Image source={require('./img/reddit.png')} style={styles.sourceIcon} />;
      }
      author = (
        <View style={styles.footerAuthor}>
          <Text style={styles.footerText}>
            {moment(this.props.post.actualCreatedAt).fromNow()} from
          </Text>
          <View style={styles.commenterImage}>
            {sourceIcon}
          </View>
        </View>
      );
    }

    return (
      <TouchableHighlight onPress={this.props.showPost}>
        <View style={styles.cell}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.postText}>
                {title}
                {text}
              </View>
              {postImage}
            </View>
            <View style={styles.footer}>
              <View style={styles.footerLikes}>
                <TouchableOpacity style={[styles.likes, this.props.postLiked && styles.liked]} onPress={this.props.toggleLike}>
                  {likeImage}
                  <Text style={styles.footerText}>
                    {this.props.post.overallLikes}
                  </Text>
                </TouchableOpacity>
                <View style={styles.replies}>
                  <Image
                    style={styles.footerIcon}
                    source={require('./img/comments.png')} />
                  <Text style={styles.footerText}>
                    {commentsCount}
                  </Text>
                </View>
              </View>
              {author}
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  openSourceLink(link) {
    Linking.openURL(link).catch(err => console.error('An error occurred while trying to open url', err));
  }
}

const styles = StyleSheet.create({
  cell: {
    padding: 15,
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  postImage: {
    width: 75,
    height: 75,
    marginLeft: 15,
    marginBottom: 15,
  },
  postText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
    marginBottom: 10,
  },
  text: {
    fontSize: 15,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commenterImage: {
    paddingHorizontal: 3,
  },
  footerAuthor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: AppColors.inactiveText,
    fontSize: 12,
  },
  footerLink: {
    color: AppColors.actionText,
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
  replies: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
});

module.exports = PostCell;
