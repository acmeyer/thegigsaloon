//@flow
'use strict';

import React, {Component} from 'React';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  Linking,
  InteractionManager,
} from 'react-native';
import AppColors from '../../common/AppColors';
import AppHeader from '../../common/AppHeader';
import PureListView from '../../common/PureListView';
import EmptyList from '../../common/EmptyList';
import PostCell from '../discuss/PostCell';
import CommentCell from '../discuss/CommentCell';
import ArticleCell from '../jobs/ArticleCell';
import ReviewCell from '../jobs/ReviewCell';
import { connect } from 'react-redux';
import {
  loadLikedPosts,
  loadLikedComments,
  loadLikedReviews,
  loadLikedArticles,
  loadUserPosts,
  loadUserComments,
  loadUsersReviews,
  loadUserArticles,
  likePost,
  unlikePost,
  likeComment,
  unlikeComment,
  likeReview,
  unlikeReview,
  likeArticle,
  unlikeArticle,
  showPost,
} from '../../actions';
import { Crashlytics } from 'react-native-fabric';
import Mixpanel from 'react-native-mixpanel';

class AccountDetailsView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoadingAdditional: false,
      resultsPage: 0,
    };

    this.close = this.close.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderEmptyList = this.renderEmptyList.bind(this);
    this.showPost = this.showPost.bind(this);
    this.togglePostLike = this.togglePostLike.bind(this);
    this.toggleCommentLike = this.toggleCommentLike.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.onListEndReached = this.onListEndReached.bind(this);
  }

  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      if (this.props.type === 'likedPosts') {
        this.props.dispatch(loadLikedPosts());
      } else if (this.props.type === 'likedComments') {
        this.props.dispatch(loadLikedComments());
      } else if (this.props.type === 'likedReviews') {
        this.props.dispatch(loadLikedReviews());
      } else if (this.props.type === 'likedArticles') {
        this.props.dispatch(loadLikedArticles());
      } else if (this.props.type === 'myPosts') {
        this.props.dispatch(loadUserPosts());
      } else if (this.props.type === 'myComments') {
        this.props.dispatch(loadUserComments());
      } else if (this.props.type === 'myReviews') {
        this.props.dispatch(loadUsersReviews());
      } else if (this.props.type === 'myArticles') {
        this.props.dispatch(loadUserArticles());
      }
    });
  }

  render() {
    let leftItem, title, data;
    if (this.props.navigator) {
      leftItem = {
        title: 'Back',
        icon: require('../../common/img/back.png'),
        onPress: this.close,
        layout: 'icon'
      };
    }
    switch (this.props.type) {
      case 'likedPosts':
        title = 'Liked Posts';
        data = this.props.likedPosts;
        break;
      case 'likedComments':
        title = 'Liked Comments';
        data = this.props.likedComments;
        break;
      case 'myPosts':
        title = 'My Posts';
        data = this.props.userPosts;
        break;
      case 'myComments':
        title = 'My Comments';
        data = this.props.userComments;
        break;
      case 'myReviews':
        title = 'My Reviews';
        data = this.props.userReviews;
        break;
      case 'likedReviews':
        title = 'Liked Reviews';
        data = this.props.likedReviews;
        break;
      case 'myArticles':
        title = 'My News Items';
        data = this.props.userArticles;
        break;
      case 'likedArticles':
        title = 'Liked News Items';
        data = this.props.likedArticles;
        break;
    }
    return (
      <View style={styles.container}>
        <AppHeader
          title={title}
          leftItem={leftItem}
        />
        <PureListView
          data={data}
          renderEmptyList={this.renderEmptyList}
          renderRow={this.renderRow}
          style={styles.listView}
          renderFooter={this.renderFooter}
          onEndReached={this.onListEndReached}
          tabBarSpace={false}
        />
      </View>
    );
  }

  renderRow(object) {
    var row;
    if (this.props.type === 'likedPosts' || this.props.type === 'myPosts') {
      row = (
        <PostCell
          key={object.id}
          post={object}
          showPost={() => this.showPost(object.id)}
          toggleLike={() => this.togglePostLike(object)}
          postLiked={this.props.user.likedPosts.includes(object.id)}
        />
      );
    } else if (this.props.type === 'likedReviews' || this.props.type === 'myReviews') {
        row = (
          <View>
            <Text style={styles.reviewTitle}>Review for {object.gigName}</Text>
            <ReviewCell
              key={object.id}
              review={object}
              toggleLike={() => this.toggleReviewLiked(object)}
              reviewLiked={this.props.user.likedReviews.includes(object.id)}
            />
          </View>
        );
    } else if (this.props.type === 'likedArticles' || this.props.type === 'myArticles') {
      row = (
        <ArticleCell
          key={object.id}
          article={object}
          onPress={() => this.openArticle(object)}
          toggleLike={() => this.toggleArticleLike(object)}
          articleLiked={this.props.user.likedArticles.includes(object.id)}
        />
      );
    } else {
      row = (
        <CommentCell
          key={object.id}
          comment={object}
          showPost={() => this.showPost(object.postId)}
          onToggleLike={() => this.toggleCommentLike(object)}
          commentLiked={this.props.user.likedComments.includes(object.id)}
        />
      );
    }
    return row;
  }

  renderFooter() {
    return this.state.isLoadingAdditional ? <Text style={styles.loadingMore}>Loading...</Text> : null;
  }

  onListEndReached() {
    if (this.state.isLoadingAdditional) {
      return;
    }

    let page = this.state.resultsPage + 1;
    var loadFunction;
    if (this.props.type === 'likedPosts') {
      if (!this.props.likedPosts.moreResults) {
        return;
      }
      loadFunction = loadLikedPosts(page);
    } else if (this.props.type === 'likedComments') {
      if (!this.props.likedComments.moreResults) {
        return;
      }
      loadFunction = loadLikedComments(page);
    } else if (this.props.type === 'myPosts') {
      if (!this.props.userPosts.moreResults) {
        return;
      }
      loadFunction = loadUserPosts(page);
    } else if (this.props.type === 'myComments') {
      if (!this.props.userComments.moreResults) {
        return;
      }
      loadFunction = loadUserComments(page);
    } else if (this.props.type === 'likedReviews') {
      if (!this.props.likedReviews.moreResults) {
        return;
      }
      loadFunction = loadLikedReviews(page);
    } else if (this.props.type === 'likedArticles') {
      if (!this.props.likedArticles.moreResults) {
        return;
      }
      loadFunction = loadLikedArticles(page);
    } else if (this.props.type === 'myReviews') {
      if (!this.props.userReviews.moreResults) {
        return;
      }
      loadFunction = loadUsersReviews(page);
    } else if (this.props.type === 'myArticles') {
      if (!this.props.userArticles.moreResults) {
        return;
      }
      loadFunction = loadUserArticles(page);
    }

    this.setState({
      isLoadingAdditional: true
    });

    this.props.dispatch(loadFunction).then(
      () => {
        this.setState({
          isLoadingAdditional: false,
          resultsPage: page
        });
      },
      (error) => {
        this.setState({isLoadingAdditional: false});
        if (Platform.OS === 'ios') {
          Crashlytics.recordError('Failed to load account details. Error: ' + error.message);
        } else {
          Crashlytics.logException('Failed to load account details. Error: ' + error.message);
        }
        alert('Unable to load. Please check your connection or contact support.');
      }
    );
  }

  openArticle(article) {
    Mixpanel.trackWithProperties('Tapped to open article', {article_id: article.id, view: 'account details'});
    if (article.url) {
      Linking.openURL(article.url);
    }
  }

  toggleArticleLike(article) {
    if (this.props.user.likedArticles.includes(article.id)) {
      this.props.dispatch(unlikeArticle(article.id));
    } else {
      this.props.dispatch(likeArticle(article.id));
    }
  }

  toggleReviewLiked(review) {
    if (this.props.user.likedReviews.includes(review.id)) {
      this.props.dispatch(unlikeReview(review.id));
    } else {
      this.props.dispatch(likeReview(review.id));
    }
  }

  showPost(postId) {
    if (postId) {
      this.props.dispatch(showPost(postId));
      this.props.navigator.push({ postDetails: true, postId: postId });
    }
  }

  togglePostLike(post) {
    if (this.props.user.likedPosts.includes(post.id)) {
      this.props.dispatch(unlikePost(post.id));
    } else {
      this.props.dispatch(likePost(post.id));
    }
  }

  toggleCommentLike(comment) {
    if (this.props.user.likedComments.includes(comment.id)) {
      this.props.dispatch(unlikeComment(comment.id));
    } else {
      this.props.dispatch(likeComment(comment.id));
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

  renderEmptyList() {
    var title, message;
    switch (this.props.type) {
      case 'likedPosts':
        title = 'No Posts Liked';
        message = 'All the posts you like will show up here.';
        break;
      case 'likedComments':
        title = 'No Comments Liked';
        message = 'All the comments you like will show up here.';
        break;
      case 'likedReviews':
        title = 'No Reviews Liked';
        message = 'All the reviews you like will show up here.';
        break;
      case 'likedArticles':
        title = 'No News Items Liked';
        message = 'All the news items you like will show up here.';
        break;
      case 'myPosts':
        title = 'No Posts';
        message = 'All of your posts will show up here.';
        break;
      case 'myComments':
        title = 'No Comments';
        message = 'All of your comments will show up here';
        break;
      case 'myReviews':
        title = 'No Reviews';
        message = 'All of your reviews will show up here';
        break;
      case 'myArticles':
        title = 'No News Items';
        message = 'All of your news items will show up here';
        break;
    }
    return (
      <EmptyList
        title={title}
        text={message}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listView: {
    backgroundColor: AppColors.tableViewBackground,
    marginBottom: 0,
  },
  loadingMore: {
    color: AppColors.inactiveText,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
  },
  reviewTitle: {
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
});

function select(store) {
  return {
    user: store.user,
    likedPosts: store.likedPosts.list,
    likedComments: store.likedComments.list,
    likedReviews: store.likedReviews.list,
    likedArticles: store.likedArticles.list,
    userPosts: store.userPosts.list,
    userComments: store.userComments.list,
    userReviews: store.userReviews.list,
    userArticles: store.userArticles.list,
  };
}

module.exports = connect(select)(AccountDetailsView);
