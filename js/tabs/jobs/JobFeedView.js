// @flow
'use strict';

import React, {Component} from 'React';
import {
  View,
  StyleSheet,
  RefreshControl,
  Text,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AppColors from '../../common/AppColors';
import PureListView from '../../common/PureListView';
import EmptyList from '../../common/EmptyList';
import PostCell from '../discuss/PostCell';
import { Crashlytics } from 'react-native-fabric';
const Mixpanel = require('react-native-mixpanel');
import { connect } from 'react-redux';
import {
  loadPosts,
  likePost,
  unlikePost,
  showPost,
} from '../../actions';


class JobFeedView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      refreshing: false,
      isLoadingAdditionalPosts: false,
      postsResultsPage: 0,
    };

    this.renderRow = this.renderRow.bind(this);
    this.showPost = this.showPost.bind(this);
    this.toggleLike = this.toggleLike.bind(this);
    this.refresh = this.refresh.bind(this);
    this.loadMorePosts = this.loadMorePosts.bind(this);
    this.onListEndReached = this.onListEndReached.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderEmptyList = this.renderEmptyList.bind(this);
    this.composePost = this.composePost.bind(this);
    this.loadThePosts = this.loadThePosts.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.posts !== nextProps.posts) {
      this.setState({loading: false});
    }
  }

  _onRefresh() {
    this.refresh();
  }

  refresh() {
    this.setState({refreshing: true});
    this.loadThePosts();
  }

  loadThePosts() {
    this.props.dispatch(loadPosts(this.props.job.companyName.toLowerCase(), 0)).then(
      () => {
        this.setState({
          loading: false,
          refreshing: false,
          postsResultsPage: 0,
        });
      },
      (error) => {
        this.setState({
          refreshing: false,
          loading: false,
        });
        if (Platform.OS === 'ios') {
          Crashlytics.recordError('Failed to load posts. Error: ' + error.message);
        } else {
          Crashlytics.logException('Failed to load posts. Error: ' + error.message);
        }
        alert('Unable to load posts. Please check your connection or contact support.');
      }
    );
  }

  render() {
    let content;
    if (this.props.isLoading) {
      content = (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
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
                onRefresh={this._onRefresh.bind(this)}
              />
            }
            data={this.props.posts}
            renderEmptyList={this.renderEmptyList}
            renderRow={this.renderRow}
            onEndReached={this.onListEndReached}
            renderFooter={this.renderFooter}
            style={styles.listView}
            tabBarSpace={false}
          />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  }

  renderEmptyList() {
    return (
      <View style={{flex: 1}}>
        <EmptyList
          title="Nothing Found"
          text="There are no posts for this gig yet."
        />
      </View>
    );
  }

  renderRow(post) {
    return (
      <PostCell
        key={post.id}
        post={post}
        showPost={() => this.showPost(post)}
        toggleLike={() => this.toggleLike(post)}
        postLiked={this.props.user.likedPosts.includes(post.id)}
      />
    );
  }

  renderFooter() {
    let footer = this.state.isLoadingAdditionalPosts ? <Text style={styles.loadingMore}>Loading...</Text> : null;
    return footer;
  }

  showPost(post) {
    if (post.id) {
      this.props.dispatch(showPost(post.id));
      this.props.navigator.push({ postDetails: true, postId: post.id });
    }
  }

  toggleLike(post) {
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

  onListEndReached() {
    this.loadMorePosts();
  }

  loadMorePosts() {
    if (this.state.isLoadingAdditionalPosts) {
      return;
    } else if (!this.props.morePostsToFetch) {
      return;
    }
    this.setState({
      isLoadingAdditionalPosts: true
    });
    let page = this.state.postsResultsPage + 1;
    this.props.dispatch(loadPosts(this.props.job.companyName.toLowerCase(), page, this.state.location)).then(
      () => {
        this.setState({
          isLoadingAdditionalPosts: false,
          postsResultsPage: page
        });
      },
      (error) => {
        this.setState({isLoadingAdditionalPosts: false});
        if (Platform.OS === 'ios') {
          Crashlytics.recordError('Failed to load newest posts. Error: ' + error.message);
        } else {
          Crashlytics.logException('Failed to load newest posts. Error: ' + error.message);
        }
        alert('Unable to load posts. Please check your connection or contact support.');
      }
    );
  }

  composePost() {
    Mixpanel.trackWithProperties('Tapped to create post', {jobId: this.props.job.id});
    if (!this.props.user.isLoggedIn) {
      this.props.navigator.push({
        login: true,
      });
    } else {
      this.props.navigator.push({composePost: true, topic: this.props.job.companyName.toLowerCase()});
    }
  }
}

const styles = StyleSheet.create({
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
});

function select(store) {
  return {
    user: store.user,
    posts: store.posts.list.sort((a, b) => b.actualCreatedAt - a.actualCreatedAt),
    morePostsToFetch: store.posts.morePosts,
  };
}

module.exports = connect(select)(JobFeedView);
