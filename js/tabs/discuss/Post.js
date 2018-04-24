//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import AppColors from '../../common/AppColors';
import ProfilePicture from '../../common/ProfilePicture';
import Autolink from 'react-native-autolink';

class Post extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageLoading: false
    };

    this.showLightbox = this.showLightbox.bind(this);
    this.openSourceLink = this.openSourceLink.bind(this);
  }

  render() {
    var likeImage = this.props.postLiked
      ? <Image style={styles.footerIcon} source={require('./img/like_filled.png')} />
      : <Image style={styles.footerIcon} source={require('./img/like.png')} />;

    var text, title, postImage;
    if (this.props.post.title) {
      title = <Text style={styles.title}>{this.props.post.title}</Text>;
    }
    if (this.props.post.text) {
      text = <Autolink style={styles.text} text={this.props.post.text} />;
    }
    if (this.props.post.photo) {
      let spinner;
      if (this.state.imageLoading) {
        spinner = (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        );
      }
      postImage = (
        <TouchableOpacity style={styles.postImageContainer} onPress={() => this.showLightbox()}>
          <Image
            source={{uri: this.props.post.photo}}
            style={[styles.postImage, this.state.imageLoading ? { backgroundColor: AppColors.gray } : {}]}
            onLoadStart={(e) => this.setState({imageLoading: true})}
            onLoad={(e) => this.setState({imageLoading: false})}
          />
          {spinner}
        </TouchableOpacity>
      );
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
            {moment.unix(this.props.post.sourceCreatedAt).fromNow()} from
          </Text>
          <View style={styles.commenterImage}>
            {sourceIcon}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {postImage}
        <View style={styles.cell}>
          <View style={styles.content}>
            {title}
            {text}
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
      </View>
    );
  }

  openSourceLink(link) {
    Linking.openURL(link).catch(err => console.error('An error occurred while trying to open url', err));
  }

  showLightbox() {
    this.props.navigator.push({
      lightbox: true,
      photoSource: {uri: this.props.post.photo},
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  postImageContainer: {
    flex: 1,
    height: 200,
  },
  postImage: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cell: {
    padding: 15,
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
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

module.exports = Post;
