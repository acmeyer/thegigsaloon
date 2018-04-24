//@flow
'use strict';

const Parse = require('parse/react-native');
import {
  InteractionManager,
} from 'react-native';

import type { PromiseAction, Action } from './types';

async function loadFilters(): PromiseAction {
  const filters = await Parse.Cloud.run('load_filters');
  await InteractionManager.runAfterInteractions();
  return {
    type: 'LOADED_FILTERS',
    filters,
  };
}

function applyFilters(filters): Action {
  return {
    type: 'APPLY_JOBS_FILTER',
    filters,
  };
}

function clearFilter(): Action {
  return {
    type: 'CLEAR_FILTER',
  };
}

module.exports = {applyFilters, clearFilter, loadFilters};
