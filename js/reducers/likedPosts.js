//@flow
'use strict';

import _ from 'lodash';
import {fromParsePosts} from './fromParseObjects';

const initialState = {
  list: [],
  moreResults: false,
};

function likedPosts(state = initialState, action) {
  if (action.type === 'LOADED_USER_POST_LIKES') {
    let {posts, morePosts, page} = action.data;
    let postList = posts;
    let initialFetch = page === 0 ? true : false;
    if (!initialFetch) {
      postList = state.list.concat(postList);
    }
    return {
      moreResults: morePosts,
      list: postList,
    };
  }
  if (action.type === 'POST_LIKED') {
    return {
      ...state,
      list: _.concat(state.list, fromParsePosts(action.post)),
    };
  }
  if (action.type === 'POST_UNLIKED') {
    let allPosts = state.list.filter((post) => {
      return post.id !== action.post.id;
    });
    return {
      ...state,
      list: allPosts,
    };
  }
  if (action.type === 'LOGGED_OUT') {
    return initialState;
  }
  return state;
}

module.exports = likedPosts;
