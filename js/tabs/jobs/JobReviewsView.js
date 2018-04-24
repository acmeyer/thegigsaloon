// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AppColors from '../../common/AppColors';
import PureListView from '../../common/PureListView';
import EmptyList from '../../common/EmptyList';
import ReviewCell from './ReviewCell';
import { Crashlytics } from 'react-native-fabric';

import {
  loadReviews,
  likeReview,
  unlikeReview,
 } from '../../actions';
import { connect } from 'react-redux';


class JobReviewsView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
      resultsPage: 0,
      isLoadingAdditional: false,
    };

    this.renderRow = this.renderRow.bind(this);
    this.renderEmptyList = this.renderEmptyList.bind(this);
    this.refresh = this.refresh.bind(this);
    this.onListEndReached = this.onListEndReached.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
  }

  _onRefresh() {
    this.refresh();
  }

  refresh() {
    this.setState({refreshing: true});
    this.props.dispatch(loadReviews(this.props.job.id, 0)).then(
      () => {
        this.setState({
          refreshing: false,
          resultsPage: 0
        });
      },
      (error) => {
        this.setState({refreshing: false});
        if (Platform.OS === 'ios') {
          Crashlytics.recordError('Failed to load reviews. Error: ' + error.message);
        } else {
          Crashlytics.logException('Failed to load reviews. Error: ' + error.message);
        }
        alert('Unable to load reviews. Please check your connection or contact support.');
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
        <PureListView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh.bind(this)}
            />
          }
          data={this.props.reviews}
          renderEmptyList={this.renderEmptyList}
          renderRow={this.renderRow}
          style={styles.listView}
          onEndReached={this.onListEndReached}
          renderFooter={this.renderFooter}
          tabBarSpace={false}
        />
      );
    }
    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  }

  renderFooter() {
    return this.state.isLoadingAdditional ? <Text style={styles.loadingMore}>Loading...</Text> : null;
  }

  renderRow(review) {
    return (
      <ReviewCell
        key={review.id}
        review={review}
        toggleLike={() => this.toggleLike(review)}
        reviewLiked={this.props.user.likedReviews.includes(review.id)}
      />
    );
  }

  renderEmptyList() {
    return (
      <EmptyList
        title="No Reviews"
        text="There aren't any reviews for this gig yet."
      />
    );
  }

  toggleLike(review) {
    if (!this.props.user.isLoggedIn) {
      this.props.navigator.push({
        login: true,
      });
    } else {
      if (this.props.user.likedReviews.includes(review.id)) {
        this.props.dispatch(unlikeReview(review.id));
      } else {
        this.props.dispatch(likeReview(review.id));
      }
    }
  }

  onListEndReached() {
    if (this.state.isLoadingAdditional) {
      return;
    } else if (!this.props.moreReviewsToFetch) {
      return;
    }

    this.setState({
      isLoadingAdditional: true
    });

    let page = this.state.resultsPage + 1;
    this.props.dispatch(loadReviews(this.props.job.id, page)).then(
      () => {
        this.setState({
          isLoadingAdditional: false,
          resultsPage: page
        });
      },
      (error) => {
        this.setState({isLoadingAdditional: false});
        if (Platform.OS === 'ios') {
          Crashlytics.recordError('Failed to load reviews. Error: ' + error.message);
        } else {
          Crashlytics.logException('Failed to load reviews. Error: ' + error.message);
        }
        alert('Unable to load reviews. Please check your connection or contact support.');
      }
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listView: {
    backgroundColor: AppColors.tableViewBackground,
  },
  loadingContainer: {
    flex: 1,
    padding: 0,
    backgroundColor: AppColors.tableViewBackground,
    alignItems: 'center',
    justifyContent: 'center'
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
    reviews: store.reviews.list,
    moreReviewsToFetch: store.reviews.moreResults,
  };
}

module.exports = connect(select)(JobReviewsView);
