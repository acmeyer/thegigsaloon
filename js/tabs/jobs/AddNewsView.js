//@flow
'use strict';

import React, {Component} from 'React';
import AppHeader from '../../common/AppHeader';
import AppColors from '../../common/AppColors';
import AppButton from '../../common/AppButton';
import {createStylesheet} from '../../common/AppStyleSheet';
import {
  Animated,
  View,
  InteractionManager,
  TextInput,
  Keyboard,
  Platform,
} from 'react-native';
var validUrl = require('valid-url');
import {createArticle, showToastMessage} from '../../actions';
const {connect} = require('react-redux');

const TITLE_STARTING_HEIGHT = Platform.OS === 'android' ? 45 : 44;

class AddNewsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articleUrl: null,
      anim: new Animated.Value(0),
      visibleBottom: 0,
    };

    this.close = this.close.bind(this);
    this.createArticle = this.createArticle.bind(this);
    this.keyboardWillShow = this.keyboardWillShow.bind(this);
    this.keyboardWillHide = this.keyboardWillHide.bind(this);
  }

  componentDidMount() {
    this.keyboardShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
    this.keyboardHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
  }

  componentWillUnmount() {
    this.keyboardShowListener.remove();
    this.keyboardHideListener.remove();
  }

  componentWillUpdate(nextProps, nextState) {
    const toValue = nextState.articleUrl !== '' && nextState.articleUrl !== null
      ? 1 : 0;
    Animated.spring(this.state.anim, {toValue}).start();
  }

  render() {
    var visibleBottom = this.state.visibleBottom;
    var bottom = this.state.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, visibleBottom],
    });
    let leftItem;
    if (this.props.navigator) {
      leftItem = {
        title: 'Cancel',
        icon: require('../../common/img/x.png'),
        onPress: this.close,
      };
    }

    return (
      <View style={styles.container}>
        <AppHeader
          title="Submit News"
          leftItem={leftItem}
        />
        <View style={styles.composeContainer}>
          <View style={[styles.input, {maxHeight: TITLE_STARTING_HEIGHT}]}>
            <TextInput
              autoFocus={true}
              placeholder="http://www.example.com"
              multiline={false}
              onChangeText={(text) => this.updateArticleUrl(text)}
              style={styles.textField}
              value={this.state.articleUrl}
              underlineColorAndroid="transparent"
              keyboardType="url"
              returnKeyType="done"
              clearButtonMode="while-editing"
              autoCapitalize="none"
            />
          </View>
          <Animated.View style={[styles.applyButton, {bottom}]}>
            <AppButton
              caption="Submit News"
              onPress={this.createArticle}
            />
          </Animated.View>
        </View>
      </View>
    );
  }

  keyboardWillShow(e) {
    let keyboardHeight = e.endCoordinates.height;
    this.setState({visibleBottom: keyboardHeight});
  }

  keyboardWillHide(e) {
    this.setState({visibleBottom: 0});
  }

  updateArticleUrl(text) {
    this.setState({
      articleUrl: text,
    });
  }

  createArticle() {
    if (validUrl.isWebUri(this.state.articleUrl)) {
      InteractionManager.runAfterInteractions(() => {
        this.props.dispatch(createArticle(this.state.articleUrl, this.props.job));
        this.props.dispatch(showToastMessage('News item added!', 'short', 'bottom'));
      });
      this.close();
    } else {
      alert('Please enter a valid url');
    }
  }

  close() {
    const {navigator, onClose} = this.props;
    if (navigator) {
      requestAnimationFrame(() => navigator.pop());
    }
    if (onClose) {
      onClose();
    }
  }
}

var styles = createStylesheet({
  container: {
    flex: 1,
  },
  composeContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: AppColors.cellBorder,
    marginHorizontal: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textField: {
    paddingVertical: 10,
    flex: 1,
    android: {
      textAlignVertical: 'top',
    },
  },
  applyButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: AppColors.cellBorder,
  },
});

module.exports = connect()(AddNewsView);
