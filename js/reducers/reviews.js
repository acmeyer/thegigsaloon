//@flow
'use strict';

const {fromParseReviews} = require('./fromParseObjects');
import _ from 'lodash';

const initialState = {
  moreReviews: false,
  list: [],
};

function reviews(state = initialState, action) {
  switch (action.type) {
    case 'LOADED_REVIEWS':
      var list;
      if (action.list.length === 0) {
        list = [];
      } else {
        list = action.list.map(fromParseReviews);
        let firstFetch = action.page === 0 ? true : false;
        if (!firstFetch) {
          list = state.list.concat(list);
        }
      }
      return {
        ...state,
        list: list,
        moreReviews: action.moreResults,
      };
    case 'REVIEW_LIKED':
      let allReviews = state.list.map((review) => {
        if (review.id === action.review.id) {
          var count = review.likeCount ? review.likeCount : 0;
          return Object.assign({}, review, {
            likeCount: count + 1,
          });
        }
        return review;
      });
      return {...state, list: allReviews};

    case 'REVIEW_UNLIKED':
      let theReviews = state.list.map((review) => {
        if (review.id === action.review.id) {
          return Object.assign({}, review, {
            likeCount: review.likeCount - 1,
          });
        }
        return review;
      });
      return {...state, list: theReviews};

    default:
      return state;
  }
}

module.exports = reviews;
