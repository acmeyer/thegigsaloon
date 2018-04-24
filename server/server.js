import path from 'path';
import express from 'express';
import Parse from 'parse/node';
import {ParseServer, S3Adapter} from 'parse-server';
import ParseDashboard from 'parse-dashboard';
import cluster from 'cluster';
const request = require('request');

import OneSignalPushAdapter from 'parse-server-onesignal-push-adapter-scheduled-push-version';
const oneSignalPushAdapter = new OneSignalPushAdapter({
  oneSignalAppId: process.env.ONE_SIGNAL_APP_ID || '',
  oneSignalApiKey: process.env.ONE_SIGNAL_API_KEY || ''
});

const SERVER_PORT = process.env.PORT || 8080;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080/parse';
const WORKERS = process.env.WEB_CONCURRENCY || 1;
const APP_ID = process.env.APP_ID || 'gig-saloon';
const MASTER_KEY = process.env.MASTER_KEY || '';
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/dev';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const DASHBOARD_AUTH = process.env.DASHBOARD_AUTH || 'user:password';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || '';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

Parse.initialize(APP_ID);
Parse.serverURL = SERVER_URL;
Parse.masterKey = MASTER_KEY;
Parse.Cloud.useMasterKey();

if (cluster.isMaster) {
  for (var i = 0; i < WORKERS; i += 1) {
    cluster.fork();
  }
} else {
  const server = express();

  server.use(
    '/parse',
    new ParseServer({
      databaseURI: DATABASE_URI,
      cloud: path.resolve(__dirname, 'cloud.js'),
      appId: APP_ID,
      masterKey: MASTER_KEY,
      serverURL: SERVER_URL,
      filesAdapter: new S3Adapter(
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
        AWS_S3_BUCKET,
        {
          directAccess: true,
          region: AWS_REGION
        }
      ),
      push: {
        adapter: oneSignalPushAdapter
      }
    })
  );

  let users;
  if (DASHBOARD_AUTH) {
    var [user, pass] = DASHBOARD_AUTH.split(':');
    users = [{user, pass}];
  }

  // Must trust server ssl config
  var allowInsecureHTTP = process.env.ALLOW_INSECURE_HTTP || false;

  server.use(
    '/dashboard',
    new ParseDashboard({
      apps: [{
        serverURL: SERVER_URL,
        appId: APP_ID,
        masterKey: MASTER_KEY,
        production: !IS_DEVELOPMENT,
        appName: 'The Gig Saloon',
      }],
      users,
    }, allowInsecureHTTP)
  );

  // For background jobs only expose if in a worker env,
  // so no one should ever be able to access these
  if (process.env.WORKER_ENVIRONMENT === 'true') {
    server.post('/background/import_news', (req, res) => {
      const options = {
        url: SERVER_URL + '/jobs/import_news',
        method: 'POST',
        headers: {
          'X-Parse-Application-Id': APP_ID,
          'X-Parse-Master-Key': MASTER_KEY
        }
      };
      request(options);
      res.send('Ok');
    });

    server.post('/background/import_posts', (req, res) => {
      const options = {
        url: SERVER_URL + '/jobs/import_posts',
        method: 'POST',
        headers: {
          'X-Parse-Application-Id': APP_ID,
          'X-Parse-Master-Key': MASTER_KEY
        }
      };
      request(options);
      res.send('Ok');
    });

    server.post('/background/tag_posts', (req, res) => {
      const options = {
        url: SERVER_URL + '/jobs/tag_posts',
        method: 'POST',
        headers: {
          'X-Parse-Application-Id': APP_ID,
          'X-Parse-Master-Key': MASTER_KEY
        }
      };
      request(options);
      res.send('Ok');
    });

    server.post('/background/tag_articles', (req, res) => {
      const options = {
        url: SERVER_URL + '/jobs/tag_articles',
        method: 'POST',
        headers: {
          'X-Parse-Application-Id': APP_ID,
          'X-Parse-Master-Key': MASTER_KEY
        }
      };
      request(options);
      res.send('Ok');
    });

    server.post('/background/send_daily_notifications', (req, res) => {
      const options = {
        url: SERVER_URL + '/jobs/send_daily_notifications',
        method: 'POST',
        headers: {
          'X-Parse-Application-Id': APP_ID,
          'X-Parse-Master-Key': MASTER_KEY
        }
      };
      request(options);
      res.send('Ok');
    });
  }

  server.listen(SERVER_PORT, () => console.log(
    `Server is now running in ${process.env.NODE_ENV || 'development'} mode on ${SERVER_URL}`
  ));
}
