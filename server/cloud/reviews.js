'use strict';
/* global Parse */

const Review = Parse.Object.extend('Review');
import {sendReviewLikedNotification} from './notifications';

// Cloud callbacks
//--------------------
Parse.Cloud.beforeSave('Review', function(request, response) {
  if (!request.object.get('likeCount')) {
    request.object.set('likeCount', 0);
  }

  response.success();
});

Parse.Cloud.afterSave('Review', function(request, response) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query('Jobs');
  query.get(request.object.get('gig').id, {
    success: function(job) {
      updateGigReviews(job);
    },
    error: function(error) {
      console.error('Got an error ' + error.code + ' : ' + error.message);
    }
  });
});

Parse.Cloud.afterDelete('Review', function(request, response) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query('Jobs');
  query.get(request.object.get('gig').id, {
    success: function(job) {
      updateGigReviews(job);
    },
    error: function(error) {
      console.error('Got an error ' + error.code + ' : ' + error.message);
    }
  });
});

function updateGigReviews(job) {
  var query = new Parse.Query('Review');
  query.equalTo('gig', job);
  query.find().then((reviews) => {
    job.set('reviewsCount', reviews.length);
    // add up all reviews ratings
    var totalRating = 0;
    reviews.forEach((r) => {
      totalRating += r.get('rating');
    });
    job.set('totalRating', totalRating);
    // add up all reviews wage rate and reviews with a wage rate
    var reviewsWithWage = reviews.filter((r) => r.get('wageRate'));
    var totalWageRate = 0;
    reviewsWithWage.forEach((rw) => {
      totalWageRate += Number(rw.get('wageRate'));
    });
    job.set('wageReviewsCount', reviewsWithWage.length);
    job.set('totalWageRate', totalWageRate.toString());
    job.save();
  });
}

// Custom functions
//---------------------
Parse.Cloud.define('load_user_reviews', function (request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.error('No user!');
  }

  var query = new Parse.Query('Review');
  query.equalTo('author', user)
    .find()
    .then(
      function(reviews) {
        reviews = reviews.map((review) => review.get('gig').id);
        return response.success(reviews);
      },
      function(error) { response.error(error);}
    );
});

Parse.Cloud.define('submit_review', function (request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.error('No user!');
  }

  let {rating, wageRate, comment, gigId} = request.params.reviewData;

  var query = new Parse.Query('Jobs');
  query.get(gigId, {
    success: function(job) {
      var newReview = new Review({
        rating: rating,
        wageRate: wageRate,
        comment: comment,
        author: user,
        gig: job,
      });
      newReview.save().then(() => {
        response.success({jobId: job.id});
      });
    },
    error: function(error) {
      console.log('error', error.message);
      response.error(error);
    }
  });
});

Parse.Cloud.define('liked_review', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.error('No user!');
  }

  var query = new Parse.Query('Review');
  query.include('gig').get(request.params.reviewId, {
    success: function(review) {
      if (user.id !== review.get('author').id) {
        sendReviewLikedNotification(review);
      }
      response.success();
    },
    error: (error) => response.error(error.message)
  });
});
