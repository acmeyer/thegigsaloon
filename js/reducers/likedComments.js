//@flow
'use strict';

import _ from 'lodash';
import {fromParseComments} from './fromParseObjects';

const initialState = {
  list: [],
  moreResults: false,
};

function likedComments(state = initialState, action) {
  if (action.type === 'LOADED_USER_COMMENT_LIKES') {
    let {comments, moreComments, page} = action.data;
    let commentList = comments;
    let initialFetch = page === 0 ? true : false;
    if (!initialFetch) {
      commentList = state.list.concat(commentList);
    }
    return {
      moreResults: moreComments,
      list: commentList,
    };
  }
  if (action.type === 'COMMENT_LIKED') {
    return {
      ...state,
      list: _.concat(state.list, fromParseComments(action.comment)),
    };
  }
  if (action.type === 'COMMENT_UNLIKED') {
    let allComments = state.list.filter((comment) => {
      return comment.id !== action.comment.id;
    });
    return {
      ...state,
      list: allComments,
    };
  }
  if (action.type === 'LOGGED_OUT') {
    return initialState;
  }
  return state;
}

module.exports = likedComments;
