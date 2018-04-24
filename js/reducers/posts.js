//@flow
'use strict';

import _ from 'lodash';

const {fromParsePosts, fromParseComments} = require('./fromParseObjects');

const initialState = {
  topic: null,
  morePosts: false,
  list: [],
};

function posts(state = initialState, action) {
  switch (action.type) {
    case 'LOADED_POSTS':
      var list;
      if (action.list.length === 0) {
        list = [];
      } else {
        list = action.list.map(fromParsePosts);
        let firstFetch = action.page === 0 ? true : false;
        if (!firstFetch) {
          list = state.list.concat(list);
        }
      }
      return {
        ...state,
        list: list,
        morePosts: action.moreResults,
      };

    case 'POST_ADDED':
      return {...state, list: _.concat(state.list, fromParsePosts(action.post))};

    case 'COMMENT_ADDED':
      let allThePosts = state.list.map((post) => {
        if (post.id === fromParseComments(action.comment).postId) {
          return Object.assign({}, post, {
            commentsCount: post.commentsCount + 1
          });
        }
        return post;
      });
      return {...state, list: allThePosts};

    case 'POST_LIKED':
      let allPosts = state.list.map((post) => {
        if (post.id === action.post.id) {
          return Object.assign({}, post, {
            likeCount: post.likeCount + 1,
            overallLikes: post.overallLikes + 1,
          });
        }
        return post;
      });
      return {...state, list: allPosts};

    case 'POST_UNLIKED':
      let thePosts = state.list.map((post) => {
        if (post.id === action.post.id) {
          return Object.assign({}, post, {
            likeCount: post.likeCount - 1,
            overallLikes: post.overallLikes - 1,
          });
        }
        return post;
      });
      return {...state, list: thePosts};

    default:
      return state;
  }
}

module.exports = posts;
