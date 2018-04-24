// @flow
'use strict';

import {fromParseArticles} from './fromParseObjects';

const initialState = {
  list: [],
  moreResults: false,
};

function articles(state = initialState, action) {
  if (action.type === 'LOADED_ARTICLES') {
    let articleList = action.list.map(fromParseArticles);
    let initialFetch = action.page === 0 ? true : false;
    // If it's not the initial fetch then add them
    if (!initialFetch) {
      articleList = state.list.concat(articleList);
    }
    return {
      moreResults: action.moreResults,
      list: articleList,
    };
  }
  if (action.type === 'ARTICLE_LIKED') {
    let articlesList = state.list.map((article) => {
      if (article.id === action.article.id) {
        var count = article.likeCount ? article.likeCount : 0;
        return Object.assign({}, article, {
          likeCount: count + 1,
        });
      }
      return article;
    });
    return {...state, list: articlesList};
  }

  if (action.type === 'ARTICLE_UNLIKED') {
    let articlesList = state.list.map((article) => {
      if (article.id === action.article.id) {
        return Object.assign({}, article, {
          likeCount: article.likeCount - 1,
        });
      }
      return article;
    });
    return {...state, list: articlesList};
  }

  return state;
}

module.exports = articles;
