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
  Image,
  ActivityIndicator,
  TouchableOpacity,
  InteractionManager,
  TextInput,
  Keyboard,
  Text,
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
const {Crashlytics} = require('react-native-fabric');
import {createPost, showToastMessage} from '../../actions';
const {connect} = require('react-redux');

const TITLE_STARTING_HEIGHT = Platform.OS === 'android' ? 45 : 44;
const TITLE_MAX_LENGTH = 80;
const APPLY_BUTTON_HEIGHT = 56;

class ComposePostScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      postContent: null,
      postTitle: null,
      remainingTitleCharacters: TITLE_MAX_LENGTH,
      anim: new Animated.Value(0),
      visibleBottom: 0,
      attachedPhoto: false,
      attachedPhotoLoading: false,
      attachedPhotoSource: null,
      attachedPhotoData: null,
      attachedPhotoName: null,
    };

    this.close = this.close.bind(this);
    this.attachPhoto = this.attachPhoto.bind(this);
    this.removePhoto = this.removePhoto.bind(this);
    this.createPost = this.createPost.bind(this);
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
    const toValue = ((nextState.postTitle !== '' && nextState.postTitle !== null) || (nextState.postContent !== '' && nextState.postContent !== null)) && !nextState.attachedPhotoLoading
      ? 1 : 0;
    Animated.spring(this.state.anim, {toValue}).start();
  }

  render() {
    var visibleBottom = this.state.visibleBottom;
    var bottom = this.state.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, visibleBottom],
    });
    var postBottom = this.state.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [visibleBottom + 10, visibleBottom + 10 + APPLY_BUTTON_HEIGHT],
    });
    let leftItem, rightItem;
    if (this.props.navigator) {
      leftItem = {
        title: 'Cancel',
        icon: require('../../common/img/x.png'),
        onPress: this.close,
      };
    }
    rightItem = {
      title: 'Photo',
      icon: require('./img/camera.png'),
      layout: 'icon',
      onPress: this.attachPhoto,
    };

    let remainingColor = this.state.remainingTitleCharacters > 21
      ? {color: AppColors.inactiveText}
      : {color: 'red'};

    let attachedImage, imageContent;
    if (this.state.attachedPhotoLoading) {
      imageContent = (
        <ActivityIndicator />
      );
    } else {
      imageContent = (
        <View>
          <TouchableOpacity onPress={() => this.showLightbox()}>
            <Image
              style={styles.attachedPhoto}
              source={this.state.attachedPhotoSource}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeImageIcon} onPress={this.removePhoto}>
            <Image source={require('./img/removeImage.png')} />
          </TouchableOpacity>
        </View>
      );
    }
    if (this.state.attachedPhoto || this.state.attachedPhotoLoading) {
      attachedImage = (
        <Animated.View style={[styles.attachedPhotoContainer, {bottom: postBottom}]}>
          {imageContent}
        </Animated.View>
      );
    }

    return (
      <View style={styles.container}>
        <AppHeader
          title="New Post"
          leftItem={leftItem}
          rightItem={rightItem}
        />
        <View style={styles.composeContainer}>
          <View style={[styles.inputWrap, {bottom: visibleBottom + APPLY_BUTTON_HEIGHT}]}>
            <View style={[styles.titleInput, {maxHeight: TITLE_STARTING_HEIGHT}]}>
              <TextInput
                autoFocus={true}
                placeholder="Add a subject"
                multiline={false}
                onChangeText={(text) => this.updatePostTitle(text)}
                style={styles.textField}
                value={this.state.postTitle}
                underlineColorAndroid="transparent"
              />
              <View>
                <Text
                  style={[styles.remaining, remainingColor]}>
                  {this.state.remainingTitleCharacters}
                </Text>
              </View>
            </View>
            <TextInput
              autoFocus={false}
              placeholder="Write your message"
              multiline={true}
              onChangeText={(text) => this.updatePostContent(text)}
              style={styles.textArea}
              value={this.state.postContent}
              underlineColorAndroid="transparent"
            />
          </View>
          {attachedImage}
          <Animated.View style={[styles.applyButton, {bottom}]}>
            <AppButton
              caption="Create Post"
              onPress={this.createPost}
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

  updatePostContent(text) {
    this.setState({postContent: text});
  }

  updatePostTitle(text) {
    if (text.length < TITLE_MAX_LENGTH + 1) {
      this.setState({
        postTitle: text,
        remainingTitleCharacters: TITLE_MAX_LENGTH - text.length,
      });
    }
  }

  showLightbox() {
    this.props.navigator.push({
      lightbox: true,
      photoSource: this.state.attachedPhotoSource,
    });
  }

  attachPhoto() {
    let options = {
      title: null,
      mediaType: 'photo',
    };
    this.setState({attachedPhotoLoading: true});
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        this.setState({attachedPhotoLoading: false});
      }
      else if (response.error) {
        if (Platform.OS === 'ios') {
          Crashlytics.recordError(response.error);
        } else {
          Crashlytics.logException(response.error);
        }
        this.setState({attachedPhotoLoading: false});
      }
      else {
        const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

        let fileName;
        if (Platform.OS === 'ios') {
          fileName = response.uri.split('/').pop();
        } else {
          fileName = response.fileName;
        }

        this.setState({
          attachedPhoto: true,
          attachedPhotoLoading: false,
          attachedPhotoSource: source,
          attachedPhotoData: response.data,
          attachedPhotoName: fileName,
        });
      }
    });
  }

  removePhoto() {
    this.setState({
      attachedPhoto: false,
      attachedPhotoLoading: false,
      attachedPhotoSource: null,
      attachedPhotoData: null,
      attachedPhotoName: null,
    });
  }

  createPost() {
    InteractionManager.runAfterInteractions(() => {
      this.props.dispatch(createPost(this.state.postContent, this.state.postTitle, this.state.attachedPhotoData, this.state.attachedPhotoName, this.props.job));
      this.props.dispatch(showToastMessage('Post added!', 'short', 'bottom'));
    });
    this.close();
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
  inputWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  remaining: {
    fontSize: 12,
  },
  titleInput: {
    borderBottomWidth: 1,
    borderColor: AppColors.cellBorder,
    marginHorizontal: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textField: {
    fontSize: 18,
    paddingVertical: 10,
    flex: 1,
    android: {
      textAlignVertical: 'top',
    },
  },
  textArea: {
    fontSize: 15,
    padding: 10,
    flex: 1,
    android: {
      textAlignVertical: 'top',
    },
  },
  attachedPhoto: {
    width: 50,
    height: 50,
  },
  attachedPhotoContainer: {
    position: 'absolute',
    right: 10,
  },
  removeImageIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
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

module.exports = connect()(ComposePostScreen);
