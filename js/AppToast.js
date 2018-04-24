//@flow
'use strict';

import {Component} from 'React';
import {
  Platform,
  ToastAndroid,
} from 'react-native';
import Toast from 'react-native-root-toast';
import { hideToastMessage } from './actions';
import { connect } from 'react-redux';

class AppToast extends Component {

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.show) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(nextProps.message, this.getToastDuration(nextProps.duration));
      } else {
        Toast.show(nextProps.message, {duration: this.getToastDuration(nextProps.duration), position: this.getToastPosition(nextProps.position)});
      }
      this.props.dispatch(hideToastMessage());
    }
  }

  getToastPosition(position) {
    switch (position) {
      case 'top':
        return Platform.OS === 'android' ? ToastAndroid.TOP : Toast.positions.TOP;
      case 'center':
        return Platform.OS === 'android' ? ToastAndroid.CENTER : Toast.positions.CENTER;
      case 'bottom':
        return Platform.OS === 'android' ? ToastAndroid.BOTTOM : Toast.positions.BOTTOM;
    }
  }

  getToastDuration(duration) {
    switch (duration) {
      case 'short':
        return Platform.OS === 'android' ? ToastAndroid.SHORT : Toast.durations.SHORT;
      case 'long':
        return Platform.OS === 'android' ? ToastAndroid.LONG : Toast.durations.LONG;
    }
  }

  render() {
    return null;
  }
}

function select(store) {
  return {
    message: store.toast.message,
    show: store.toast.show,
    position: store.toast.position,
    duration: store.toast.duration,
  };
}

module.exports = connect(select)(AppToast);
