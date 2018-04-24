//@flow
'use strict';

const Parse = require('parse/react-native');
const Comment = Parse.Object.extend('Comment');
const logError = require('logError');
const InteractionManager = require('InteractionManager');

import type { ThunkAction, Dispatch, PromiseAction } from './types';

async function loadPostsComments(postId: string, page: string): PromiseAction {
  const data = await Parse.Cloud.run('posts_comments', {postId, page});
  return {
    type: 'LOADED_POSTS_COMMENTS',
    data,
  };
}

function likeComment(commentId) {
  return (dispatch: Dispatch) => {
    if (Parse.User.current()) {
      Parse.Cloud.run('liked_comment', {commentId: commentId});
      var query = new Parse.Query('Comment');
      query.get(commentId, {
        success: function(comment) {
          comment.increment('likeCount');
          comment.save();
          Parse.User.current().relation('commentsLiked').add(comment);
          Parse.User.current().save();
          dispatch({
            type: 'COMMENT_LIKED',
            comment: comment,
          });
        },
        error: logError
      });
    }
  };
}

function unlikeComment(commentId: string): ThunkAction {
  return (dispatch: Dispatch) => {
    if (Parse.User.current()) {
      var query = new Parse.Query('Comment');
      query.get(commentId, {
        success: function(comment) {
          comment.increment('likeCount', -1);
          comment.save();
          Parse.User.current().relation('commentsLiked').remove(comment);
          Parse.User.current().save();
          dispatch({
            type: 'COMMENT_UNLIKED',
            comment: comment,
          });
        },
        error: logError
      });
    }
  };
}

function createComment(id: string, text: String): ThunkAction {
  return (dispatch: Dispatch) => {
    var query = new Parse.Query('Post');
    query.get(id, {
      success: function(post) {
        var newComment = new Comment({
          text: text,
          author: Parse.User.current(),
          post: post,
        });
        newComment.save().then(() => {

          Parse.User.current().addUnique('notificationChannels', `post_${post.id}`);
          Parse.User.current().save();

          dispatch({
            type: 'COMMENT_ADDED',
            comment: newComment,
          });
          InteractionManager.runAfterInteractions(() => {
            dispatch(loadPostsComments(post.id, 0));
          });
        });
      },
      error: logError
    });
  };
}

module.exports = { createComment, loadPostsComments, likeComment, unlikeComment };
