//@flow
'use strict';

const {Crashlytics} = require('react-native-fabric');
import {Platform} from 'react-native';
const Mixpanel = require('react-native-mixpanel');

import type {Action} from '../actions/types';

function track(action: Action): void {
  switch (action.type) {
    case 'SENT_LOGIN_CODE_VIA_EMAIL':
      Mixpanel.trackWithProperties('Sent login code via email', {email: action.email});
      Mixpanel.timeEvent('Logged in');
      break;

    case 'LOGGED_IN':
      Mixpanel.createAlias(action.data.id);
      Mixpanel.identify(action.data.id);
      Mixpanel.set({
        '$email': action.data.email,
        '$phone': action.data.phoneNumber,
        '$name': action.data.name,
        'Created': action.data.createdAt,
        'Facebook Id': action.data.facebook_id,
        'Postal Code': action.data.postalCode,
        'Home City': action.data.city,
        'Birth Month': action.data.birthMonth,
        'Birth Day': action.data.birthDay,
        'Birth Year': action.data.birthYear,
      });
      Mixpanel.trackWithProperties('Logged in', {source: action.source, method: action.method});
      break;

    case 'LOGGED_OUT':
      Mixpanel.track('Logout');
      // Mixpanel.reset();
      break;

    case 'USER_PROFILE_SAVED':
      Mixpanel.track('Updated profile');
      Mixpanel.set({
        '$email': action.data.email,
        '$phone': action.data.phoneNumber,
        '$name': action.data.name,
        'Postal Code': action.data.postalCode,
        'Home City': action.data.city,
        'Birth Month': action.data.birthMonth,
        'Birth Day': action.data.birthDay,
        'Birth Year': action.data.birthYear,
      });
      break;

    case 'SKIPPED_LOGIN':
      Mixpanel.track('Skipped login');
      break;

    case 'POST_ADDED':
      Mixpanel.trackWithProperties('Post created', {post_id: action.post.id});
      break;

    case 'COMMENT_ADDED':
      Mixpanel.trackWithProperties('Comment created', {comment_id: action.comment.id});
      break;

    case 'POST_LIKED':
      Mixpanel.trackWithProperties('Post liked', {post_id: action.post.id});
      break;

    case 'COMMENT_LIKED':
      Mixpanel.trackWithProperties('Comment liked', {comment_id: action.comment.id});
      break;

    case 'POST_UNLIKED':
      Mixpanel.trackWithProperties('Post unliked', {post_id: action.post.id});
      break;

    case 'ARTICLE_LIKED':
      Mixpanel.trackWithProperties('Article liked', {article_id: action.article.id});
      break;

    case 'ARTICLE_UNLIKED':
      Mixpanel.trackWithProperties('Article unliked', {article_id: action.article.id});
      break;

    case 'REVIEW_LIKED':
      Mixpanel.trackWithProperties('Review liked', {review_id: action.review.id});
      break;

    case 'REVIEW_UNLIKED':
      Mixpanel.trackWithProperties('Review unliked', {review_id: action.review.id});
      break;

    case 'COMMENT_UNLIKED':
      Mixpanel.trackWithProperties('Comment unliked', {comment_id: action.comment.id});
      break;

    case 'SWITCH_TAB':
      Mixpanel.trackWithProperties('View Tab', {tab: action.tab});
      break;

    case 'SWITCH_LIST':
      Mixpanel.trackWithProperties('Switch Post List', {list: action.list});
      break;

    case 'SWITCH_GIGS_LIST':
      Mixpanel.trackWithProperties('Switch Gigs List', {list: action.list});
      break;

    case 'SWITCH_JOB_LIST':
      Mixpanel.trackWithProperties('Switch Job List', {list: action.list});
      break;

    case 'SWITCH_FILTER_SCREEN':
      Mixpanel.trackWithProperties('Switch filter walkthrough screen', {screen: action.screen});
      break;

    case 'SKIPPED_GIG_FILTER':
      Mixpanel.track('Skipped gig filter walkthrough');
      break;

    case 'FINISHED_GIG_FILTER':
      Mixpanel.track('Completed gig filter walkthrough');
      break;

    case 'TOGGLED_NOTIFICATION_SETTING':
      Mixpanel.trackWithProperties('Toggled Notification Setting', {notification: action.data.notification, value: action.data.value});
      break;

    case 'TURNED_ON_PUSH_NOTIFICATIONS':
      Mixpanel.track('Enabled Push Notifications');
      break;

    case 'SKIPPED_PUSH_NOTIFICATIONS':
      Mixpanel.track('Disabled Push Notifications');
      break;

    case 'SHOW_POST':
      Mixpanel.trackWithProperties('Viewed post', {post_id: action.postId});
      break;

    case 'SHOW_JOB':
      Mixpanel.trackWithProperties('Viewed job', {job_id: action.jobId});
      break;

    case 'REVIEW_SAVED':
      Mixpanel.trackWithProperties('Created review', {job_id: action.data.jobId});
      break;

    case 'MARK_USER_HAS_JOB':
      Mixpanel.trackWithProperties('Marked having gig', {job_id: action.jobId});
      break;

    case 'FOLLOWED_GIG':
      Mixpanel.trackWithProperties('Followed gig', {job_id: action.jobId});
      break;

    case 'UNFOLLOWED_GIG':
      Mixpanel.trackWithProperties('Unfollowed gig', {job_id: action.jobId});
      break;

    case 'LOADING_JOBS_TIMEOUT':
      if (Platform.OS === 'ios') {
        Crashlytics.recordError('Loading jobs timed out.');
      } else {
        Crashlytics.logException('Loading jobs timed out.');
      }
      break;

    case 'APPLY_JOBS_FILTER':
      Mixpanel.trackWithProperties('Applied Jobs Filter', {location: action.filters.location, jobTypes: Object.keys(action.filters.jobTypes).join(','), requirements: Object.keys(action.filters.requirements).join(','), roles: Object.keys(action.filters.roles).join(',')});
      break;

    case 'REVIEW_PROMPT_SHOWN':
      Mixpanel.track('App review prompt shown');
      break;

    case 'REVIEW_PROMPT_DELAYED':
      Mixpanel.track('App review prompt delayed');
      break;

    case 'REVIEW_PROMPT_DECLINED':
      Mixpanel.track('App review prompt declined');
      break;

    case 'REVIEW_PROMPT_ACCEPTED':
      Mixpanel.track('App review prompt accepted');
      break;
  }
}

module.exports = track;
