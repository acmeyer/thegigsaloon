//@flow
'use strict';

const Parse = require('parse/react-native');
const Post = Parse.Object.extend('Post');
const logError = require('logError');

import type { ThunkAction, Dispatch } from './types';

const PER_PAGE = 50;

function loadPosts(topic, page = 0, location = ''): ThunkAction {
  return (dispatch) => {
    var query = new Parse.Query('Post')
      .include('author')
      .notEqualTo('hide', true)
      .containedIn('tags', [topic])
      .descending('actualCreatedAt,createdAt')
      .limit((page + 1) * PER_PAGE)
      .skip(page * PER_PAGE);
    return query.find({
      success: (list) => {
        var more = list.length === PER_PAGE ? true : false;
        page = list.length === 0 ? page - 1 : page;
        dispatch({
          type: 'LOADED_POSTS',
          list: list,
          moreResults: more,
          page: page,
        });
      },
      error: logError,
    });
  };
}

async function loadPost(postId) {
  const post = await Parse.Cloud.run('load_post', {postId: postId});
  return {
    type: 'LOADED_POST',
    post,
  };
}

function likePost(postId) {
  return (dispatch: Dispatch) => {
    if (Parse.User.current()) {
      Parse.Cloud.run('liked_post', {postId: postId});
      var query = new Parse.Query('Post');
      query.get(postId, {
        success: function(post) {
          post.increment('likeCount');
          post.save();
          Parse.User.current().relation('postsLiked').add(post);
          Parse.User.current().addUnique('notificationChannels', `post_${post.id}`);
          Parse.User.current().save();
          dispatch({
            type: 'POST_LIKED',
            post: post,
          });
        },
        error: logError
      });
    }
  };
}

function unlikePost(postId: string): ThunkAction {
  return (dispatch: Dispatch) => {
    if (Parse.User.current()) {
      var query = new Parse.Query('Post');
      query.get(postId, {
        success: function(post) {
          post.increment('likeCount', -1);
          post.save();
          Parse.User.current().relation('postsLiked').remove(post);
          Parse.User.current().remove('notificationChannels', `post_${post.id}`);
          Parse.User.current().save();
          dispatch({
            type: 'POST_UNLIKED',
            post: post,
          });
        },
        error: logError
      });
    }
  };
}

function createPost(text: String, title: String, photoData: String, photoName: String, job): ThunkAction {
  return (dispatch: Dispatch) => {
    var newPost = new Post({
      title: title,
      text: text,
      author: Parse.User.current()
    });

    if (job) {
      newPost.addUnique('tags', job.companyName.toLowerCase());
    }

    var waitFor;
    if ((photoData !== null && photoData !== '') && (photoName !== '' && photoName !== null)) {
      var imageFile = new Parse.File(photoName, { base64: photoData});
      waitFor = imageFile.save().then(() => newPost.set('photo', imageFile));
    } else {
      waitFor = Parse.Promise.resolve(undefined);
    }

    waitFor.then(() => {
      newPost.save().then(
        () => {
          Parse.User.current().addUnique('notificationChannels', `post_${newPost.id}`);
          Parse.User.current().save();

          dispatch(loadPosts(job.companyName.toLowerCase(), 0));
        },
        (error) => logError
      );
    });
  };
}

module.exports = { loadPosts, createPost, likePost, unlikePost, loadPost };
