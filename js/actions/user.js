//@flow
'use strict';

const Parse = require('parse/react-native');
import {
  InteractionManager,
} from 'react-native';
import { loadUserReviews } from './reviews';
import type { PromiseAction, ThunkAction, Dispatch } from './types';
const logError = require('logError');

function syncUser(): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(loadUserProfile());
    dispatch(loadUserGigs());
    dispatch(loadUserGigsFollowing());
    dispatch(loadLikedPosts());
    dispatch(loadLikedComments());
    dispatch(loadLikedReviews());
    dispatch(loadLikedArticles());
    dispatch(loadUserReviews());
  };
}

function loadUserLikes(): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(loadLikedPosts());
    dispatch(loadLikedComments());
    dispatch(loadLikedReviews());
    dispatch(loadLikedArticles());
  };
}

async function loadUserGigsFollowing(): ThunkAction {
  const data = await Parse.Cloud.run('load_user_gigs_following');
  await InteractionManager.runAfterInteractions();
  return {
    type: 'LOADED_USER_GIGS_FOLLOWING',
    data,
  };
}

function followGig(jobId): ThunkAction {
  return (dispatch: Dispatch) => {
    if (Parse.User.current()) {
      var query = new Parse.Query('Jobs');
      query.get(jobId, {
        success: function(job) {
          Parse.User.current().relation('gigsFollowing').add(job);
          Parse.User.current().save();
          dispatch({
            type: 'FOLLOWED_GIG',
            jobId: jobId,
          });
        },
        error: logError
      });
    }
  };
}

function unfollowGig(jobId): ThunkAction {
  return (dispatch: Dispatch) => {
    if (Parse.User.current()) {
      var query = new Parse.Query('Jobs');
      query.get(jobId, {
        success: function(job) {
          Parse.User.current().relation('gigsFollowing').remove(job);
          Parse.User.current().save();
          dispatch({
            type: 'UNFOLLOWED_GIG',
            jobId: jobId,
          });
        },
        error: logError
      });
    }
  };
}

async function loadUserProfile(): ThunkAction {
  const data = await Parse.Cloud.run('load_user');
  await InteractionManager.runAfterInteractions();
  return {
    type: 'USER_PROFILE_LOADED',
    data,
  };
}

function loadUserGigs() {
  return (dispatch) => {
    var user = Parse.User.current();
    if (user) {
      user.relation('gigs').query()
      .find()
      .then(
        function(gigs) {
          dispatch({
            type: 'LOADED_USER_GIGS',
            gigs,
          });
        },
        function(error) { logError; }
      );
    } else {
      return;
    }
  };
}

async function saveUserProfile(userData): PromiseAction {
  const data = await Parse.Cloud.run('update_user', {userData: userData});
  await InteractionManager.runAfterInteractions();
  return {
    type: 'USER_PROFILE_SAVED',
    data,
  };
}

async function loadLikedPosts(page = 0): PromiseAction {
  const data = await Parse.Cloud.run('sync_post_likes', {page: page});
  await InteractionManager.runAfterInteractions();
  return {
    type: 'LOADED_USER_POST_LIKES',
    data,
  };
}

async function loadLikedComments(page = 0): PromiseAction {
  const data = await Parse.Cloud.run('sync_comment_likes', {page: page});
  await InteractionManager.runAfterInteractions();
  return {
    type: 'LOADED_USER_COMMENT_LIKES',
    data,
  };
}

async function loadLikedReviews(page = 0): PromiseAction {
  const data = await Parse.Cloud.run('sync_review_likes', {page: page});
  await InteractionManager.runAfterInteractions();
  return {
    type: 'LOADED_USER_REVIEWS_LIKES',
    data,
  };
}

async function loadLikedArticles(page = 0): PromiseAction {
  const data = await Parse.Cloud.run('sync_article_likes', {page: page});
  await InteractionManager.runAfterInteractions();
  return {
    type: 'LOADED_USER_ARTICLES_LIKES',
    data,
  };
}

async function loadUsersReviews(page = 0): PromiseAction {
  const data = await Parse.Cloud.run('user_reviews', {page: page});
  await InteractionManager.runAfterInteractions();
  return {
    type: 'LOADED_USERS_REVIEWS',
    data,
  };
}

async function loadUserArticles(page = 0): PromiseAction {
  const data = await Parse.Cloud.run('user_articles', {page: page});
  await InteractionManager.runAfterInteractions();
  return {
    type: 'LOADED_USER_ARTICLES',
    data,
  };
}

async function loadUserPosts(page = 0): PromiseAction {
  const data = await Parse.Cloud.run('user_posts', {page: page});
  await InteractionManager.runAfterInteractions();
  return {
    type: 'LOADED_USER_POSTS',
    data,
  };
}

async function loadUserComments(page = 0): PromiseAction {
  const data = await Parse.Cloud.run('user_comments', {page: page});
  await InteractionManager.runAfterInteractions();
  return {
    type: 'LOADED_USER_COMMENTS',
    data,
  };
}

function toggleNotificationSetting(type: string, value: Boolean): ThunkAction {
  return (dispatch: Dispatch) => {
    if (Parse.User.current()) {
      Parse.User.current().set(type, value);
      Parse.User.current().save();
      dispatch({
        type: 'TOGGLED_NOTIFICATION_SETTING',
        data: {
          notification: type,
          value: value,
        }
      });
    }
  };
}

function reviewPromptShown() {
  return {
    type: 'REVIEW_PROMPT_SHOWN',
  };
}

function reviewPromptDelayed() {
  return {
    type: 'REVIEW_PROMPT_DELAYED',
  };
}

function reviewPromptDeclined() {
  return {
    type: 'REVIEW_PROMPT_DECLINED',
  };
}

function reviewPromptAccepted() {
  return {
    type: 'REVIEW_PROMPT_ACCEPTED',
  };
}

function appLaunched() {
  return {
    type: 'APP_LAUNCHED',
  };
}

function updateAppVersion() {
  return {
    type: 'UPDATE_APP_VERSION',
  };
}



module.exports = {
  appLaunched,
  loadUserLikes,
  followGig,
  unfollowGig,
  reviewPromptShown,
  reviewPromptAccepted,
  reviewPromptDeclined,
  reviewPromptDelayed,
  loadUserGigsFollowing,
  loadUserGigs,
  loadLikedPosts,
  loadLikedComments,
  loadLikedArticles,
  loadLikedReviews,
  loadUserPosts,
  loadUserComments,
  loadUsersReviews,
  loadUserArticles,
  toggleNotificationSetting,
  saveUserProfile,
  syncUser,
  updateAppVersion,
};
