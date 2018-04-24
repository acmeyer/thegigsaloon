'use strict';
/* global Parse */

import {fromParseComments} from './fromParseObjects';
const Comment = Parse.Object.extend('Comment');
import {sendNewCommentNotifications, sendCommentLikedNotification} from './notifications';

const PER_PAGE = 50;

Parse.Cloud.define('posts_comments', function(request, response) {
  Parse.Cloud.useMasterKey();

  var page = request.params.page;
  var comments = [];
  var more = false;
  var query = new Parse.Query('Post');
  query.get(request.params.postId)
    .then(
      function(post) {
        new Parse.Query(Comment)
          .equalTo('post', post)
          .include('author')
          .ascending('createdAt')
          .limit((page + 1) * PER_PAGE)
          .skip(page * PER_PAGE)
          .find()
          .then(
            function(value) {
              more = value.length === PER_PAGE ? true : false;
              page = value.length === 0 ? page - 1 : page;
              comments = value.map(fromParseComments);
              response.success({
                comments: comments,
                moreComments: more,
                page: page,
              });
            },
            function(error) { response.error(error); }
          );
      },
      function(error) { response.error(error); }
    );
});

Parse.Cloud.beforeSave('Comment', function(request, response) {
  if (!request.object.get('likeCount')) {
    request.object.set('likeCount', 0);
  }

  response.success();
});

Parse.Cloud.define('liked_comment', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.error('No user!');
  }

  var query = new Parse.Query('Comment');
  query.get(request.params.commentId, {
    success: function(comment) {
      if (user.id !== comment.get('author').id) {
        sendCommentLikedNotification(comment, comment.get('post'));
      }
      response.success();
    },
    error: (error) => response.error(error.message)
  });
});

Parse.Cloud.afterSave('Comment', function(request, response) {
  if (!request.object.existed()) {
    var query = new Parse.Query('Post');
    query.get(request.object.get('post').id, {
      success: function(post) {
        post.increment('commentsCount');
        post.save().then((result) => {
          sendNewCommentNotifications(request.object, result);
        });
      },
      error: function(error) {
        console.error('Got an error ' + error.code + ' : ' + error.message);
      }
    });
  }
});

Parse.Cloud.afterDelete('Comment', function(request, response) {
  var query = new Parse.Query('Post');
  query.get(request.object.get('post').id, {
    success: function(post) {
      post.increment('commentsCount', -1);
      post.save();
    },
    error: function(error) {
      console.error('Got an error ' + error.code + ' : ' + error.message);
    }
  });
});
