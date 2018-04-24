//@flow
'use strict';

const initialState = {
  tab: 'jobs',
  gigsList: 'available',
  jobList: 'details',
  currentPostId: null,
  currentJobId: null,
  filterScreen: 'initial',
};

function navigation(state = initialState, action) {
  if (action.type === 'SWITCH_TAB') {
    return {...state, tab: action.tab};
  }
  if (action.type === 'SWITCH_GIGS_LIST') {
    return {...state, gigsList: action.list};
  }
  if (action.type === 'SWITCH_JOB_LIST') {
    return {...state, jobList: action.list};
  }
  if (action.type === 'SHOW_POST') {
    return {...state, currentPostId: action.postId};
  }
  if (action.type === 'SHOW_JOB') {
    return {...state, currentJobId: action.jobId, jobList: 'details'};
  }
  if (action.type === 'SWITCH_FILTER_SCREEN') {
    return {...state, filterScreen: action.screen};
  }
  if (action.type === 'LOGGED_OUT') {
    return initialState;
  }
  return state;
}

module.exports = navigation;
