// @flow
'use strict';

var { combineReducers } = require('redux');

module.exports = combineReducers({
  notifications: require('./notifications'),
  posts: require('./posts'),
  comments: require('./comments'),
  likedPosts: require('./likedPosts'),
  likedComments: require('./likedComments'),
  likedReviews: require('./likedReviews'),
  likedArticles: require('./likedArticles'),
  userPosts: require('./userPosts'),
  userComments: require('./userComments'),
  userReviews: require('./userReviews'),
  userArticles: require('./userArticles'),
  articles: require('./articles'),
  jobs: require('./jobs'),
  user: require('./user'),
  jobTypes: require('./jobTypes'),
  requirements: require('./requirements'),
  roles: require('./roles'),
  filter: require('./filter'),
  navigation: require('./navigation'),
  toast: require('./toast'),
  currentPost: require('./currentPost'),
  discussTopics: require('./discussTopics'),
  reviews: require('./reviews'),
  config: require('./config'),
});
