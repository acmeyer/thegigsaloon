//@flow
'use strict';

import React, {
  TouchableHighlight,
  TouchableNativeFeedback,
  Platform,
} from 'react-native';

function AppTouchableIOS(props: Object): ReactElement {
  return (
    <TouchableHighlight
      accessibilityTraits="button"
      underlayColor="#3C5EAE"
      {...props}
    />
  );
}

const AppTouchable = Platform.OS === 'android'
  ? TouchableNativeFeedback
  : AppTouchableIOS;

module.exports = AppTouchable;
