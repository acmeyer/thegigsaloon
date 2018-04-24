//@flow
'use strict';

import React, {Component} from 'React';
import AppHeader from '../../common/AppHeader';
import AppColors from '../../common/AppColors';
import AppButton from '../../common/AppButton';
import Post from './Post';
import CommentCell from './CommentCell';
import PureListView from '../../common/PureListView';
import EmptyList from '../../common/EmptyList';
import {createStylesheet} from '../../common/AppStyleSheet';
import {
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Keyboard,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Share from 'react-native-share';
import { sharePostUrl } from './sharingLinks';
import { commentsForPost } from './commentsForPost';
import {
  loadPost,
  createComment,
  loadPostsComments,
  likeComment,
  unlikeComment,
  likePost,
  unlikePost,
} from '../../actions';
import {connect} from 'react-redux';
import _ from 'lodash';
const { Crashlytics} = require('react-native-fabric');
const Mixpanel = require('react-native-mixpanel');

var { createSelector } = require('reselect');

const theComments = createSelector(
  (store) => store.comments.list,
  (store) => store.navigation.currentPostId,
  (comments, postId) => commentsForPost(comments, postId),
);

const COMMENT_STARTING_HEIGHT = Platform.OS === 'android' ? 40 : 32;
const COMMENT_MAX_HEIGHT = 140;

class PostDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      commentContent: null,
      commentContentHeight: COMMENT_STARTING_HEIGHT,
      addCommentEnabled: false,
      visibleBottom: 0,
      refreshing: false,
      resultsPage: 0,
      isLoadingAdditional: false,
    };

    this.close = this.close.bind(this);
    this.createComment = this.createComment.bind(this);
    this.keyboardWillShow = this.keyboardWillShow.bind(this);
    this.keyboardWillHide = this.keyboardWillHide.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
    this.sharePost = this.sharePost.bind(this);
    this.toggleCommentLike = this.toggleCommentLike.bind(this);
    this.togglePostLike = this.togglePostLike.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.onListEndReached = this.onListEndReached.bind(this);
    this.renderEmptyList = this.renderEmptyList.bind(this);
    this.openSourceUrl = this.openSourceUrl.bind(this);
  }

  _onRefresh() {
    this.setState({refreshing: true});
    this.loadThePost();
  }

  componentWillMount() {
    this.loadThePost();
  }

  componentDidMount() {
    this.keyboardShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
    this.keyboardHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
  }

  componentWillUnmount() {
    this.keyboardShowListener.remove();
    this.keyboardHideListener.remove();
  }

  loadThePost() {
    this.props.dispatch(loadPost(this.props.postId)).then(
      () => {
        this.props.dispatch(loadPostsComments(this.props.postId, 0)).then(() => {
          this.setState({
            loading: false,
            refreshing: false,
            resultsPage: 0,
          });
        });
      },
      (error) => {
        this.setState({
          loading: false,
          refreshing: false,
        });
        if (Platform.OS === 'ios') {
          Crashlytics.recordError('Failed to load post. Error: ' + error.message);
        } else {
          Crashlytics.logException('Failed to load post. Error: ' + error.message);
        }
        alert('Unable to load post. Please check your connection or contact support.');
        this.close();
      }
    );
  }

  render() {
    let leftItem, rightItem;
    if (this.props.navigator) {
      leftItem = {
        title: 'Back',
        icon: require('../../common/img/back.png'),
        onPress: this.close,
        layout: 'icon'
      };
      rightItem = {
        title: 'Share',
        icon: Platform.OS === 'android' ? require('../../common/img/share.png') : require('../../common/img/share_blue.png'),
        onPress: this.sharePost,
        layout: 'icon'
      };
    }
    var buttonColor = this.state.addCommentEnabled
      ? {color: AppColors.actionText}
      : {color: AppColors.inactiveText};

    // For odd layout issues with text input
    var extraMarginList = Platform.OS === 'android'
      ? {marginBottom: this.state.visibleBottom + this.state.commentContentHeight}
      : {marginBottom: this.state.visibleBottom + this.state.commentContentHeight - COMMENT_STARTING_HEIGHT};

    let content;
    if (this.state.loading) {
      content = (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      if (this.props.post.source) {
        content = (
          <View style={styles.scrollviewContainer}>
            <PureListView
              data={this.props.comments}
              renderHeader={this.renderHeader}
              renderRow={() => null}
              renderEmptyList={this.renderEmptyList}
              style={styles.listView}
              tabBarSpace={false}
            />
          </View>
        );
      } else {
        content = (
          <View style={styles.scrollviewContainer}>
            <PureListView
              refreshControl={
                <RefreshControl
                  style={{ backgroundColor: 'transparent' }}
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh}
                />
              }
              data={this.props.comments}
              renderHeader={this.renderHeader}
              renderRow={this.renderRow}
              style={[styles.listView, extraMarginList]}
              renderFooter={this.renderFooter}
              onEndReached={this.onListEndReached}
              tabBarSpace={true}
            />
            <View style={[styles.commentInput, {bottom: this.state.visibleBottom}]}>
              <TextInput
                placeholder="Add a comment..."
                onChange={(event) => {
                  if (event.nativeEvent.contentSize.height < COMMENT_MAX_HEIGHT) {
                    this.setState({
                      commentContentHeight: event.nativeEvent.contentSize.height,
                    });
                  }
                }}
                style={[styles.input, {height: Math.max(COMMENT_STARTING_HEIGHT, this.state.commentContentHeight)}]}
                onChangeText={(text) => this.updateCommentContent(text)}
                multiline={true}
                value={this.state.commentContent}
                underlineColorAndroid="transparent"
              />
              <TouchableOpacity
                accessibilityTraits="button"
                activeOpacity={this.state.addCommentEnabled ? 0.2 : 1}
                onPress={this.state.addCommentEnabled ? this.createComment : null}
              >
                <Text style={[styles.button, buttonColor]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }
    }

    return (
      <View style={styles.container}>
        <AppHeader
          title=""
          leftItem={leftItem}
          rightItem={rightItem}
        />
        {content}
      </View>
    );
  }

  renderEmptyList() {
    return (
      <View style={{flex: 1}}>
        <EmptyList
          text="This post is from a source outside of The Gig Saloon. To see comments for this post and/or to comment on this post, tap the button below. You will be redirected to the source of this post."
        />
        <View style={styles.listFooter}>
          <AppButton
            caption={'Go to ' + this.props.post.source}
            buttonStyle={styles.continueButton}
            captionStyle={styles.continueButtonText}
            onPress={() => this.openSourceUrl()}
            type="square"
          />
        </View>
      </View>
    );
  }

  openSourceUrl() {
    let link = this.props.post.sourceUrl;
    console.log('clicked link', link);
    Linking.openURL(link).catch(err => console.error('An error occurred while trying to open url', err));
  }

  renderHeader() {
    return (
      <View style={styles.post}>
        <Post
          post={this.props.post}
          navigator={this.props.navigator}
          toggleLike={() => {
            this.togglePostLike(this.props.post);
            this.forceUpdate();
          }}
          postLiked={this.props.user.likedPosts.includes(this.props.postId)}
        />
      </View>
    );
  }

  renderFooter() {
    return this.state.isLoadingAdditional ? <Text style={styles.loadingMore}>Loading...</Text> : null;
  }

  renderRow(comment) {
    return (
      <CommentCell
        comment={comment}
        key={comment.id}
        onToggleLike={() => {
          this.toggleCommentLike(comment);
        }}
        commentLiked={this.props.user.likedComments.includes(comment.id)}
      />
    );
  }

  onListEndReached() {
    if (this.state.isLoadingAdditional) {
      return;
    } else if (!this.props.moreResults) {
      return;
    }

    this.setState({
      isLoadingAdditional: true
    });

    let page = this.state.resultsPage + 1;
    this.props.dispatch(loadPostsComments(this.props.postId, page)).then(
      () => {
        this.setState({
          isLoadingAdditional: false,
          resultsPage: page
        });
      },
      (error) => {
        this.setState({isLoadingAdditional: false});
        if (Platform.OS === 'ios') {
          Crashlytics.recordError('Failed to load comments. Error: ' + error.message);
        } else {
          Crashlytics.logException('Failed to load comments. Error: ' + error.message);
        }
        alert('Unable to load comments. Please check your connection or contact support.');
      }
    );
  }

  keyboardWillShow(e) {
    let keyboardHeight = e.endCoordinates.height;
    this.setState({visibleBottom: keyboardHeight});
  }

  keyboardWillHide(e) {
    this.setState({visibleBottom: 0});
  }

  sharePost() {
    Mixpanel.trackWithProperties('Tapped to share post', {post_id: this.props.postId});
    var postTitle = this.props.post.title;
    var postText = _.truncate(this.props.post.text, {length: 140});
    var message = 'Checkout this post from The Gig Saloon app:\n\n';
    message += (postTitle && postTitle !== '')
      ? postTitle + '\n' + postText
      : postText;

    Share.open({
      message: message,
      url: sharePostUrl(this.props.postId)
    },(e) => {
      if (Platform.OS === 'ios') {
        Crashlytics.recordError('Failed to share post. Error: ' + e.message);
      } else {
        Crashlytics.logException('Failed to share post. Error: ' + e.message);
      }
    });
  }

  togglePostLike(post) {
    if (!this.props.user.isLoggedIn) {
      this.props.navigator.push({
        login: true,
      });
    } else {
      if (this.props.user.likedPosts.includes(post.id)) {
        this.props.dispatch(unlikePost(post.id));
      } else {
        this.props.dispatch(likePost(post.id));
      }
    }
  }

  toggleCommentLike(comment) {
    if (!this.props.user.isLoggedIn) {
      this.props.navigator.push({
        login: true,
      });
    } else {
      if (this.props.user.likedComments.includes(comment.id)) {
        this.props.unlikeComment(comment.id);
      } else {
        this.props.likeComment(comment.id);
      }
    }
  }

  updateCommentContent(text) {
    this.setState({commentContent: text});
    if (text !== null && text !== '') {
      this.setState({addCommentEnabled: true});
    } else {
      this.setState({addCommentEnabled: false});
    }
  }

  createComment() {
    Mixpanel.track('Tapped to create new comment');
    if (!this.props.user.isLoggedIn) {
      this.props.navigator.push({
        login: true,
      });
    } else {
      this.setState({
        commentContent: '',
        commentContentHeight: COMMENT_STARTING_HEIGHT
      });
      this.props.dispatch(createComment(this.props.postId, this.state.commentContent));
    }
  }

  close() {
    const {navigator, onClose} = this.props;
    if (navigator) {
      requestAnimationFrame(() => navigator.pop());
    }
    if (onClose) {
      onClose();
    }
  }
}

var styles = createStylesheet({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: 0,
    backgroundColor: AppColors.tableViewBackground,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollviewContainer: {
    flex: 1,
    backgroundColor: AppColors.tableViewBackground,
  },
  listView: {
    flex: 1,
  },
  loadingMore: {
    color: AppColors.inactiveText,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
  },
  post: {
    borderBottomWidth: 1,
    borderColor: AppColors.cellBorder,
  },
  separator: {
    marginHorizontal: 20,
  },
  button: {
    fontSize: 17,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    fontSize: 16,
    borderColor: AppColors.cellBorder,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    alignItems: 'center',
    android: {
      borderColor: 'transparent',
      paddingVertical: 5,
    },
  },
  commentInput: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: AppColors.cellBorder,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    android: {
      paddingBottom: 5,
    },
    ios: {
      paddingVertical: 5,
    }
  },
  listFooter: {
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
});

function select(store) {
  return {
    post: store.currentPost,
    comments: theComments(store),
    user: store.user,
  };
}

function actions(dispatch) {
  return {
    likeComment: (commentId) => dispatch(likeComment(commentId)),
    unlikeComment: (commentId) => dispatch(unlikeComment(commentId)),
    dispatch,
  };
}

module.exports = connect(select, actions)(PostDetailsScreen);
