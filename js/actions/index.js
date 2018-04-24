// @flow
'use strict';

const parseActions = require('./parse');
const navigationActions = require('./navigation');
const notificationActions = require('./notifications');
const newsActions = require('./news');
const loginActions = require('./login');
const jobsActions = require('./jobs');
const postsActions = require('./posts');
const commentsActions = require('./comments');
const filterActions = require('./filter');
const testActions = require('./test');
const installationActions = require('./installation');
const userActions = require('./user');
const toastActions = require('./toasts');
const reviewActions = require('./reviews');
const configActions = require('./config');

module.exports = {
  ...loginActions,
  ...notificationActions,
  ...newsActions,
  ...parseActions,
  ...jobsActions,
  ...postsActions,
  ...commentsActions,
  ...filterActions,
  ...testActions,
  ...navigationActions,
  ...installationActions,
  ...userActions,
  ...toastActions,
  ...reviewActions,
  ...configActions,
};
