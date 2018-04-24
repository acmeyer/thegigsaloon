// @flow
'use strict';

import React, {Component} from 'React';
import {
  Linking,
  View,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AppColors from '../../common/AppColors';
import PureListView from '../../common/PureListView';
import EmptyList from '../../common/EmptyList';
import ArticleCell from './ArticleCell';
import { Crashlytics } from 'react-native-fabric';
const Mixpanel = require('react-native-mixpanel');

import {
  loadArticles,
  likeArticle,
  unlikeArticle,
} from '../../actions';
import { connect } from 'react-redux';

class JobNewsView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
      resultsPage: 0,
      isLoadingAdditional: false,
    };

    this.renderRow = this.renderRow.bind(this);
    this.renderEmptyList = this.renderEmptyList.bind(this);
    this.openArticle = this.openArticle.bind(this);
    this.refresh = this.refresh.bind(this);
    this.onListEndReached = this.onListEndReached.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
  }

  _onRefresh() {
    this.refresh();
  }

  refresh() {
    this.setState({refreshing: true});
    this.props.dispatch(loadArticles(this.props.job.companyName.toLowerCase(), 0)).then(
      () => {
        this.setState({
          refreshing: false,
          resultsPage: 0
        });
      },
      (error) => {
        this.setState({refreshing: false});
        if (Platform.OS === 'ios') {
          Crashlytics.recordError('Failed to load articles. Error: ' + error.message);
        } else {
          Crashlytics.logException('Failed to load articles. Error: ' + error.message);
        }
        alert('Unable to load news. Please check your connection or contact support.');
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
          data={this.props.articles}
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

  renderRow(article) {
    return (
      <ArticleCell
        key={article.id}
        article={article}
        onPress={() => this.openArticle(article)}
        toggleLike={() => this.toggleLike(article)}
        articleLiked={this.props.user.likedArticles.includes(article.id)}
      />
    );
  }

  renderEmptyList() {
    return (
      <EmptyList
        title="Nothing Found"
        text="There is no news for this gig yet."
      />
    );
  }

  openArticle(article) {
    Mixpanel.trackWithProperties('Tapped to view article', {article_id: article.id});
    if (article.url) {
      Linking.openURL(article.url);
    }
  }

  toggleLike(article) {
    if (!this.props.user.isLoggedIn) {
      this.props.navigator.push({
        login: true,
      });
    } else {
      if (this.props.user.likedArticles.includes(article.id)) {
        this.props.dispatch(unlikeArticle(article.id));
      } else {
        this.props.dispatch(likeArticle(article.id));
      }
    }
  }

  onListEndReached() {
    if (this.state.isLoadingAdditional) {
      return;
    } else if (!this.props.moreNewsToFetch) {
      return;
    }

    this.setState({
      isLoadingAdditional: true
    });

    let page = this.state.resultsPage + 1;
    this.props.dispatch(loadArticles(this.props.job.companyName.toLowerCase(), page)).then(
      () => {
        this.setState({
          isLoadingAdditional: false,
          resultsPage: page
        });
      },
      (error) => {
        this.setState({isLoadingAdditional: false});
        if (Platform.OS === 'ios') {
          Crashlytics.recordError('Failed to load articles. Error: ' + error.message);
        } else {
          Crashlytics.logException('Failed to load articles. Error: ' + error.message);
        }
        alert('Unable to load news. Please check your connection or contact support.');
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
    articles: store.articles.list.sort((a, b) => b.publishDate - a.publishDate),
    moreNewsToFetch: store.articles.moreResults,
  };
}

module.exports = connect(select)(JobNewsView);
