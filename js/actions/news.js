//@flow
'use strict';

const Parse = require('parse/react-native');
const Article = Parse.Object.extend('Article');
const logError = require('logError');
const InteractionManager = require('InteractionManager');

import type { ThunkAction } from './types';

const PER_PAGE = 50;

function loadArticles(topic, page = 0): ThunkAction {
  return (dispatch) => {
    var query = new Parse.Query('Article')
      .notEqualTo('hide', true)
      .containedIn('tags', [topic])
      .descending('publishDate')
      .limit((page + 1) * PER_PAGE)
      .skip(page * PER_PAGE);
    return query.find({
      success: (list) => {
        var more = list.length === PER_PAGE ? true : false;
        InteractionManager.runAfterInteractions(() => {
          dispatch({
            type: 'LOADED_ARTICLES',
            list: list,
            moreResults: more,
            page: page,
          });
        });
      },
      error: logError,
    });
  };
}

function likeArticle(articleId) {
  return (dispatch) => {
    if (Parse.User.current()) {
      Parse.Cloud.run('liked_article', {articleId: articleId});
      var query = new Parse.Query('Article');
      query.get(articleId, {
        success: function(article) {
          article.increment('likeCount');
          article.save();
          Parse.User.current().relation('articlesLiked').add(article);
          Parse.User.current().save();
          dispatch({
            type: 'ARTICLE_LIKED',
            article: article,
          });
        },
        error: logError
      });
    }
  };
}

function unlikeArticle(articleId) {
  return (dispatch) => {
    if (Parse.User.current()) {
      var query = new Parse.Query('Article');
      query.get(articleId, {
        success: function(article) {
          article.increment('likeCount', -1);
          article.save();
          Parse.User.current().relation('articlesLiked').remove(article);
          Parse.User.current().save();
          dispatch({
            type: 'ARTICLE_UNLIKED',
            article: article,
          });
        },
        error: logError
      });
    }
  };
}

function createArticle(url, job) {
  return (dispatch) => {
    var newArticle = new Article({
      url: url,
      submittedBy: Parse.User.current(),
    });

    if (job) {
      newArticle.addUnique('tags', job.companyName.toLowerCase());
    }

    newArticle.save()
    .then(() => {
      setTimeout(() => {
        dispatch(loadArticles(job.companyName.toLowerCase(), 0));
      }, 2000);
    })
    .catch((error) => logError);
  };
}

module.exports = { loadArticles, createArticle, likeArticle, unlikeArticle };
