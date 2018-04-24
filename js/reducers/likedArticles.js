//@flow
'use strict';

import _ from 'lodash';
import {fromParseArticles} from './fromParseObjects';

const initialState = {
  list: [],
  moreResults: false,
};

function likedArticles(state = initialState, action) {
  if (action.type === 'LOADED_USER_ARTICLES_LIKES') {
    let {articles, moreArticles, page} = action.data;
    let articleList = articles;
    let initialFetch = page === 0 ? true : false;
    if (!initialFetch) {
      articleList = state.list.concat(articleList);
    }
    return {
      moreResults: moreArticles,
      list: articleList,
    };
  }
  if (action.type === 'ARTICLE_LIKED') {
    return {
      ...state,
      list: _.concat(state.list, fromParseArticles(action.article)),
    };
  }
  if (action.type === 'ARTICLE_UNLIKED') {
    let allArticles = state.list.filter((article) => {
      return article.id !== action.article.id;
    });
    return {
      ...state,
      list: allArticles,
    };
  }
  if (action.type === 'LOGGED_OUT') {
    return initialState;
  }
  return state;
}

module.exports = likedArticles;
