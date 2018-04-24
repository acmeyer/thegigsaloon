//@flow
'use strict';

import React, {Component} from 'React';
import AppColors from '../common/AppColors';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import {createStylesheet} from '../common/AppStyleSheet';
const Mixpanel = require('react-native-mixpanel');

class FilterSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false,
      anim: new Animated.Value(0),
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.switchedOn !== prevProps.switchedOn) {
      this.toggleExpand();
    }
  }

  render() {
    var icon;
    if (this.state.expanded) {
      icon = <Image style={styles.image} source={require('./img/caret-up.png')} />;
    } else {
      icon = this.props.switchedOn
           ? <Image style={styles.image} source={require('./img/caret-down.png')} />
           : <Image style={styles.image} source={require('./img/caret-down-disabled.png')} />;
    }

    const textColor = this.props.switchedOn
                    ? 'black'
                    : AppColors.inactiveText;

    var height = this.state.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, this.state.maxHeight],
    });

    return (
      <View>
        <View style={styles.head}>
          <TouchableOpacity
            style={styles.label}
            onPress={this.toggleExpand.bind(this)}>
            <Text style={[styles.labelText, {color: textColor}]}>{this.props.title}</Text>
            {icon}
          </TouchableOpacity>
          <View style={styles.switch}>
            <Switch
              onValueChange={this.props.onToggleChange}
              value={this.props.switchedOn} />
          </View>
        </View>
        <Animated.View style={[styles.bodyContainer, {height}]}>
          <View style={styles.body} onLayout={this._setMaxHeight.bind(this)}>
            {this.props.children}
          </View>
        </Animated.View>
      </View>
    );
  }

  toggleExpand() {
    Mixpanel.trackWithProperties('Toggled expand filter', {type: this.props.title});

    if (!this.props.switchedOn && !this.state.expanded) {
      return;
    }

    const toValue = this.state.expanded ? 0 : 1;

    this.setState({
      expanded : !this.state.expanded
    });

    Animated.spring(this.state.anim, {toValue: toValue, friction: 10}).start();
  }

  _setMaxHeight(event) {
    if (!this.state.maxHeight) {
      this.setState({
        maxHeight: event.nativeEvent.layout.height
      });
    }
  }
}

var styles = createStylesheet({
  head: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    android: {
      elevation: 1,
    },
    ios: {
      borderBottomWidth: 1,
      borderColor: AppColors.cellBorder,
    },
  },
  label: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
  },
  labelText: {
    flex: 1,
    fontSize: 17,
    alignItems: 'flex-start',
    color: AppColors.inactiveText,
  },
  image: {
    alignItems: 'flex-end',
  },
  switch: {
    alignItems: 'flex-end',
    padding: 10,
  },
  bodyContainer: {
    overflow: 'hidden',
  },
  body: {
    borderColor: AppColors.cellBorder,
    borderBottomWidth: 1,
    backgroundColor: 'white',
  },
});

module.exports = FilterSection;
