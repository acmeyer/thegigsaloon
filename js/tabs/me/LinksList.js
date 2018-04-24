//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Image,
  Linking,
  Platform,
} from 'react-native';
import ItemsWithSeparator from '../../common/ItemsWithSeparator';
var Mailer = require('NativeModules').RNMail;
const { Crashlytics } = require('react-native-fabric');
import Mixpanel from 'react-native-mixpanel';

class LinksList extends Component {
  render() {
    let content = this.props.links.map(
      (link) => <Row navigator={this.props.navigator} link={link} key={link.title} />
    );
    return (
      <ItemsWithSeparator separatorStyle={styles.separator}>
        {content}
      </ItemsWithSeparator>
    );
  }
}

class Row extends Component {
  props: {
    link: {
      logo: ?string;
      title: string;
      url?: string;
      onPress?: () => void;
    };
  };

  render() {
    var {title} = this.props.link;
    return (
      <TouchableHighlight onPress={this.handlePress.bind(this)}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Image source={require('../../common/img/disclosure.png')} />
        </View>
      </TouchableHighlight>
    );
  }

  launchFeedback() {
    Mailer.mail({
      subject: 'Feedback for The Gig Saloon App',
      recipients: ['support@thegigsaloon.com'],
      body: '',
    }, (error, event) => {
        if (error) {
          if (Platform.OS === 'ios') {
            Crashlytics.recordError('Failed to send feedback email. Error: ' + error.message);
          } else {
            Crashlytics.logException('Failed to send feedback email. Error: ' + error.message);
          }
          alert('Could not send mail. Please send an email to support@thegigsaloon.com');
        }
    });
  }

  handlePress() {
    Mixpanel.trackWithProperties('Tapped on info link', {link: this.props.link.title});
    var {url, openMail, credits} = this.props.link;
    if (openMail) {
      this.launchFeedback();
    }
    if (credits) {
      this.props.navigator.push({credits: true});
    }
    if (url) {
      Linking.openURL(url);
    }
  }
}

var styles = StyleSheet.create({
  separator: {
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 17,
    flex: 1,
  },
});

module.exports = LinksList;
