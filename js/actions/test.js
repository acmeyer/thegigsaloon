//@flow
'use strict';

const Parse = require('parse/react-native');
const ActionSheetIOS = require('ActionSheetIOS');
const Platform = require('Platform');
const {version} = require('../env');

import type { Action, ThunkAction } from './types';

function testPlainPush(): ThunkAction {
  return () => Parse.Cloud.run('test_push');
}

function testLinkPush(): ThunkAction {
  return () => Parse.Cloud.run('test_push', {url: 'link'});
}

function testResetNuxes(): Action {
  return {
    type: 'RESET_NUXES',
  };
}

function testExportAppState(): ThunkAction {
  return (dispatch, getState) => {
    const subject = `App v${version} state`;
    const message = JSON.stringify(getState(), undefined, 2);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showShareActionSheetWithOptions({
        subject: subject,
        message: message,
      }, () => {}, () => {});
    } else {
      const SendIntentAndroid = require('react-native-send-intent');
      SendIntentAndroid.sendText({
        title: subject,
        text: message,
        type: SendIntentAndroid.TEXT_PLAIN
      });
    }
  };
}

const TEST_MENU = {
  'Request a push notification': testPlainPush,
  'Push with link': testLinkPush,
  'Reset NUXes': testResetNuxes,
  'Get app state': testExportAppState,
};

module.exports = {TEST_MENU};
