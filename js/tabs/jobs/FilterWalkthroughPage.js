//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
} from 'react-native';
import AppButton from '../../common/AppButton';
import AppColors from '../../common/AppColors';
import {Heading1} from '../../common/AppText';

class FilterWalkthroughPage extends Component {
  render() {
    var image;
    if (this.props.image) {
      image = (
        <Image style={styles.image} source={this.props.image} />
      );
    }

    return (
      <View style={styles.container}>
        <Heading1 style={styles.title}>{this.props.title}</Heading1>
        <ScrollView
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
          style={styles.scrollView}>
          {image}
          {this.props.children}
        </ScrollView>
        <View style={styles.buttonWrap}>
          <AppButton
            style={styles.button}
            type="primary"
            caption={this.props.actionButtonTitle}
            onPress={this.props.onNextScreen}
          />
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  image: {
    margin: 15,
    alignSelf: 'center',
  },
  buttonWrap: {
    alignSelf: 'stretch',
    borderTopWidth: 1,
    borderColor: AppColors.cellBorder,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 10,
    alignSelf: 'stretch',
  },
});

module.exports = FilterWalkthroughPage;
