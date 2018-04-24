//@flow
'use strict';

const Parse = require('parse/react-native');
const FacebookSDK = require('../FacebookSDK');
import {
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
const {updateInstallation} = require('./installation');
const {loadUserLikes, loadUserPosts, loadUserGigsFollowing, loadUserComments, loadUserGigs} = require('./user');
const {loadUserReviews} = require('./reviews');

import type { Action, ThunkAction } from './types';

async function ParseFacebookLogin(scope): Promise {
  return new Promise((resolve, reject) => {
    Parse.FacebookUtils.logIn(scope, {
      success: resolve,
      error: (user, error) => reject(error && error.error || error),
    });
  });
}

async function queryFacebookAPI(path, ...args): Promise {
  return new Promise((resolve, reject) => {
    FacebookSDK.api(path, ...args, (response) => {
      if (response && !response.error) {
        resolve(response);
      } else {
        reject(response && response.error);
      }
    });
  });
}

async function _logInWithFacebook(source: ?string): Promise<Array<Action>> {
  await ParseFacebookLogin('public_profile,email,user_friends');
  const profile = await queryFacebookAPI('/me', {fields: 'name,email'});

  const user = await Parse.User.currentAsync();
  user.set('facebook_id', profile.id);
  if (user.get('name') === '' || user.get('name') === undefined) {
    user.set('name', profile.name);
  }
  if (user.get('email') === '' || user.get('email') === undefined) {
    user.set('email', profile.email);
  }
  await user.save();
  await updateInstallation({user});

  const action = {
    type: 'LOGGED_IN',
    method: 'facebook',
    source,
    data: {
      id: user.id,
      facebook_id: profile.id,
      profilePicture: user.get('profilePicture') && user.get('profilePicture').url(),
      name: user.get('name'),
      email: user.get('email'),
      phoneNumber: user.get('phoneNumber'),
      postalCode: user.get('postalCode'),
      city: user.get('city'),
      birthMonth: user.get('birthMonth'),
      birthDay: user.get('birthDay'),
      birthYear: user.get('birthYear'),
      createdAt: user.get('createdAt'),
      allowMyPostNotifications: user.get('allowMyPostNotifications'),
      allowMyCommentNotifications: user.get('allowMyCommentNotifications'),
      allowLikedPostNotifications: user.get('allowLikedPostNotifications'),
      allowCommentedPostNotifications: user.get('allowCommentedPostNotifications'),
      allowLikedReviewsNotifications: user.get('allowLikedReviewsNotifications'),
      allowLikedArticlesNotifications: user.get('allowLikedArticlesNotifications'),
    },
  };

  return Promise.all([
    Promise.resolve(action),
  ]);
}

function logInWithFacebook(source: ?string): ThunkAction {
  return (dispatch) => {
    const login = _logInWithFacebook(source);

    return login.then(
      (result) => {
        dispatch(result);
        dispatch(loadUserGigs());
        dispatch(loadUserGigsFollowing());
        dispatch(loadUserLikes());
        dispatch(loadUserPosts());
        dispatch(loadUserComments());
        dispatch(loadUserReviews());
      }
    );
  };
}

async function _logInWithEmail(email, code, source): Promise<Array<Action>> {
  const sessionToken = await Parse.Cloud.run('login_with_email', {email: email, code: code});
  const user = await Parse.User.become(sessionToken);

  await updateInstallation({user});

  const action = {
    type: 'LOGGED_IN',
    method: 'email',
    source,
    data: {
      id: user.id,
      facebook_id: user.get('facebook_id'),
      profilePicture: user.get('profilePicture') && user.get('profilePicture').url(),
      name: user.get('name'),
      email: user.get('email'),
      phoneNumber: user.get('phoneNumber'),
      postalCode: user.get('postalCode'),
      city: user.get('city'),
      birthMonth: user.get('birthMonth'),
      birthDay: user.get('birthDay'),
      birthYear: user.get('birthYear'),
      createdAt: user.get('createdAt'),
      allowMyPostNotifications: user.get('allowMyPostNotifications'),
      allowMyCommentNotifications: user.get('allowMyCommentNotifications'),
      allowLikedPostNotifications: user.get('allowLikedPostNotifications'),
      allowCommentedPostNotifications: user.get('allowCommentedPostNotifications'),
      allowLikedReviewsNotifications: user.get('allowLikedReviewsNotifications'),
      allowLikedArticlesNotifications: user.get('allowLikedArticlesNotifications'),
    },
  };

  return Promise.all([
    Promise.resolve(action),
  ]);
}

function logInWithEmail(email, code, source): ThunkAction {
  return (dispatch) => {
    const login = _logInWithEmail(email, code, source);

    return login.then(
      (result) => {
        dispatch(result);
        dispatch(loadUserGigs());
        dispatch(loadUserGigsFollowing());
        dispatch(loadUserLikes());
        dispatch(loadUserPosts());
        dispatch(loadUserComments());
      }
    );
  };
}

function skipLogin(): Action {
  return {
    type: 'SKIPPED_LOGIN',
  };
}

function skipUserInfoCollection(): Action {
  return {
    type: 'SKIPPED_USER_INFO_COLLECTION',
  };
}

function skipApplicationLogin(): Action {
  return {
    type: 'SKIPPED_APPLICATION_LOGIN',
  };
}

function logOut(): ThunkAction {
  return (dispatch) => {
    Parse.User.logOut();
    FacebookSDK.logout();
    updateInstallation({user: null, channels: []});

    // TODO: Make sure reducers clear their state
    return dispatch({
      type: 'LOGGED_OUT',
    });
  };
}

function logOutWithPrompt(): ThunkAction {
  return (dispatch, getState) => {
    let name = getState().user.name || 'there';

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: `Hi, ${name}`,
          options: ['Log out', 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            dispatch(logOut());
          }
        }
      );
    } else {
      Alert.alert(
        `Hi, ${name}`,
        'Log out from The Gig Saloon?',
        [
          { text: 'Cancel' },
          { text: 'Log out', onPress: () => dispatch(logOut()) },
        ]
      );
    }
  };
}

async function sendLoginCodeViaEmail(email) {
  await Parse.Cloud.run('send_login_code_via_email', {email: email});
  return {
    type: 'SENT_LOGIN_CODE_VIA_EMAIL',
    email: email,
  };
}

module.exports = {logInWithFacebook, skipLogin, skipUserInfoCollection, skipApplicationLogin, logOut, logOutWithPrompt, sendLoginCodeViaEmail, logInWithEmail};
