//@flow
'use strict';

function showToastMessage(message, duration, position) {
  return (dispatch) => {
    dispatch({
      type: 'SHOW_TOAST_MESSAGE',
      data: {
        message,
        duration,
        position
      }
    });
  };
}

function hideToastMessage() {
  return (dispatch) => {
    dispatch({
      type: 'HIDE_TOAST_MESSAGE'
    });
  };
}

module.exports = {showToastMessage, hideToastMessage};
