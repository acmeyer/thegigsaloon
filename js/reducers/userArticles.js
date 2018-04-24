//@flow
'use strict';

const initialState = {
  list: [],
  moreResults: false,
};

function userArticles(state = initialState, action) {
  if (action.type === 'LOADED_USER_ARTICLES') {
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
    let theArticleList = state.list.map((article) => {
      if (article.id === action.article.id) {
        return Object.assign({}, article, {
          likeCount: article.likeCount + 1
        });
      }
      return article;
    });
    return {
      ...state,
      list: theArticleList,
    };
  }
  if (action.type === 'ARTICLE_UNLIKED') {
    let updatedArticleList = state.list.map((article) => {
      if (article.id === action.article.id) {
        return Object.assign({}, article, {
          likeCount: article.likeCount - 1
        });
      }
      return article;
    });
    return {
      ...state,
      list: updatedArticleList,
    };
  }
  if (action.type === 'LOGGED_OUT') {
    return {
      list: [],
      moreResults: false,
    };
  }
  return state;
}

module.exports = userArticles;
