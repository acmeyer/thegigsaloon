'use strict';
/* global Parse */

import _ from 'lodash';
import NodeGeocoder from 'node-geocoder';
let geocoder = NodeGeocoder({
  provider: 'google',
  apiKey: process.env.GOOGLE_API_KEY
});
const Location = Parse.Object.extend('Location');

// Cloud callbacks
//--------------------
Parse.Cloud.beforeSave('Jobs', function(request, response) {
  Parse.Cloud.useMasterKey();

  if (request.object.get('requirements') === undefined) {
    request.object.set('requirements', []);
  }

  if (request.object.get('roles') === undefined) {
    request.object.set('roles', []);
  }

  if (request.object.get('locations') === undefined) {
    request.object.set('locations', []);
  }

  if (request.object.get('jobType') === undefined) {
    request.object.set('jobType', '');
  }

  if (request.object.dirty('reviewsCount') || request.object.dirty('totalRating')) {
    request.object.set('avgRating', _.round(request.object.get('totalRating') / request.object.get('reviewsCount'), 1));
  }

  if (request.object.dirty('wageReviewsCount') || request.object.dirty('totalWageRate')) {
    request.object.set('avgWageRate', _.round(Number(request.object.get('totalWageRate')) / Number(request.object.get('wageReviewsCount')), 2));
  }

  if (request.object.dirty('locations')) {
    var locations = request.object.get('locations');
    if (locations === undefined || locations.length === 0) {
      response.success();
    } else {
      Parse.Promise.all(locations.map(locs => convertLocation(request.object, locs))).then(
        function() {
          response.success();
        },
        function(error) {
          response.error(error);
        }
      );
    }
  } else {
    response.success();
  }
});

// Custom functions
//--------------------
Parse.Cloud.define('send_review_gig_notification', function(request, response) {
  Parse.Cloud.useMasterKey();

  var gigId = request.params.gigId;
  var userId = request.params.userId;

  var query = new Parse.Query('Jobs');
  query.get(gigId).then((gig) => {
    return sendGigReviewPushNotification(gig, userId);
  }).then(() => {
    response.success('Ok');
  }).catch((error) => {
    response.error(error);
  });

});

async function sendGigReviewPushNotification(gig, userId) {
  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('objectId', userId);

  var pushQuery  = new Parse.Query(Parse.Installation);
  pushQuery.matchesQuery('user', userQuery);

  Parse.Push.send({
    where: pushQuery,
    push_time: new Date(Date.now() + 3000),
    data: {
      badge: 'Increment',
      alert: 'Write a review for ' + gig.get('companyName'),
      url: 'thegigsaloon://jobReview/' + gig.id,
      background_data: true
    }
  }, {useMasterKey: true}).then(
    function() {
      console.log('Successfully sent notification.');
      return;
    },
    function(error) {
      console.error('Got an error ' + error.code + ' : ' + error.message);
      return error;
    }
  );
}

Parse.Cloud.define('send_gig_notification', function(request, response) {
  Parse.Cloud.useMasterKey();

  var gigId = request.params.gigId;
  var message = request.params.message;

  sendGigPushNotification(gigId, message).then(() => {
    response.success('Ok');
  }).catch((error) => {
    response.error(error);
  });
});

async function sendGigPushNotification(gigId, message) {
  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('notificationChannels', `job_${gigId}`);

  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.matchesQuery('user', userQuery);

  Parse.Push.send({
    where: pushQuery,
    push_time: new Date(Date.now() + 3000),
    data: {
      badge: 'Increment',
      alert: message,
      background_data: true
    }
  }, {useMasterKey: true}).then(() => {
    console.log('Successfully sent gig push notification.');
    return;
  }).catch((error) => {
    console.error('Got an error ' + error.code + ' : ' + error.message);
    return error;
  });
}

Parse.Cloud.define('load_jobs', function(request, response) {
  Parse.Cloud.useMasterKey();

  var filters = request.params.filters;
  var query = new Parse.Query('Jobs');
  query.find().then(function(jobs) {
    return Parse.Promise.when(byFilters(jobs, filters));
  }).then(
    function(jobs) {
      response.success(jobs);
    },
    function(error) {
      console.log(error);
      response.error([]);
    }
  );
});

function convertLocation(job, location) {
  if (location === 'Virtual') {
    return;
  }
  var locationQuery = new Parse.Query('Location');
  return locationQuery.equalTo('name', location).first().then(function(foundLocation) {
    if (foundLocation) {
      var relation = job.relation('jobLocations');
      relation.add(foundLocation);
      return;
    } else {
      return geocoder.geocode(location).then(function(results) {
        if (results[0]) {
          var newLocation = new Location();
          newLocation.set('name', location);
          newLocation.set('city', results[0].city);
          newLocation.set('state', results[0].administrativeLevels.level1short);
          newLocation.set('country', results[0].country);
          var geoPoint = new Parse.GeoPoint(results[0].latitude, results[0].longitude);
          newLocation.set('coordinates', geoPoint);
          return newLocation.save().then(
            function(loc) {
              if (loc) {
                var locationRelation = job.relation('jobLocations');
                locationRelation.add(loc);
              }
              return;
            },
            function(error) {
              console.log(error);
              return;
            }
          );
        } else {
          console.log('Geocode not found, location: ' + location);
          return;
        }
      });
    }
  }).catch({
    function(error) {
      console.log(error);
      return;
    }
  });
}

// Filters
function byJobTypes(jobs, jobTypes) {
  if (Object.keys(jobTypes).length === 0) {
    return jobs;
  }
  return jobs.filter((job) => {
    var hasMatchingJobType = false;
    hasMatchingJobType = jobTypes[job.get('jobType')];
    return hasMatchingJobType;
  });
}

function byRequirements(jobs, requirements) {
  if (Object.keys(requirements).length === 0) {
    return jobs;
  }
  return jobs.filter((job) => {
    var hasMatchingRequirement = false;
    var jobRequirements = job.get('requirements');

    // Show jobs that don't have any requirements
    if (jobRequirements.length === 0) {
      hasMatchingRequirement = true;
    } else {
      jobRequirements.forEach((requirement) => {
        if (requirement.includes('/')) {
          var requirementArray = requirement.split('/');
          var containsMatch = false;
          requirementArray.forEach((req) => {
            containsMatch = containsMatch || requirements[req];
          });
          hasMatchingRequirement = containsMatch;
        } else {
          hasMatchingRequirement = requirements[requirement];
        }
      });
    }
    return hasMatchingRequirement;
  });
}

function byRoles(jobs, roles) {
  if (Object.keys(roles).length === 0) {
    return jobs;
  }
  return jobs.filter((job) => {
    var hasMatchingRole = false;
    job.get('roles').forEach((role) => {
      hasMatchingRole = hasMatchingRole || roles[role];
    });
    return hasMatchingRole;
  });
}

function geoSearch(job, geoPoint) {
  var relation = job.relation('jobLocations');

  var query = relation.query();
  return query.withinMiles('coordinates', geoPoint, 100).first()
  .then(
    function(location) {
      if (location) {
        return true;
      } else {
        return false;
      }
    },
    function(error) {
      console.log('search failed');
      console.log(error);
      return false;
    }
  );
}

function lookupLocation(location) {
  return geocoder.geocode(location).then(
    function(results) {
      var geoPoint;
      if (results[0]) {
        geoPoint = new Parse.GeoPoint(results[0].latitude, results[0].longitude);
      }

      return geoPoint;
    },
    function(error) {
      console.log(error);
      return null;
    }
  );
}

async function byLocation(jobs, location) {
  if (location === '' || location === null || location === undefined) {
    return jobs;
  }
  if (location.toLowerCase() === 'virtual' || location.toLowerCase() === 'online') {
    return jobs.filter((job) => {
      return job.get('locations').includes('Virtual');
    });
  }
  let geoPoint = await lookupLocation(location);
  if (!geoPoint) {
    console.log('could not find location');
    return [];
  }

  var filteredJobs = [];
  for (let job of jobs) {
    if (job.get('locations').includes('Virtual')) {
      filteredJobs.push(job);
    } else {
      let atLeastOne = await geoSearch(job, geoPoint);
      if (atLeastOne) {
        filteredJobs.push(job);
      }
    }
  }
  return filteredJobs;
}

async function byFilters(jobs, filters) {
  var filteredJobs = jobs;
  filteredJobs = byRoles(filteredJobs, filters.roles);
  filteredJobs = byJobTypes(filteredJobs, filters.jobTypes);
  filteredJobs = byRequirements(filteredJobs, filters.requirements);
  filteredJobs = await byLocation(filteredJobs, filters.location);
  return filteredJobs;
}
