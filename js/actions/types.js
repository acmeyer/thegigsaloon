// @flow
'use strict';

type ParseObject = Object;

export type Action =
  { type: 'LOADED_NOTIFICATIONS', list: Array<ParseObject> }
  | { type: 'LOADED_JOBS', list: Array<ParseObject> }
  | { type: 'LOADED_ARTICLES', list: Array<ParseObject> }
  | { type: 'LOADED_POSTS', list: Array<ParseObject> }
  | { type: 'LOADED_POSTS_COMMENTS', list: Array<ParseObject> }
  | { type: 'LOGGED_IN', source: ?string; data: { id: string; name: string; likedPosts: Array<String>; likedComments: Array<String> } }
  | { type: 'SKIPPED_LOGIN' }
  | { type: 'LOGGED_OUT' }
  | { type: 'APPLY_JOBS_FILTER', filters: {jobTypes: {}, location: null, requirements: {}, roles: {}}}
  | { type: 'POST_ADDED', post: Object }
  | { type: 'COMMENT_ADDED', comment: Object }
  | { type: 'LOADED_USER_POST_LIKES', data: Object }
  | { type: 'LOADED_USER_COMMENT_LIKES', data: Object }
  | { type: 'POST_LIKED', post: Object }
  | { type: 'COMMENT_LIKED', comment: Object }
  | { type: 'POST_UNLIKED', post: Object }
  | { type: 'COMMENT_UNLIKED', comment: Object }
  | { type: 'LOADED_USER_POSTS', list: Array<ParseObject> }
  | { type: 'LOADED_USER_COMMENTS', list: Array<ParseObject> }
  | { type: 'CLEAR_FILTER' }
  | { type: 'SWITCH_LIST', list: 'newest' | 'mostPopular' }
  | { type: 'SWITCH_TAB', tab: 'jobs' | 'notifications' | 'me' }
  | { type: 'TOGGLED_NOTIFICATION_SETTING', data: Object }
  | { type: 'TURNED_ON_PUSH_NOTIFICATIONS' }
  | { type: 'REGISTERED_PUSH_NOTIFICATIONS' }
  | { type: 'SKIPPED_PUSH_NOTIFICATIONS' }
  | { type: 'RECEIVED_PUSH_NOTIFICATION', notification: Object }
  | { type: 'SEEN_ALL_NOTIFICATIONS' }
  | { type: 'RESET_NUXES' }
  ;

export type Dispatch = (action: Action | ThunkAction | PromiseAction | Array<Action>) => any;
export type GetState = () => Object;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type PromiseAction = Promise<Action>;
