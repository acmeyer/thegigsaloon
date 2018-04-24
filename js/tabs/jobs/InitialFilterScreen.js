//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
} from 'react-native';
import {Heading2, HelpText} from '../../common/AppText';

class InitialFilterScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.inner}>
          <Heading2 style={styles.text}>
            In this part of the app you can find all the gigs you might be interested in.
            {'\n'}{'\n'}
            Let's walk through setting up some filters to get you started.
          </Heading2>
        </View>
        <HelpText style={styles.helpText}>
          *You can always filter gigs in the top right corner of this page.
        </HelpText>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    marginBottom: 10,
    textAlign: 'center',
  },
  helpText: {
    alignSelf: 'stretch',
    paddingHorizontal: 10,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'left',
  },
});

module.exports = InitialFilterScreen;
