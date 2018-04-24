//@flow
'use strict';

const {fromParseComments} = require('./fromParseObjects');

const initialState = {
  list: [],
  moreResults: false,
};

function comments(state = initialState, action) {
  switch (action.type) {
    case 'LOADED_POSTS_COMMENTS':
      let {moreComments, page} = action.data;
      let commentList = action.data.comments;
      let initialFetch = page === 0 ? true : false;
      if (!initialFetch) {
        commentList = state.list.concat(commentList);
      }
      return {
        moreResults: moreComments,
        list: commentList,
      };

    case 'COMMENT_ADDED':
      return {
        ...state,
        list: state.list.concat(fromParseComments(action.comment))
      };

    case 'COMMENT_LIKED':
      let allComments = state.list.map((comment) => {
        if (comment.id === action.comment.id) {
          return Object.assign({}, comment, {
            likeCount: comment.likeCount + 1
          });
        }
        return comment;
      });
      return {
        ...state,
        list: allComments,
      };

    case 'COMMENT_UNLIKED':
      let theComments = state.list.map((comment) => {
        if (comment.id === action.comment.id) {
          return Object.assign({}, comment, {
            likeCount: comment.likeCount - 1
          });
        }
        return comment;
      });
      return {
        ...state,
        list: theComments,
      };

    default:
      return state;
  }
}

module.exports = comments;
