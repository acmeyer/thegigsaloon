//@flow
'use strict';

const initialState = {
  list: [],
  moreResults: false,
};

function userReviews(state = initialState, action) {
  if (action.type === 'LOADED_USERS_REVIEWS') {
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
    let theReviewList = state.list.map((review) => {
      if (review.id === action.review.id) {
        return Object.assign({}, review, {
          likeCount: review.likeCount + 1
        });
      }
      return review;
    });
    return {
      ...state,
      list: theReviewList,
    };
  }
  if (action.type === 'REVIEW_UNLIKED') {
    let updatedReviewList = state.list.map((review) => {
      if (review.id === action.review.id) {
        return Object.assign({}, review, {
          likeCount: review.likeCount - 1
        });
      }
      return review;
    });
    return {
      ...state,
      list: updatedReviewList,
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

module.exports = userReviews;
