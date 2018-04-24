//@flow
'use strict';

import _ from 'lodash';

function getJob(jobs, userGigs, id) {
  var array = _.concat(jobs, userGigs);
  return array.filter((job) => job.id === id)[0];
}

function getJobsWithoutCurrentUnshuffled(jobs, userGigs) {
  var userGigs = userGigs.map((j) => j.id);
  var jobIds = jobs.map((j) => j.id);
  var filteredJobs = jobIds.filter((job) => !userGigs.includes(job));
  return filteredJobs.sort();
}

function getJobsWithoutCurrent(jobs, userGigs) {
  var userGigs = userGigs.map((j) => j.id);
  return _.shuffle(jobs.filter((job) => !userGigs.includes(job.id)));
}

function getUserJobs(jobs, userGigs) {
  return jobs.filter((job) => userGigs.includes(job.id));
}

module.exports = { getJob, getJobsWithoutCurrent, getJobsWithoutCurrentUnshuffled, getUserJobs };
