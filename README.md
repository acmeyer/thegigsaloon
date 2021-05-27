# The Gig Saloon

An app to find gigs, apply, review, and learn more about them.

[Original blog post](https://alexcmeyer.medium.com/announcing-the-gig-saloon-ecb197fdd326)

The app is no longer actively maintained or in the App Store so here's the open source code in case anyone else wants to use it in anyway.

## Features
* Login with Facebook or Email using one-time code
* Search for available gigs by location, role, requirements, and type.
* Apply to gigs directly from app with prefilled forms
* Review gigs
* Read articles on specific gigs
* Add comments to each gig

## How to Use

Install javascript libraries by running `yarn` in terminal.

### Set up the Database
The server uses a MongoDB for its database. You either need one running locally or using a service like [mLab](https://mlab.com). Once you have configured your MongoDB, either set an environment variable to the uri where the database is or add the uri to the variable DATABASE_URI found in `server/server.js`.

In order to start the app with something in it, you may want to pre-fill your database with gig data. There are two data dumps to help you get started. The first is the `Jobs.json` file which is a bunch of gigs data. The second is the `Locations.json` file which includes all the location data for each gig. This data is helpful for geolocation searches. Finally, you'll need the join table for these two classes in order to connect them. That data is in the `_Join:jobLocations:Jobs.json` file.

In order to import this data into your local or hosted database, follow this mongo import guide: https://docs.mongodb.com/manual/reference/program/mongoimport/.

### Set up the Server
All server related files can be found in the `server/` directory at the root of the app.

The server for the app is a [Parse Server](https://github.com/parse-community/parse-server) with the [Parse Dashboard](https://github.com/parse-community/parse-dashboard) for the dashboard UI.

To start the server, run `npm run start` in your terminal. If all goes well, your server will be running locally at `http://localhost:8080/parse`. You can view the dashboard by visiting `http://localhost:8080/dashboard` and entering `user` for username and `password` for password. 

If everything was set up correctly, you should see the main dashboard with The Gig Saloon app. Clicking on that should open up the app's dashboard view. If you imported any initial data from above, you should see that data in the dashboard.

The server is set up to use AWS S3 for images. In order to store images for you app correctly you'll need to have environment varaibles set for `AWS_ACCESS_KEY_ID`, `AWS_S3_BUCKET`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`. For more on how to set this up, see the Parse Server guide on it here: http://docs.parseplatform.org/parse-server/guide/#configuring-file-adapters.

The servers also uses AWS SES for sending emails. To see how to set up AWS SES with Parse Server, visit: https://github.com/parse-server-modules/parse-server-amazon-ses-adapter. 

The app is set up to use OneSignal for push notifications. To learn how to set up OneSignal with Parse Server, visit: https://github.com/parse-server-modules/parse-server-onesignal-push-adapter.

The server also has a few interesting background jobs that were run in the original app. This includes importing news articles (found in `server/articles.js`) and reddit posts (found in `server/posts.js`. In order to import articles you'll need to set up your own Google Alert feeds. You can also choose to update the different subreddits where posts are pulled from. You can run these jobs from the command line or using the dashboard.

The server can be easily hosted on Heroku. To find out more on how to do that, visit: https://github.com/parse-community/parse-server#running-parse-server-elsewhere.

### Set up the Mobile App

The mobile app was written using [React Native](https://facebook.github.io/react-native/). It it set up to work on both iOS and Android.

The app uses the following libraries:
* [Facebook SDK](https://developers.facebook.com/docs/react-native) (for login and importing user data)
* [Fabric](https://get.fabric.io) (for crash analytics)
* [Codepush](https://microsoft.github.io/code-push/) (for updating the app without needing an App Store update)
* [Mixpanel](https://mixpanel.com) (for in-app analytics)

You'll need to have an account for each library in order for the app to run successfully. Once you have an account, visit the following guides for setting up each with React Native:
* Facebook SDK: https://github.com/facebook/react-native-fbsdk
* Fabric: https://github.com/corymsmith/react-native-fabric
* Codepush: https://github.com/Microsoft/react-native-code-push
* Mixpanel: https://github.com/davodesign84/react-native-mixpanel

#### Set up iOS

In order to run the iOS app, you'll need to set a few things up. The first thing you'll need to set up is CocoaPods. To learn how to install and set up CocoaPods, visit: https://cocoapods.org.

Once CocoaPods is installed and set up correctly on your machine, in terminal run `cd ios && pod install`. This will install all the required libraries.

You will also need to turn on the following Capabilities within your app:
* Push Notifications
* Background Modes (remote notifications)
* Keychain Sharing

Finally, make sure to update the User-Defined variables in Build Settings in XCode with your own credentials you got from setting up the accounts above.

#### Set up Android

Similar to iOS, you'll need to add your own credentials for each of the above accounts. These credentials can be set in `android/app/build.gradle` under buildTypes. The Fabric credential set up can be found in `android/app/src/AndroidManifest.xml` at the bottom.

### Run the Mobile App

See the React Native docs for how to run the mobile app: https://facebook.github.io/react-native/docs/running-on-device.html.

## Libraries/Services Used
* Parse Server
* Parse Dashboard
* MongoDB
* Reddit API
* Google Alerts
* AWS S3
* AWS SES
* OneSignal
* React Native
* Facebook SDK
* Fabric
* Codepush
* Mixpanel
* CocoaPods

## License

Released under the MIT License. See [LICENSE](LICENSE) or http://opensource.org/licenses/MIT for more information.
