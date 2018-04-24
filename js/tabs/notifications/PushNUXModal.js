//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
} from 'react-native';
import AppButton from '../../common/AppButton';
import {Heading1, Paragraph} from '../../common/AppText';

class PushNUXModal extends Component {
  props: {
    style: any;
    onTurnOnNotifications: () => void;
    onSkipNotifications: () => void;
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.content}>
            <Heading1>
              Don't miss out!
            </Heading1>
            <Paragraph style={styles.text}>
              Turn on push notifications to stay up to date with everything that's happening in the gig economy. You will always be able to see in-app updates in this tab.
            </Paragraph>
            <AppButton
              style={styles.button}
              type="primary"
              caption="Turn on push notifications"
              onPress={this.props.onTurnOnNotifications}
            />
            <AppButton
              style={styles.button}
              type="secondary"
              caption="No thanks"
              onPress={this.props.onSkipNotifications}
            />
          </View>
        </View>
      </View>
    );
  }
}


var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 49,
    backgroundColor: 'rgba(0, 0, 0, 0.66)',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  inner: {
    overflow: 'hidden',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  image: {
    alignSelf: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    marginVertical: 20,
  },
  page: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: undefined,
    paddingBottom: 0,
  },
  button: {
    marginTop: 10,
    alignSelf: 'stretch',
  },
});

module.exports = PushNUXModal;
