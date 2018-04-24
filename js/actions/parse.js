// @flow
'use strict';

const Parse = require('parse/react-native');
const logError = require('logError');
const InteractionManager = require('InteractionManager');

import type { ThunkAction } from './types';

const Notification = Parse.Object.extend('Notification');
const DiscussTopic = Parse.Object.extend('DiscussTopic');

function loadParseQuery(type: string, query: Parse.Query): ThunkAction {
  return (dispatch) => {
    return query.find({
      success: (list) => {
        // We don't want data loading to interfere with smooth animations
        InteractionManager.runAfterInteractions(() => {
          // Flow can't guarantee {type, list} is a valid action
          dispatch(({type, list}: any));
        });
      },
      error: logError,
    });
  };
}

module.exports = {
  loadNotifications: (): ThunkAction =>
    loadParseQuery('LOADED_NOTIFICATIONS', new Parse.Query(Notification)),
  loadDiscussTopics: (): ThunkAction =>
    loadParseQuery('LOADED_DISCUSS_TOPICS', new Parse.Query(DiscussTopic).equalTo('showOnHomePage', true).ascending('order')),
};
