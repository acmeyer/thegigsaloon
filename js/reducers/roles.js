//@flow
'use strict';

type State = Array<string>;
type Action = { type: string; list: Array<any>; };

function roles(state: State = [], action: Action): State {
  if (action.type === 'LOADED_FILTERS') {
    return action.filters.roles;
  }
  return state;
}

module.exports = roles;
