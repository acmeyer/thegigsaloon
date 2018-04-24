// @flow
'use strict';

const {fromParseJobs} = require('./fromParseObjects');

const initialState = {
  list: [],
  loading: false,
};

function jobs(state = initialState, action) {
  if (action.type === 'STARTED_LOADING_JOBS') {
    return {
      ...state,
      loading: true,
    };
  }
  if (action.type === 'LOADING_JOBS_TIMEOUT') {
    return {
      ...state,
      loading: false,
    };
  }
  if (action.type === 'LOADED_JOBS') {
    return {
      list: action.list.map(fromParseJobs),
      loading: false,
    };
  }
  return state;
}

module.exports = jobs;
