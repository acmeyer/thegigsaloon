//@flow
'use strict';

import _ from 'lodash';
import {fromParseReviews} from './fromParseObjects';

const initialState = {
  list: [],
  moreResults: false,
};

function likedPosts(state = initialState, action) {
  if (action.type === 'LOADED_USER_REVIEWS_LIKES') {
    let {reviews, moreReviews, page} = action.data;
    let reviewList = reviews;
    let initialFetch = page === 0 ? true : false;
    if (!initialFetch) {
      reviewList = state.list.concat(reviewList);
    }
    return {
      moreResults: moreReviews,
      list: reviewList,
    };
  }
  if (action.type === 'REVIEW_LIKED') {
    return {
      ...state,
      list: _.concat(state.list, fromParseReviews(action.review)),
    };
  }
  if (action.type === 'REVIEW_UNLIKED') {
    let allReviews = state.list.filter((review) => {
      return review.id !== action.review.id;
    });
    return {
      ...state,
      list: allReviews,
    };
  }
  if (action.type === 'LOGGED_OUT') {
    return initialState;
  }
  return state;
}

module.exports = likedPosts;
