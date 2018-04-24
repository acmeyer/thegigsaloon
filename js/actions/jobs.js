//@flow
'use strict';

const Parse = require('parse/react-native');
import {
  InteractionManager,
} from 'react-native';
const logError = require('logError');
import type { ThunkAction, Dispatch, PromiseAction, Action } from './types';
import { showToastMessage } from './toasts';

function startLoadingJobs(): Action {
  return {
    type: 'STARTED_LOADING_JOBS',
  };
}

function loadingJobsTimeout(): Action {
  return {
    type: 'LOADING_JOBS_TIMEOUT',
  };
}

function finishedGigFilter(): Action {
  return {
    type: 'FINISHED_GIG_FILTER',
  };
}

function skipGigFilter(): Action {
  return {
    type: 'SKIPPED_GIG_FILTER',
  };
}

function markUserHasJob(jobId): ThunkAction {
  return (dispatch: Dispatch) => {
    if (Parse.User.current()) {
      var query = new Parse.Query('Jobs');
      query.get(jobId, {
        success: function(job) {
          Parse.User.current().relation('gigs').add(job);
          Parse.User.current().save();
          dispatch({
            type: 'MARK_USER_HAS_JOB',
            job,
          });
          dispatch(showToastMessage('Added as one of your gigs', 'short', 'bottom'));
        },
        error: logError
      });
    }
  };
}

async function loadJobs(filters = {jobTypes: {}, location: null, requirements: {}, roles: {}}): PromiseAction {
  await InteractionManager.runAfterInteractions();
  const list = await Parse.Cloud.run('load_jobs', {filters});
  return {
    type: 'LOADED_JOBS',
    list,
  };
}



module.exports = {loadJobs, skipGigFilter, finishedGigFilter, startLoadingJobs, loadingJobsTimeout, markUserHasJob};
