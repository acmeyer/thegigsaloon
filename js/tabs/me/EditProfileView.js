// @flow
'use strict';

import React, {Component} from 'React';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  Animated,
  Keyboard,
  InteractionManager,
} from 'react-native';
import AppColors from '../../common/AppColors';
import AppHeader from '../../common/AppHeader';
import AppButton from '../../common/AppButton';
import ProfilePhotoUpload from '../../common/ProfilePhotoUpload';
import ImagePicker from 'react-native-image-picker';
import {Paragraph} from '../../common/AppText';
import {createStylesheet} from '../../common/AppStyleSheet';
import Geocoder from 'react-native-geocoder';
import { Crashlytics } from 'react-native-fabric';
import Mixpanel from 'react-native-mixpanel';
import {validEmail, validPhone, isNumber, validPostalCode} from '../../common/validators';
import {saveUserProfile} from '../../actions';

const USE_HIGH_ACCURACY = Platform.OS === 'ios' ? true : false;

import {connect} from 'react-redux';

class EditProfileView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      locationLoading: false,
      useLocation: false,
      anim: new Animated.Value(0),
      visibleBottom: 0,
      userName: this.props.user.name,
      userEmail: this.props.user.email,
      userBirthMonth: this.props.user.birthMonth,
      userBirthDay: this.props.user.birthDay,
      userBirthYear: this.props.user.birthYear,
      userPostalCode: this.props.user.postalCode,
      userPhoneNumber: this.props.user.phoneNumber,
      attachedPhoto: false,
      photoLoading: false,
      photoData: null,
      photoName: null,
    };

    this.close = this.close.bind(this);
    this.saveProfile = this.saveProfile.bind(this);
    this.getLocation = this.getLocation.bind(this);
    this.updateName = this.updateName.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.updateBirthMonth = this.updateBirthMonth.bind(this);
    this.updateBirthDay = this.updateBirthDay.bind(this);
    this.updateBirthYear = this.updateBirthYear.bind(this);
    this.updatePostalCode = this.updatePostalCode.bind(this);
    this.updatePhoneNumber = this.updatePhoneNumber.bind(this);
    this.userIsValid = this.userIsValid.bind(this);
    this.keyboardWillShow = this.keyboardWillShow.bind(this);
    this.keyboardWillHide = this.keyboardWillHide.bind(this);
    this.handlePhotoChange = this.handlePhotoChange.bind(this);
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
    var photoChanged = nextState.attachedPhoto;
    var nameChanged = nextState.userName !== '' && nextState.userName !== null && nextState.userName !== this.props.user.name;
    var emailChanged = nextState.userEmail !== this.props.user.email;
    var postalCodeChanged = nextState.userPostalCode !== this.props.user.postalCode;
    var birthMonthChanged = nextState.userBirthMonth !== this.props.user.birthMonth;
    var birthDayChanged = nextState.userBirthDay !== this.props.user.birthDay;
    var birthYearChanged = nextState.userBirthYear !== this.props.user.birthYear;
    var phoneChanged = nextState.userPhoneNumber !== this.props.user.phoneNumber;
    var somethingChanged = photoChanged || nameChanged || emailChanged || phoneChanged || postalCodeChanged || birthMonthChanged || birthDayChanged || birthYearChanged;
    const toValue = somethingChanged ? 1 : 0;
    Animated.spring(this.state.anim, {toValue}).start();
  }

  render() {
    var visibleBottom = this.state.visibleBottom;
    var bottom = this.state.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, visibleBottom],
    });
    var locationIcon;
    if (this.state.locationLoading) {
      locationIcon = <ActivityIndicator style={styles.activityIndictor} />;
    } else {
      locationIcon = this.state.useLocation
             ? <Image style={styles.indicator} source={require('../../filter/img/near_me_active.png')} />
             : <Image style={styles.indicator} source={require('../../filter/img/near_me.png')} />;
    }
    var leftItem;
    if (this.props.navigator) {
      leftItem = {
        title: 'Back',
        icon: require('../../common/img/back.png'),
        layout: 'icon',
        onPress: this.close,
      };
    }
    return (
      <View style={styles.container}>
        <AppHeader
          title="Edit Profile"
          leftItem={leftItem}>
          <View style={styles.photoUploaderWrap}>
            <ProfilePhotoUpload
              captionStyle={styles.choosePhotoButton}
              user={this.props.user}
              handlePhotoUpload={this.handlePhotoChange}
              isLoading={this.state.photoLoading}
              attachedPhoto={this.state.attachedPhoto}
              attachedPhotoSource={this.state.photoSource}
            />
          </View>
        </AppHeader>
        <View style={styles.listViewContainer}>
          <ScrollView
            ref="editFormScrollView"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustContentInsets={false}
            alwaysBounceVertical={false}
            contentContainerStyle={[styles.listView, {paddingBottom: this.state.visibleBottom + 50}]}>
            <View style={styles.formInput}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                placeholder="Enter name..."
                multiline={false}
                clearButtonMode="while-editing"
                onChangeText={(text) => this.updateName(text)}
                style={styles.textField}
                value={this.state.userName}
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={styles.formInput}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder="Enter email..."
                multiline={false}
                clearButtonMode="while-editing"
                onChangeText={(text) => this.updateEmail(text)}
                style={styles.textField}
                value={this.state.userEmail}
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={styles.formInput}>
              <Text style={styles.inputLabel}>Phone #</Text>
              <TextInput
                placeholder="Enter phone number..."
                multiline={false}
                clearButtonMode="while-editing"
                onChangeText={(text) => this.updatePhoneNumber(text)}
                keyboardType="phone-pad"
                style={styles.textField}
                value={this.state.userPhoneNumber}
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={styles.formInput}>
              <Text style={styles.inputLabel}>Postal code</Text>
              <View style={styles.locationWrap}>
                <TextInput
                  placeholder="Enter postal code..."
                  multiline={false}
                  clearButtonMode="while-editing"
                  onChangeText={(text) => this.updatePostalCode(text)}
                  style={styles.textField}
                  value={this.state.userPostalCode}
                  underlineColorAndroid="transparent"
                />
                <TouchableOpacity onPress={() => this.getLocation()}>
                  {locationIcon}
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.formInput}>
              <Text style={styles.inputLabel}>Birthdate</Text>
              <View style={styles.textFieldWrap}>
                <TextInput
                  placeholder="MM"
                  multiline={false}
                  onChangeText={(text) => this.updateBirthMonth(text)}
                  style={styles.shortTextField}
                  keyboardType="phone-pad"
                  value={this.state.userBirthMonth}
                  underlineColorAndroid="transparent"
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  placeholder="DD"
                  multiline={false}
                  onChangeText={(text) => this.updateBirthDay(text)}
                  style={styles.shortTextField}
                  keyboardType="phone-pad"
                  value={this.state.userBirthDay}
                  underlineColorAndroid="transparent"
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  placeholder="YYYY"
                  multiline={false}
                  onChangeText={(text) => this.updateBirthYear(text)}
                  style={styles.mediumTextField}
                  keyboardType="phone-pad"
                  value={this.state.userBirthYear}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
            <View style={styles.explanation}>
              <Paragraph style={styles.explanationText}>
                Note: The above information is used to help pre-fill gig application forms. Only your name and image are public.
              </Paragraph>
            </View>
          </ScrollView>
          <Animated.View style={[styles.saveButton, {bottom}]}>
            <AppButton
              caption={this.state.isLoading ? 'Saving...' : 'Save Changes'}
              onPress={this.saveProfile}
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

  handlePhotoChange() {
    let options = {
      title: null,
      mediaType: 'photo',
      maxHeight: 600,
      maxWidth: 600,
    };
    this.setState({photoLoading: true});
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        this.setState({photoLoading: false});
      } else if (response.error) {
        if (Platform.OS === 'ios') {
          Crashlytics.recordError(response.error);
        } else {
          Crashlytics.logException(response.error);
        }
        this.setState({photoLoading: false});
      } else {
        const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

        let fileName;
        if (Platform.OS === 'ios') {
          fileName = response.uri.split('/').pop();
        } else {
          fileName = response.fileName;
        }

        this.setState({
          attachedPhoto: true,
          photoLoading: false,
          photoSource: source,
          photoData: response.data,
          photoName: fileName,
        });
      }
    });
  }

  saveProfile() {
    if (this.userIsValid()) {
      InteractionManager.runAfterInteractions(() => {
        this.setState({isLoading: true});
        this.props.dispatch(saveUserProfile({
          photoData: this.state.photoData,
          photoName: this.state.photoName,
          name: this.state.userName,
          email: this.state.userEmail,
          birthMonth: this.state.userBirthMonth,
          birthDay: this.state.userBirthDay,
          birthYear: this.state.userBirthYear,
          postalCode: this.state.userPostalCode,
          phoneNumber: this.state.userPhoneNumber,
        })).then(() => {
          this.setState({isLoading: false});
          this.close();
        });
      });
    }
  }

  userIsValid() {
    if (this.state.userName && this.state.userName === '') {
      alert('Please enter your name');
      return false;
    }
    if (this.state.userEmail && this.state.userEmail !== '' && !validEmail(this.state.userEmail)) {
      alert('Please enter a valid email');
      return false;
    }
    if (this.state.userPhoneNumber && this.state.userPhoneNumber !== '' && !validPhone(this.state.userPhoneNumber)) {
      alert('Please enter a valid phone number');
      return false;
    }
    if (this.state.userPostalCode && this.state.userPostalCode !== '' && !validPostalCode(this.state.userPostalCode)) {
      alert('Please enter a valid postal code');
      return false;
    }
    if (this.state.userBirthMonth && this.state.userBirthMonth !== '' && !isNumber(this.state.userBirthMonth)) {
      alert('Please enter a valid birth month');
      return false;
    }
    if (this.state.userBirthDay && this.state.userBirthDay !== '' && !isNumber(this.state.userBirthDay)) {
      alert('Please enter a valid birth day');
      return false;
    }
    if (this.state.userBirthYear && this.state.userBirthYear !== '' && !isNumber(this.state.userBirthYear)) {
      alert('Please enter a valid birth year');
      return false;
    }
    return true;
  }

  getLocation() {
    Mixpanel.timeEvent('Lookup location');
    this.setState({locationLoading: true});
    navigator.geolocation.getCurrentPosition(
      (position) => {
        var myPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        Mixpanel.trackWithProperties('Lookup location', {latitude: position.coords.latitude, longitude: position.coords.longitude});
        Geocoder.geocodePosition(myPosition).then(res => {
          this.setState({
            useLocation: true,
            locationLoading: false,
            userPostalCode: res[0].postalCode
          });
        });
      },
      (error) => {
        if (Platform.OS === 'ios') {
          Crashlytics.recordError(error.message);
        } else {
          Crashlytics.logException(error.message);
        }
        this.setState({locationLoading: false});
        alert(error.message);
      },
      {enableHighAccuracy: USE_HIGH_ACCURACY, timeout: 20000, maximumAge: 1000}
    );
  }

  updateName(text) {
    this.setState({userName: text});
  }

  updateEmail(text) {
    this.setState({userEmail: text});
  }

  updateBirthMonth(text) {
    if (text.length < 3 && text < 13) {
      this.setState({userBirthMonth: text});
    }
  }

  updateBirthDay(text) {
    if (text.length < 3 && text < 32) {
      this.setState({userBirthDay: text});
    }
  }

  updateBirthYear(text) {
    if (text.length < 5 && text < 2016) {
      this.setState({userBirthYear: text});
    }
  }

  updatePostalCode(text) {
    this.setState({userPostalCode: text});
  }

  updatePhoneNumber(text) {
    this.setState({userPhoneNumber: text});
  }

  close() {
    if (this.props.navigator) {
      this.props.navigator.pop();
    }
  }
}

const styles = createStylesheet({
  container: {
    flex: 1,
  },
  listViewContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  listView: {
    paddingBottom: 50,
  },
  formInput: {
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: AppColors.cellBorder,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontWeight: 'bold',
    width: 95,
  },
  textField: {
    flex: 1,
    height: 40,
    android: {
      textAlignVertical: 'top',
    }
  },
  textFieldWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSeparator: {
    color: AppColors.inactiveText,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  shortTextField: {
    width: 30,
    height: 40,
    textAlign: 'center',
    android: {
      textAlignVertical: 'top',
    },
  },
  mediumTextField: {
    width: 50,
    height: 40,
    textAlign: 'center',
    android: {
      textAlignVertical: 'top',
    },
  },
  locationWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  explanation: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  explanationText: {
    color: AppColors.inactiveText,
  },
  saveButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: AppColors.cellBorder,
  },
  photoUploaderWrap: {
    paddingBottom: 10,
  },
});

function select(store) {
  return {
    user: store.user,
  };
}

module.exports = connect(select)(EditProfileView);
