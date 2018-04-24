//@flow
'use strict';

const initialState = {
  list: [],
  moreResults: false,
};

function userComments(state = initialState, action) {
  if (action.type === 'LOADED_USER_COMMENTS') {
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
    let theCommentList = state.list.map((comment) => {
      if (comment.id === action.comment.id) {
        return Object.assign({}, comment, {
          likeCount: comment.likeCount + 1
        });
      }
      return comment;
    });
    return {
      ...state,
      list: theCommentList,
    };
  }
  if (action.type === 'COMMENT_UNLIKED') {
    let updatedCommentList = state.list.map((comment) => {
      if (comment.id === action.comment.id) {
        return Object.assign({}, comment, {
          likeCount: comment.likeCount - 1
        });
      }
      return comment;
    });
    return {
      ...state,
      list: updatedCommentList,
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

module.exports = userComments;
