// @flow
'use strict';

const APP_ID = 'gig-saloon';
const SERVER_URL = 'http://localhost:8080/parse';
const IS_DEVELOPMENT = true;
const GCM_SENDER_ID = '';
const MIXPANEL_TOKEN = '';

module.exports = {
  fontFamily: undefined,
  dev: IS_DEVELOPMENT,
  gcmSendId: GCM_SENDER_ID,
  mixpanelToken: MIXPANEL_TOKEN,
  serverURL: SERVER_URL,
  appID: APP_ID,
  version: 1.0,
  urlScheme: 'thegigsaloon://',
};
