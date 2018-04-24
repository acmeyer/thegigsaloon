//@flow
'use strict';

const Parse = require('parse/react-native');
const logError = require('logError');

function loadConfig() {
  return (dispatch) => {
    Parse.Config.get().then(
      (config) => {
        dispatch({
          type: 'LOADED_CONFIGS',
          config
        });
      },
      (error) => logError
    );
  };
}

module.exports = {loadConfig};
