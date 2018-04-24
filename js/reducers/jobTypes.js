//@flow
'use strict';

type State = Array<string>;
type Action = { type: string; list: Array<any>; };

function jobTypes(state: State = [], action: Action): State {
  if (action.type === 'LOADED_FILTERS') {
    return action.filters.jobTypes;
  }
  return state;
}

module.exports = jobTypes;
