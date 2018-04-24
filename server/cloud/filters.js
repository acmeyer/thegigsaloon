'use strict';
/* global Parse */

Parse.Cloud.define('load_filters', function(request, response) {
  Parse.Cloud.useMasterKey();

  var query = new Parse.Query('Jobs');
  query.find().then(
    function(jobs) {
      let filters = getFilters(jobs);
      response.success(filters);
    },
    function(error) {
      response.error(null);
    }
  );
});

function getFilters(jobs) {
  var jobTypesMap = Object.create(null);
  var requirementsMap = Object.create(null);
  var rolesMap = Object.create(null);
  jobs.forEach((job) => {
    var jobType = job.get('jobType') || '';
    jobTypesMap[jobType] = true;
    var therequirements = job.get('requirements') || [];
    therequirements.forEach((requirement) => {
      var requirementArray = requirement.split('/');
      if (requirementArray.length > 1) {
        requirementArray.forEach((req) => {
          requirementsMap[req] = true;
        });
      } else {
        requirementsMap[requirement] = true;
      }
    });
    var theroles = job.get('roles') || [];
    theroles.forEach((role) => {
      rolesMap[role] = true;
    });
  });
  return {
    jobTypes: Object.keys(jobTypesMap).sort(),
    requirements: Object.keys(requirementsMap).sort(),
    roles: Object.keys(rolesMap).sort(),
  };
}
