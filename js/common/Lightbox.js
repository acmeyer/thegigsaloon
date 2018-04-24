// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

class Lightbox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageLoading: false
    };
  }

  componentWillMount() {
    StatusBar.setHidden(true, 'fade');
  }

  componentWillUnmount() {
    StatusBar.setHidden(false, 'fade');
  }

  render() {
    let spinner;
    if (this.state.imageLoading) {
      spinner = (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={this.props.photoSource}
          resizeMode="contain"
          onLoadStart={(e) => this.setState({imageLoading: true})}
          onLoad={(e) => this.setState({imageLoading: false})}
        />
        {spinner}
        <View style={styles.header} />
        <TouchableOpacity
          accessibilityLabel="Skip login"
          accessibilityTraits="button"
          style={styles.close}
          onPress={() => this.close()}>
          <Image
            source={require('./img/white-x.png')}
          />
        </TouchableOpacity>
      </View>
    );
  }

  close() {
    const {navigator} = this.props;
    if (navigator) {
      requestAnimationFrame(() => navigator.pop());
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'stretch',
  },
  header: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    height: 45,
    backgroundColor: 'black',
    opacity: 0.3,
  },
  close: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 15,
  },
  image: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

module.exports = Lightbox;
