//@flow
'use strict';

const {fromParseComments} = require('./fromParseObjects');

function currentPost(state = {}, action) {
  switch (action.type) {
    case 'LOADED_POST':
      return action.post;
    case 'COMMENT_ADDED':
      var post = state;
      if (post.id === fromParseComments(action.comment).postId) {
        return Object.assign({}, post, {
          commentsCount: post.commentsCount + 1
        });
      }
      return post;
    case 'POST_LIKED':
      var thePost = state;
      if (thePost.id === action.post.id) {
        return Object.assign({}, thePost, {
          likeCount: thePost.likeCount + 1,
          overallLikes: thePost.overallLikes + 1,
        });
      }
      return thePost;
    case 'POST_UNLIKED':
      var p = state;
      if (p.id === action.post.id) {
        return Object.assign({}, p, {
          likeCount: p.likeCount - 1,
          overallLikes: p.overallLikes - 1,
        });
      }
      return p;
    default:
      return state;
  }
}

module.exports = currentPost;
