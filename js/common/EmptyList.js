// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import AppColors from './AppColors';

class EmptyList extends Component {
  render() {
    const image = this.props.image &&
      <Image style={styles.image} source={this.props.image} />;
    const title = this.props.title &&
      <Text style={styles.title}>{this.props.title}</Text>;

    return (
      <View style={[styles.container, this.props.style]}>
        {image}
        {title}
        <Text style={styles.text}>
          {this.props.text}
        </Text>
        {this.props.children}
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.tableViewBackground,
    padding: 30,
    paddingTop: 55,
    paddingBottom: 0,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: 'black',
    fontSize: 20,
  },
  image: {
    marginBottom: 10,
  },
  text: {
    textAlign: 'center',
    color: 'black',
    marginBottom: 30,
  },
});

module.exports = EmptyList;
