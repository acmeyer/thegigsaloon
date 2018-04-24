//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Image,
} from 'react-native';
import moment from 'moment';
import {urlScheme} from '../../env';
import AppColors from '../../common/AppColors';

import { connect } from 'react-redux';

class NotificationCell extends Component {
  deeplink(url) {
    var slug = url.indexOf(urlScheme);
    if (slug !== -1) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    var disclosure, title;
    if (this.props.notification.url) {
      disclosure = (
        <View style={styles.disclosure}>
          <Image source={require('../../common/img/disclosure.png')} />
        </View>
      );
    }
    if (this.props.notification.title) {
      title = (
        <Text style={styles.title}>
          {this.props.notification.title}
        </Text>
      );
    }
    return (
      <TouchableHighlight onPress={this.props.onPress}>
        <View style={[styles.cell, !this.props.isSeen && styles.unseen]}>
          <View style={styles.content}>
            {title}
            <Text style={styles.text}>
              {this.props.notification.text}
            </Text>
            <View style={styles.footer}>
              <Text style={styles.time}>
                {moment(this.props.notification.time).fromNow()}
              </Text>
            </View>
          </View>
          {disclosure}
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  cell: {
    padding: 15,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  unseen: {
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4D99EF',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
  },
  url: {
    flex: 1,
    color: AppColors.actionText,
    fontSize: 12,
    marginBottom: 10,
  },
  time: {
    color: AppColors.inactiveText,
    fontSize: 12,
  },
});

function select(store, props) {
  return {
    isSeen: store.notifications.seen[props.notification.id],
  };
}

module.exports = connect(select)(NotificationCell);
