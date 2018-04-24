//@flow
'use strict';

import type {Action} from '../actions/types';
import _ from 'lodash';
import update from 'react-addons-update';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
const {fromParseJobs} = require('./fromParseObjects');

const initialState = {
  isLoggedIn: false,
  hasSkippedLogin: false,
  hasSkippedApplicationLogin: false,
  hasSeenFilterWalkthrough: false,
  hasSkippedInfoCollection: true,
  hasSeenReviewPrompt: false,
  hasDelayedReviewPrompt: false,
  dateDelayedReviewPrompt: null,
  appLaunchesForAppVersion: 0,
  appVersion: DeviceInfo.getVersion(),
  likedPosts: [],
  likedComments: [],
  likedArticles: [],
  likedReviews: [],
  gigs: [],
  gigsReviewed: [],
  gigsFollowing: [],
  allowMyPostNotifications: false,
  allowMyCommentNotifications: false,
  allowLikedPostNotifications: false,
  allowCommentedPostNotifications: false,
  allowLikedReviewsNotifications: false,
  allowLikedArticlesNotifications: false,
  id: null,
  facebook_id: null,
  profilePicture: null,
  name: null,
  email: null,
  phoneNumber: null,
  postalCode: null,
  city: null,
  birthMonth: null,
  birthDay: null,
  birthYear: null,
  createdAt: null,
};

function user(state = initialState, action: Action) {
  if (action.type === 'LOGGED_IN') {
    let {id, facebook_id, profilePicture, name, email, phoneNumber, postalCode, city, birthMonth, birthDay, birthYear, createdAt, allowMyPostNotifications, allowLikedPostNotifications, allowMyCommentNotifications, allowCommentedPostNotifications, allowLikedReviewsNotifications, allowLikedArticlesNotifications} = action.data;
    return {
      ...state,
      hasSkippedLogin: false,
      isLoggedIn: true,
      hasSkippedInfoCollection: name ? true : false,
      id,
      facebook_id,
      profilePicture,
      name,
      email,
      phoneNumber,
      postalCode,
      city,
      birthMonth,
      birthDay,
      birthYear,
      createdAt,
      allowMyPostNotifications,
      allowMyCommentNotifications,
      allowLikedPostNotifications,
      allowCommentedPostNotifications,
      allowLikedReviewsNotifications,
      allowLikedArticlesNotifications,
    };
  }
  if (action.type === 'SKIPPED_USER_INFO_COLLECTION') {
    return {
      ...state,
      hasSkippedInfoCollection: true,
    };
  }
  if (action.type === 'SKIPPED_LOGIN') {
    return {
      ...state,
      isLoggedIn: false,
      hasSkippedLogin: true,
      hasSkippedInfoCollection: true,
      likedPosts: [],
      likedComments: [],
      likedArticles: [],
      likedReviews: [],
      gigs: [],
      gigsReviewed: [],
      gigsFollowing: [],
      allowMyPostNotifications: false,
      allowLikedPostNotifications: false,
      allowCommentedPostNotifications: false,
      allowMyCommentNotifications: false,
      allowLikedReviewsNotifications: false,
      allowLikedArticlesNotifications: false,
      id: null,
      facebook_id: null,
      profilePicture: null,
      name: null,
      email: null,
      phoneNumber: null,
      postalCode: null,
      city: null,
      birthMonth: null,
      birthDay: null,
      birthYear: null,
      createdAt: null,
    };
  }
  if (action.type === 'SKIPPED_APPLICATION_LOGIN') {
    return {
      ...state,
      hasSkippedApplicationLogin: true,
    };
  }
  if (action.type === 'FINISHED_GIG_FILTER') {
    return {
      ...state,
      hasSeenFilterWalkthrough: true,
    };
  }
  if (action.type === 'SKIPPED_GIG_FILTER') {
    return {
      ...state,
      hasSeenFilterWalkthrough: true,
    };
  }
  if (action.type === 'LOADED_USER_POST_LIKES') {
    let {posts} = action.data;
    if (posts === undefined) {
      posts = [];
    } else {
      posts = posts.map((p) => p.id);
    }
    return {
      ...state,
      likedPosts: posts,
    };
  }
  if (action.type === 'LOADED_USER_COMMENT_LIKES') {
    let {comments} = action.data;
    if (comments === undefined) {
      comments = [];
    } else {
      comments = comments.map((c) => c.id);
    }
    return {
      ...state,
      likedComments: comments,
    };
  }
  if (action.type === 'LOADED_USER_ARTICLES_LIKES') {
    let {articles} = action.data;
    if (articles === undefined) {
      articles = [];
    } else {
      articles = articles.map((a) => a.id);
    }
    return {
      ...state,
      likedArticles: articles,
    };
  }
  if (action.type === 'LOADED_USER_REVIEWS_LIKES') {
    let {reviews} = action.data;
    if (reviews === undefined) {
      reviews = [];
    } else {
      reviews = reviews.map((r) => r.id);
    }
    return {
      ...state,
      likedReviews: reviews,
    };
  }
  if (action.type === 'MARK_USER_HAS_JOB') {
    return {...state, gigs: _.concat(state.gigs, fromParseJobs(action.job))};
  }
  if (action.type === 'LOADED_USER_GIGS') {
    return {...state, gigs: action.gigs.map(fromParseJobs)};
  }
  if (action.type === 'LOADED_USER_REVIEWS') {
    return {...state, gigsReviewed: action.data};
  }
  if (action.type === 'REVIEW_SAVED') {
    return {...state, gigsReviewed: _.uniq([action.data.jobId, ...state.gigsReviewed])};
  }
  if (action.type === 'LOADED_USER_GIGS_FOLLOWING') {
    return {...state, gigsFollowing: action.data};
  }
  if (action.type === 'FOLLOWED_GIG') {
    return {...state, gigsFollowing: _.uniq([action.jobId, ...state.gigsFollowing])};
  }
  if (action.type === 'UNFOLLOWED_GIG') {
    return {...state, gigsFollowing: _.pull(state.gigsFollowing, action.jobId)};
  }
  if (action.type === 'POST_LIKED') {
    return {...state, likedPosts: _.uniq([action.post.id, ...state.likedPosts])};
  }
  if (action.type === 'POST_UNLIKED') {
    return {...state, likedPosts: _.pull(state.likedPosts, action.post.id)};
  }
  if (action.type === 'COMMENT_LIKED') {
    return {...state, likedComments: _.uniq([action.comment.id, ...state.likedComments])};
  }
  if (action.type === 'COMMENT_UNLIKED') {
    return {...state, likedComments: _.pull(state.likedComments, action.comment.id)};
  }
  if (action.type === 'ARTICLE_LIKED') {
    return {...state, likedArticles: _.uniq([action.article.id, ...state.likedArticles])};
  }
  if (action.type === 'ARTICLE_UNLIKED') {
    return {...state, likedArticles: _.pull(state.likedArticles, action.article.id)};
  }
  if (action.type === 'REVIEW_LIKED') {
    return {...state, likedReviews: _.uniq([action.review.id, ...state.likedReviews])};
  }
  if (action.type === 'REVIEW_UNLIKED') {
    return {...state, likedReviews: _.pull(state.likedReviews, action.review.id)};
  }
  if (action.type === 'USER_PROFILE_SAVED') {
    let {name, profilePicture, email, phoneNumber, postalCode, city, birthMonth, birthDay, birthYear} = action.data;
    return {
      ...state,
      name,
      profilePicture,
      email,
      phoneNumber,
      postalCode,
      city,
      birthMonth,
      birthDay,
      birthYear,
    };
  }
  if (action.type === 'TOGGLED_NOTIFICATION_SETTING') {
    let {notification, value} = action.data;
    var currentState = {...state};
    currentState[notification] = value;
    return update(state, {
      $set: currentState
    });
  }
  if (action.type === 'USER_PROFILE_LOADED') {
    let {id, facebook_id, profilePicture, name, email, phoneNumber, postalCode, city, birthMonth, birthDay, birthYear, allowMyPostNotifications, allowMyCommentNotifications, allowLikedPostNotifications, allowCommentedPostNotifications, allowLikedReviewsNotifications, allowLikedArticlesNotifications} = action.data;
    return {
      ...state,
      id,
      facebook_id,
      profilePicture,
      name,
      email,
      phoneNumber,
      postalCode,
      city,
      birthMonth,
      birthDay,
      birthYear,
      allowMyPostNotifications,
      allowMyCommentNotifications,
      allowLikedPostNotifications,
      allowCommentedPostNotifications,
      allowLikedReviewsNotifications,
      allowLikedArticlesNotifications,
    };
  }
  if (action.type === 'LOGGED_OUT') {
    return {
      ...state,
      isLoggedIn: false,
      hasSkippedLogin: false,
      hasSkippedInfoCollection: false,
      likedPosts: [],
      likedComments: [],
      likedArticles: [],
      likedReviews: [],
      gigs: [],
      gigsReviewed: [],
      gigsFollowing: [],
      allowMyPostNotifications: false,
      allowLikedPostNotifications: false,
      allowCommentedPostNotifications: false,
      allowMyCommentNotifications: false,
      allowLikedReviewsNotifications: false,
      allowLikedArticlesNotifications: false,
      id: null,
      facebook_id: null,
      profilePicture: null,
      name: null,
      email: null,
      phoneNumber: null,
      postalCode: null,
      city: null,
      birthMonth: null,
      birthDay: null,
      birthYear: null,
      createdAt: null,
    };
  }
  if (action.type === 'REVIEW_PROMPT_SHOWN') {
    return {
      ...state,
      hasSeenReviewPrompt: true,
      hasDelayedReviewPrompt: false,
    };
  }
  if (action.type === 'REVIEW_PROMPT_DELAYED') {
    return {
      ...state,
      hasSeenReviewPrompt: true,
      hasDelayedReviewPrompt: true,
      dateDelayedReviewPrompt: moment().valueOf()
    };
  }
  if (action.type === 'REVIEW_PROMPT_DECLINED') {
    return {
      ...state,
      hasSeenReviewPrompt: true,
      hasDelayedReviewPrompt: false,
    };
  }
  if (action.type === 'REVIEW_PROMPT_ACCEPTED') {
    return {
      ...state,
      hasSeenReviewPrompt: true,
      hasDelayedReviewPrompt: false,
    };
  }
  if (action.type === 'RESET_NUXES') {
    return {...state};
  }
  if (action.type === 'APP_LAUNCHED') {
    return {
      ...state,
      appLaunchesForAppVersion: state.appLaunchesForAppVersion + 1,
    };
  }
  if (action.type === 'UPDATE_APP_VERSION') {
    return {
      ...state,
      appLaunchesForAppVersion: 1,
      hasSeenReviewPrompt: false,
      appVersion: DeviceInfo.getVersion(),
    };
  }
  return state;
}

module.exports = user;
