// @flow
'use strict';

import GSApp from './GSApp';
import FacebookSDK from './FacebookSDK';
import Parse from 'parse/react-native';
import React, { Component } from 'react';
import Mixpanel from 'react-native-mixpanel';

import { Provider } from 'react-redux';
import configureStore from './store/configureStore';

import { serverURL, appID, mixpanelToken } from './env';

function setup(): Component {
  console.disableYellowBox = true;
  Parse.initialize(appID);
  Parse.serverURL = serverURL;

  FacebookSDK.init();
  Parse.FacebookUtils.init();
  Mixpanel.sharedInstanceWithToken(mixpanelToken);

  class Root extends Component {
    constructor() {
      super();
      this.state = {
        isLoading: true,
        store: configureStore(() => this.setState({isLoading: false})),
      };
    }

    render() {
      if (this.state.isLoading) {
        return null;
      }

      return (
        <Provider store={this.state.store}>
          <GSApp />
        </Provider>
      );
    }
  }

  return Root;
}

module.exports = setup;
