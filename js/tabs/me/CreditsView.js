// @flow
'use strict';

import React, {Component} from 'React';
import {
  View,
  StyleSheet,
  Text,
  TouchableHighlight,
  Linking,
  Image,
} from 'react-native';
import AppHeader from '../../common/AppHeader';
import ItemsWithSeparator from '../../common/ItemsWithSeparator';
import Mixpanel from 'react-native-mixpanel';

const CREDIT_LINKS = [{
  title: 'Icons8',
  url: 'https://icons8.com/',
}, {
  title: 'Facebook React Native',
  url: 'https://facebook.github.io/react-native/'
}, {
  title: 'Google Geolocation API',
  url: 'https://developers.google.com/maps/documentation/geolocation/intro'
}, {
  title: 'Reddit API',
  url: 'https://www.reddit.com/dev/api/'
}];

class CreditsView extends Component {
  constructor(props) {
    super(props);

    this.close = this.close.bind(this);
  }

  render() {
    let leftItem;
    if (this.props.navigator) {
      leftItem = {
        title: 'Back',
        icon: require('../../common/img/back.png'),
        layout: 'icon',
        onPress: this.close,
      };
    }
    let content = CREDIT_LINKS.map(
      (link) => <Row navigator={this.props.navigator} link={link} key={link.title} />
    );
    return (
      <View style={styles.container}>
        <AppHeader
          title="Credits"
          leftItem={leftItem}
        />
        <View style={styles.listContainer}>
          <ItemsWithSeparator separatorStyle={styles.separator}>
            {content}
          </ItemsWithSeparator>
        </View>
      </View>
    );
  }

  close() {
    if (this.props.navigator) {
      this.props.navigator.pop();
    }
  }
}

class Row extends Component {
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

  handlePress() {
    Mixpanel.trackWithProperties('Tapped on credit link', {link: this.props.link.title});
    var {url} = this.props.link;
    if (url) {
      Linking.openURL(url);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
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


module.exports = CreditsView;
