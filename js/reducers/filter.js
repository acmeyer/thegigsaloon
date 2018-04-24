//@flow
'use strict';

function filter(state = {jobTypes: {}, location: null, requirements: {}, roles: {}}, action) {
  if (action.type === 'APPLY_JOBS_FILTER') {
    return action.filters;
  }
  if (action.type === 'CLEAR_FILTER') {
    return {jobTypes: {}, location: null, requirements: {}, roles: {}};
  }
  return state;
}

module.exports = filter;
