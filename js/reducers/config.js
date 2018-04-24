// @flow
'use strict';

function config(state = {}, action) {
  if (action.type === 'LOADED_CONFIGS') {
    return fromParseConfig(action.config);
  }
  return state;
}

function fromParseConfig(c) {
  return {
    configVariable: c.get('configVariable'),
  };
}

module.exports = config;
