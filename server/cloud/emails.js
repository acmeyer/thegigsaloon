'use strict';
/* global Parse */

import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';
const ses = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'us-east-1'
});

function loginEmailTemplate(loginCode) {
  var template = fs.readFileSync(path.resolve(__dirname, 'emailTemplates/login_code.html'), 'utf8');
  var regex = new RegExp('#{login_code}', 'g');
  template = template.replace(regex, loginCode);
  return template;
}

function welcomeEmailTemplate(name) {
  var template = fs.readFileSync(path.resolve(__dirname, 'emailTemplates/welcome.html'), 'utf8');
  var regex = new RegExp('#{first_name}', 'g');
  template = template.replace(regex, name);
  return template;
}

function sendWelcomeEmail(user) {
  let email = user.get('email');
  let name = user.get('name');
  let first_name = name ? name.split(' ')[0] : 'there';

  var params = {
    Source: 'Your name <youremail@example.com>',
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: 'Thanks for checking out The Gig Saloon!'
      },
      Body: {
        Html: {
          Data: welcomeEmailTemplate(first_name)
        },
        Text: {
          Data: `
            Hi ${first_name},\n\n
            Welcome!`
        }
      }
    }
  };

  var promise = new Parse.Promise();
  ses.sendEmail(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      return promise.reject(err.message);
    } else {
      return promise.resolve();
    }
  });
}

function sendCodeEmail(email, code) {
  var params = {
    Source: 'Your Name <youremail@example.com>',
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: 'The Gig Saloon Login Code (' + code + ')'
      },
      Body: {
        Html: {
          Data: loginEmailTemplate(code)
        },
        Text: {
          Data: 'Here is your login code: ' + code
        }
      }
    }
  };

  var promise = new Parse.Promise();
  ses.sendEmail(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      return promise.reject(err.message);
    } else {
      return promise.resolve();
    }
  });
}

module.exports = {sendCodeEmail, sendWelcomeEmail};
