//@flow
'use strict';

type State = Array<string>;
type Action = { type: string; list: Array<any>; };

function requirements(state: State = [], action: Action): State {
  if (action.type === 'LOADED_FILTERS') {
    return action.filters.requirements;
  }
  return state;
}

module.exports = requirements;
