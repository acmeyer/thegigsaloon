//@flow
'use strict';

const initialState = {
  show: false,
  message: null,
  position: 'bottom',
  duration: 'short',
};

function toast(state = initialState, action) {
  if (action.type === 'SHOW_TOAST_MESSAGE') {
    let {message, position, duration} = action.data;
    return {
      show: true,
      message,
      position,
      duration,
    };
  }
  if (action.type === 'HIDE_TOAST_MESSAGE') {
    return initialState;
  }
  return state;
}

module.exports = toast;
