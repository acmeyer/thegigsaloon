//@flow
'use strict';

module.exports = {
  switchTab: (tab) => ({
    type: 'SWITCH_TAB',
    tab,
  }),

  switchGigsList: (list) => ({
    type: 'SWITCH_GIGS_LIST',
    list,
  }),

  switchJobList: (list) => ({
    type: 'SWITCH_JOB_LIST',
    list,
  }),

  showPost: (postId) => ({
    type: 'SHOW_POST',
    postId,
  }),

  showJob: (jobId) => ({
    type: 'SHOW_JOB',
    jobId,
  }),

  switchFilterScreen: (screen) => ({
    type: 'SWITCH_FILTER_SCREEN',
    screen,
  }),
};
