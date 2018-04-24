'use strict';
/* global Parse */

const secretToken = process.env.SECRET_TOKEN || 'super-secret-token';
import {sendCodeEmail} from './emails';

Parse.Cloud.define('send_login_code_via_email', function(request, response) {
  Parse.Cloud.useMasterKey();

  var email = request.params.email;

  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('email', email);
  userQuery.first().then((result) => {

    var min = 100000; var max = 999999;
    var loginCode = Math.floor(Math.random() * (max - min + 1)) + min;
    var expiresAt = Date.now() + 15 * 60000;
    var secretPass = secretToken + loginCode;

    if (result) {
      result.setPassword(secretPass);
      result.set('loginExpiration', expiresAt);
      result.save().then(() => {
        return sendCodeEmail(email, loginCode);
      }).then(() => {
        response.success({});
      }).catch((err) => {
        response.error(err);
      });
    } else {
      var user = new Parse.User();
      user.setUsername(email);
      user.setPassword(secretPass);
      user.set('email', email);
      user.set('loginExpiration', expiresAt);
      user.save().then((a) => {
        return sendCodeEmail(email, loginCode);
      }).then(() => {
        response.success({});
      }).catch((err) => {
        response.error(err);
      });
    }

  }).catch((error) => response.error(error));
});

Parse.Cloud.define('login_with_email', function(request, response) {
  Parse.Cloud.useMasterKey();

  var email = request.params.email;

  if (email && request.params.code) {
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('email', email);
    userQuery.first().then((result) => {
      if (result) {
        if (Date.now() > result.get('loginExpiration')) {
          response.error('Login code has expired. Resend code to login.');
        } else {
          // may have signed up w/ another method first so just
          // use whatever username is on this account
          Parse.User.logIn(result.get('username'), secretToken + request.params.code).then((user) => {
            response.success(user.getSessionToken());
          }).catch((e) => response.error('Invalid code. Please try again.'));
        }
      } else {
        response.error('Could not find user. Please contact support@example.com if you are seeing this.');
      }

    }).catch((e) => response.error(e.message));
  } else {
    response.error('Please enter a code');
  }
});
