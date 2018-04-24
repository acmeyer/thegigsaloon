//@flow
'use strict';

import React, {Component} from 'React';
import {
  Linking,
  View,
  StyleSheet,
  RefreshControl,
  Text,
  Platform,
} from 'react-native';
import AppColors from '../../common/AppColors';
import AppHeader from '../../common/AppHeader';
import PureListView from '../../common/PureListView';
import EmptyList from '../../common/EmptyList';
import ArticleCell from '../jobs/ArticleCell';
import { Crashlytics } from 'react-native-fabric';
import Mixpanel from 'react-native-mixpanel';
var Mailer = require('NativeModules').RNMail;

import { loadArticles } from '../../actions';
import { connect } from 'react-redux';

class NewsView extends Component {

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
    this.submitNewsItem = this.submitNewsItem.bind(this);
    this.refresh = this.refresh.bind(this);
    this.loadNewestArticles = this.loadNewestArticles.bind(this);
    this.onListEndReached = this.onListEndReached.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
  }

  _onRefresh() {
    this.refresh();
  }

  refresh() {
    this.setState({refreshing: true});
    this.props.dispatch(loadArticles()).then(
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

  loadNewestArticles() {
    this.props.dispatch(loadArticles()).then(() => {
      this.setState({resultsPage: 0});
    });
  }

  componentWillMount() {
    this.loadNewestArticles();
  }

  render() {
    const submitItem = {
      icon: require('../../common/img/plus.png'),
      title: 'Add',
      layout: 'icon',
      onPress: this.submitNewsItem,
    };

    return (
      <View style={styles.container}>
        <AppHeader
          title="News"
          rightItem={submitItem}
        />
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
          tabBarSpace={true}
        />
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
      />
    );
  }

  renderEmptyList() {
    return (
      <EmptyList
        title="No News Yet"
        text="All news on the Gig economy will be found here."
      />
    );
  }

  submitNewsItem() {
    Mixpanel.track('Tapped to submit news item');
    Mailer.mail({
      subject: 'Add News Item',
      recipients: ['support@thegigsaloon.com'],
      body: '',
    }, (error, event) => {
        if (error) {
          if (Platform.OS === 'ios') {
            Crashlytics.recordError('Failed to send submit news item email. Error: ' + error.message);
          } else {
            Crashlytics.logException('Failed to send submit news item email. Error: ' + error.message);
          }
          alert('Could not send mail. Please send an email to support@thegigsaloon.com');
        }
    });
  }

  openArticle(article) {
    Mixpanel.trackWithProperties('Tapped to view article', {article_id: article.id});
    if (article.url) {
      Linking.openURL(article.url);
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
    this.props.dispatch(loadArticles(page)).then(
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
  loadingMore: {
    color: AppColors.inactiveText,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
  },
});

function select(store) {
  return {
    articles: store.articles.list.sort((a, b) => b.publishDate - a.publishDate),
    moreNewsToFetch: store.articles.moreResults,
  };
}

module.exports = connect(select)(NewsView);
