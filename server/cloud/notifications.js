'use strict';
/* global Parse */

import _ from 'lodash';
import {fromParseReviews} from './fromParseObjects';

Parse.Cloud.job('send_daily_notifications', function(request, status) {
  Parse.Cloud.useMasterKey();

  status.message('Starting to send daily notifications...');

  new Parse.Query('Jobs').find()
  .then((results) => Parse.Promise.when(results.forEach(sendDailyNotifications)))
  .then(() => status.success('Finished sending daily notifications.'))
  .catch((error) => status.error(error.message));
});

function sendDailyNotifications(job) {
  // Set up date object to query against for the past day
  var date = new Date();
  date.setDate(date.getDate() - 1);

  // find all reviews for a gig in the past day
  var reviewsMessage = '';
  var reviewQuery = new Parse.Query('Review')
    .equalTo('gig', job)
    .greaterThanOrEqualTo('createdAt', date);
  reviewQuery.find().then((results) => {
    if (results.length > 0) {
      var word = 'review';
      if (results.length > 1) { word = 'reviews'; }
      reviewsMessage = results.length + ' new ' + word + ' for ' + job.get('companyName') + '. Check them out now.';
      sendDailyJobPush(job, reviewsMessage);
    }
  });

  // find all posts about a gig in the last day
  var postsMessage = '';
  var postsQuery = new Parse.Query('Post')
    .equalTo('tags', job.get('companyName').toLowerCase())
    .greaterThanOrEqualTo('createdAt', date);
  postsQuery.find().then((results) => {
    if (results.length > 0) {
      var word = 'post';
      if (results.length > 1) { word = 'posts'; }
      postsMessage = results.length + ' new ' + word + ' for ' + job.get('companyName') + '. See what\'s been said.';
      sendDailyJobPush(job, postsMessage);
    }
  });

  // find all articles about a gig in the last day
  var articlesMessage = '';
  var articlesQuery = new Parse.Query('Article')
    .equalTo('tags', job.get('companyName').toLowerCase())
    .greaterThanOrEqualTo('createdAt', date);
  articlesQuery.find().then((results) => {
    if (results.length > 0) {
      var word = 'news item';
      if (results.length > 1) { word = 'news items'; }
      articlesMessage = results.length + ' new ' + word + ' for ' + job.get('companyName') + '. Catch up on the latest.';
      sendDailyJobPush(job, articlesMessage);
    }
  });
}

function sendDailyJobPush(job, message) {
  // Set up date object to query against for the past day
  var date = new Date();
  date.setDate(date.getDate() - 1);

  // find user with no activity for the last day
  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('gigsFollowing', job);

  var pushQuery  = new Parse.Query(Parse.Installation);
  pushQuery.lessThanOrEqualTo('updatedAt', date);
  pushQuery.matchesQuery('user', userQuery);

  Parse.Push.send({
    where: pushQuery,
    push_time: new Date(Date.now() + 60000),
    data: {
      badge: 'Increment',
      alert: message,
      url: 'thegigsaloon://job/' + job.id,
      background_data: true
    }
  }, {useMasterKey: true}).then(
    function() { console.log('Successfully sent notification.'); },
    function(error) { console.error('Got an error ' + error.code + ' : ' + error.message); }
  );
}

function sendArticleTagNotifications(article) {
  if (!article) {
    throw new Error('Article not found.');
  }

  article.get('tags').forEach((tag) => {
    var jobQuery = new Parse.Query('Jobs');
    jobQuery.equalTo('canonicalCompanyName', tag);
    jobQuery.find().then((jobs) => {
      jobs.forEach((job) => sendArticleNotificationForJob(article, job));
    }).catch((error) => {
      console.error('Failed to find jobs.', error);
    });
  });
}

function sendArticleNotificationForJob(article, job) {
  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('notificationChannels', `job_${job.id}`);

  var pushQuery  = new Parse.Query(Parse.Installation);
  pushQuery.matchesQuery('user', userQuery);

  Parse.Push.send({
    where: pushQuery,
    push_time: new Date(Date.now() + 3000),
    data: {
      badge: 'Increment',
      alert: 'New article about ' + job.get('companyName') + '. Tap here to check it out.',
      url: 'thegigsaloon://news',
      background_data: true
    }
  }, {useMasterKey: true}).then(
    function() { console.log('Successfully sent notification.'); },
    function(error) { console.error('Got an error ' + error.code + ' : ' + error.message); }
  );
}

function sendPostTagNotifications(post) {
  if (!post) {
    throw new Error('Post not found.');
  }

  post.get('tags').forEach((tag) => {
    var jobQuery = new Parse.Query('Jobs');
    jobQuery.equalTo('canonicalCompanyName', tag);
    jobQuery.find().then((jobs) => {
      jobs.forEach((job) => sendPostNotificationForJob(post, job));
    }).catch((error) => {
      console.error('Failed to find jobs.', error);
    });
  });
}

function sendPostNotificationForJob(post, job) {
  var userQuery = new Parse.Query(Parse.User);
  if (post.get('author')) {
    userQuery.notEqualTo('objectId', post.get('author').id);
  }
  userQuery.equalTo('notificationChannels', `job_${job.id}`);

  var pushQuery  = new Parse.Query(Parse.Installation);
  pushQuery.matchesQuery('user', userQuery);

  Parse.Push.send({
    where: pushQuery,
    push_time: new Date(Date.now() + 3000),
    data: {
      badge: 'Increment',
      alert: 'New post about ' + job.get('companyName') + '. Tap here to check it out.',
      url: 'thegigsaloon://post/' + post.id,
      background_data: true
    }
  }, {useMasterKey: true}).then(
    function() { console.log('Successfully sent notification.'); },
    function(error) { console.error('Got an error ' + error.code + ' : ' + error.message); }
  );
}

function sendPostLikedNotification(post) {
  if (!post.get('author')) {
    return;
  }
  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('objectId', post.get('author').id);
  userQuery.equalTo('allowMyPostNotifications', true);

  var pushQuery  = new Parse.Query(Parse.Installation);
  pushQuery.matchesQuery('user', userQuery);

  var postTitle = post.get('title');
  var messageString = (postTitle && postTitle !== '')
    ? postTitle
    : post.get('text');

  messageString = _.truncate(messageString);

  Parse.Push.send({
    where: pushQuery,
    push_time: new Date(Date.now() + 3000),
    data: {
      badge: 'Increment',
      alert: 'Nice work! Someone liked your post: "' + messageString + '"',
      url: 'thegigsaloon://post/' + post.id,
      background_data: true
    }
  }, {useMasterKey: true}).then(
    function() { console.log('Successfully sent notification.'); },
    function(error) { console.error('Got an error ' + error.code + ' : ' + error.message); }
  );
}

function sendCommentLikedNotification(comment, post) {
  if (!comment.get('author')) {
    throw new Error('Author not found.');
  }
  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('objectId', comment.get('author').id);
  userQuery.equalTo('allowMyCommentNotifications', true);

  var pushQuery  = new Parse.Query(Parse.Installation);
  pushQuery.matchesQuery('user', userQuery);

  var messageString = _.truncate(comment.get('text'));

  Parse.Push.send({
    where: pushQuery,
    push_time: new Date(Date.now() + 3000),
    data: {
      badge: 'Increment',
      alert: 'Sweet! Someone liked your comment: "' + messageString + '"',
      url: 'thegigsaloon://post/' + post.id,
      background_data: true
    }
  }, {useMasterKey: true}).then(
    function() { console.log('Successfully sent notification.'); },
    function(error) { console.error('Got an error ' + error.code + ' : ' + error.message); }
  );
}

function sendNewCommentNotifications(comment, post) {
  if (!comment) {
    throw new Error('Comment not found.');
  }

  var usersOwnPostNotification = new Parse.Query(Parse.User);
  usersOwnPostNotification.equalTo('allowMyPostNotifications', true);

  var usersLikePostNotification = new Parse.Query(Parse.User);
  usersLikePostNotification.equalTo('allowLikedPostNotifications', true);

  var usersCommentedPostNotification = new Parse.Query(Parse.User);
  usersCommentedPostNotification.equalTo('allowCommentedPostNotifications', true);

  var userQuery = new Parse.Query.or(usersOwnPostNotification, usersLikePostNotification, usersCommentedPostNotification);
  userQuery.notEqualTo('objectId', comment.get('author').id);
  userQuery.equalTo('notificationChannels', `post_${post.id}`);

  var pushQuery  = new Parse.Query(Parse.Installation);
  pushQuery.matchesQuery('user', userQuery);

  var postTitle = post.get('title');
  var messageString = (postTitle && postTitle !== '')
    ? postTitle
    : post.get('text');

  messageString = _.truncate(messageString);

  Parse.Push.send({
    where: pushQuery,
    push_time: new Date(Date.now() + 3000),
    data: {
      badge: 'Increment',
      alert: 'New comment on the post: "' + messageString + '"',
      url: 'thegigsaloon://post/' + post.id,
      background_data: true
    }
  }, {useMasterKey: true}).then(
    function() { console.log('Successfully sent notification.'); },
    function(error) { console.error('Got an error ' + error.code + ' : ' + error.message); }
  );
}

function sendArticleLikedNotification(article) {
  if (!article.get('submittedBy')) {
    return;
  }

  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('objectId', article.get('submittedBy').id);
  userQuery.equalTo('allowLikedArticlesNotifications', true);

  var pushQuery  = new Parse.Query(Parse.Installation);
  pushQuery.matchesQuery('user', userQuery);

  var articleTitle = article.get('title');

  var messageString = _.truncate(articleTitle);

  Parse.Push.send({
    where: pushQuery,
    push_time: new Date(Date.now() + 3000),
    data: {
      badge: 'Increment',
      alert: 'Nice work! Someone liked the article you submitted: "' + messageString + '"',
      background_data: true
    }
  }, {useMasterKey: true}).then(
    function() { console.log('Successfully sent notification.'); },
    function(error) { console.error('Got an error ' + error.code + ' : ' + error.message); }
  );
}

function sendReviewLikedNotification(review) {
  if (!review.get('author')) {
    return;
  }

  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('objectId', review.get('author').id);
  userQuery.equalTo('allowLikedReviewsNotifications', true);

  var pushQuery  = new Parse.Query(Parse.Installation);
  pushQuery.matchesQuery('user', userQuery);

  var reviewObject = fromParseReviews(review);

  Parse.Push.send({
    where: pushQuery,
    push_time: new Date(Date.now() + 3000),
    data: {
      badge: 'Increment',
      alert: 'Awesome! Someone liked your review for ' + reviewObject.gigName,
      background_data: true
    }
  }, {useMasterKey: true}).then(
    function() { console.log('Successfully sent notification.'); },
    function(error) { console.error('Got an error ' + error.code + ' : ' + error.message); }
  );
}

module.exports = {
  sendNewCommentNotifications,
  sendPostTagNotifications,
  sendArticleTagNotifications,
  sendPostLikedNotification,
  sendCommentLikedNotification,
  sendArticleLikedNotification,
  sendReviewLikedNotification,
};
