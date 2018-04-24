//@flow
'use strict';

const Parse = require('parse/react-native');
const InteractionManager = require('InteractionManager');
const logError = require('logError');

import type { ThunkAction, PromiseAction } from './types';

const PER_PAGE = 50;

function loadReviews(jobId, page = 0) {
  return (dispatch) => {
    var jobQuery = new Parse.Query('Jobs');
    return jobQuery.get(jobId, {
      success: function(job) {
        var query = new Parse.Query('Review')
          .include('author')
          .include('gig')
          .equalTo('gig', job)
          .descending('createdAt')
          .limit((page + 1) * PER_PAGE)
          .skip(page * PER_PAGE);
        return query.find({
          success: (list) => {
            var more = list.length === PER_PAGE ? true : false;
            page = list.length === 0 ? page - 1 : page;
            dispatch({
              type: 'LOADED_REVIEWS',
              list: list,
              moreResults: more,
              page: page,
            });
          },
          error: logError,
        });
      },
      error: logError,
    });
  };
}

function likeReview(reviewId) {
  return (dispatch) => {
    if (Parse.User.current()) {
      Parse.Cloud.run('liked_review', {reviewId: reviewId});
      var query = new Parse.Query('Review');
      query.get(reviewId, {
        success: function(review) {
          review.increment('likeCount');
          review.save();
          Parse.User.current().relation('reviewsLiked').add(review);
          Parse.User.current().save();
          dispatch({
            type: 'REVIEW_LIKED',
            review: review,
          });
        },
        error: logError
      });
    }
  };
}

function unlikeReview(reviewId) {
  return (dispatch) => {
    if (Parse.User.current()) {
      var query = new Parse.Query('Review');
      query.get(reviewId, {
        success: function(review) {
          review.increment('likeCount', -1);
          review.save();
          Parse.User.current().relation('reviewsLiked').remove(review);
          Parse.User.current().save();
          dispatch({
            type: 'REVIEW_UNLIKED',
            review: review,
          });
        },
        error: logError
      });
    }
  };
}

async function loadUserReviews(): ThunkAction {
  const data = await Parse.Cloud.run('load_user_reviews');
  await InteractionManager.runAfterInteractions();
  return {
    type: 'LOADED_USER_REVIEWS',
    data,
  };
}

async function submitGigReview(reviewData): PromiseAction {
  const data = await Parse.Cloud.run('submit_review', {reviewData: reviewData});
  await InteractionManager.runAfterInteractions();
  return {
    type: 'REVIEW_SAVED',
    data,
  };
}

module.exports = {loadUserReviews, submitGigReview, loadReviews, likeReview, unlikeReview};
