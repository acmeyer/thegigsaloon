//@flow
'use strict';

import React, {Component} from 'React';
import {
  Animated,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';

class IntroScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anim: new Animated.Value(0),
    };
  }

  componentDidMount() {
    Animated.timing(this.state.anim, {toValue: 3000, duration: 3000}).start();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Animated.Image
            style={[this.fadeIn(0), styles.logo]}
            source={require('./img/logo.png')}
          />
        </View>
        <View style={styles.section}>
          <Animated.Text style={[styles.h1, this.fadeIn(700, -20)]}>
            Welcome to
          </Animated.Text>
          <Animated.Text style={[styles.h1, styles.h1bottom, this.fadeIn(700, 20)]}>
            The Gig Saloon
          </Animated.Text>
          <Animated.Text style={[styles.h2, this.fadeIn(1500, 10)]}>
            Find new gigs. Stay up to date. Share your experience.
          </Animated.Text>
        </View>
        <View style={styles.section} />
      </View>
    );
  }

  fadeIn(delay, from = 0) {
    const {anim} = this.state;
    return {
      opacity: anim.interpolate({
        inputRange: [delay, Math.min(delay + 500, 3000)],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      transform: [{
        translateY: anim.interpolate({
          inputRange: [delay, Math.min(delay + 500, 3000)],
          outputRange: [from, 0],
          extrapolate: 'clamp',
        }),
      }],
    };
  }
}

const scale = Dimensions.get('window').width / 375;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 25,
  },
  h1: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: Math.round(40 * scale),
    backgroundColor: 'transparent',
    color: 'white',
  },
  h1bottom: {
    marginBottom: 25,
  },
  h2: {
    textAlign: 'center',
    fontSize: Math.round(22 * scale),
    color: 'white',
    // fontWeight: 'bold',
  },
  h3: {
    textAlign: 'center',
    fontSize: Math.round(18 * scale),
    color: 'white',
    marginBottom: 25,
  },
});

module.exports = IntroScreen;
