// @flow
'use strict';

import React, {Component} from 'React';
import {
  Animated,
  InteractionManager,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  ScrollView,
} from 'react-native';
import AppColors from '../../common/AppColors';
import AppHeader from '../../common/AppHeader';
import AppButton from '../../common/AppButton';
import {Heading2} from '../../common/AppText';
import {createStylesheet} from '../../common/AppStyleSheet';
import CompanyLogo from '../../common/CompanyLogo';
import {submitGigReview, showToastMessage, loadReviews, loadJobs, loadUserGigs} from '../../actions';
import {connect} from 'react-redux';

const APPLY_BUTTON_HEIGHT = 56;

class GigReview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: '',
      wageRate: '',
      isLoading: false,
      rating: null,
      anim: new Animated.Value(0),
      visibleBottom: 0,
    };

    this.close = this.close.bind(this);
    this.submitReview = this.submitReview.bind(this);
    this.ratingChange = this.ratingChange.bind(this);
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
    const toValue = nextState.rating
      ? 1 : 0;
    Animated.spring(this.state.anim, {toValue}).start();
  }

  render() {
    var visibleBottom = this.state.visibleBottom;
    var bottom = this.state.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, visibleBottom],
    });
    const stars = [1, 2, 3, 4, 5].map(
      (value) => (
        <Star
          key={value}
          value={value}
          isFull={this.state.rating && value <= this.state.rating}
          onPress={() => this.ratingChange(value)}
        />
      )
    );
    let leftItem, bottomButton;
    if (this.props.navigator) {
      leftItem = {
        title: 'Close',
        icon: require('../../common/img/x.png'),
        onPress: this.close,
      };
    }
    bottomButton = (
      <Animated.View style={[styles.applicationButtonWrap, {bottom}]}>
        <AppButton
          caption={this.state.isLoading ? 'Submitting...' : 'Submit'}
          onPress={() => this.submitReview()}
        />
      </Animated.View>
    );
    return (
      <View style={styles.container}>
        <AppHeader
          title="Review"
          leftItem={leftItem}
        />
        <ScrollView
          ref="scrollview"
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollViewContent, {paddingBottom: this.state.visibleBottom + APPLY_BUTTON_HEIGHT}]}>
          <View style={styles.gigContainer}>
            <View style={styles.logoWrapper}>
              <CompanyLogo job={this.props.gig} size={60} />
            </View>
            <View style={styles.title}>
              <Text style={styles.titleText}>
                {this.props.gig.jobType} with {this.props.gig.companyName}
              </Text>
            </View>
          </View>
          <View style={styles.section}>
            <Heading2>Rate your experience</Heading2>
            <View style={styles.stars}>
              {stars}
            </View>
          </View>
          <View style={styles.section}>
            <Heading2>Average Hourly Earnings</Heading2>
            <Text style={{color: AppColors.inactiveText}}>(best guess)</Text>
            <View style={styles.wageWrap}>
              <Heading2>$</Heading2>
              <TextInput
                autoFocus={false}
                placeholder="ex. 15"
                placeholderTextColor={AppColors.inactiveText}
                multiline={false}
                keyboardType="numeric"
                onChangeText={(text) => this.updateWage(text)}
                style={styles.textField}
                value={this.state.wageRate}
                underlineColorAndroid="transparent"
              />
              <Heading2>/hr</Heading2>
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.textAreaWrap}>
              <TextInput
                autoFocus={false}
                placeholder="Describe your experience..."
                placeholderTextColor={AppColors.inactiveText}
                multiline={true}
                onChangeText={(text) => this.setState({comment: text})}
                style={styles.textArea}
                value={this.state.comment}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>
        </ScrollView>
        {bottomButton}
      </View>
    );
  }

  keyboardWillShow(e) {
    let keyboardHeight = e.endCoordinates.height;
    this.setState({visibleBottom: keyboardHeight});
    this.refs.scrollview.scrollTo({y: keyboardHeight - 100});
  }

  keyboardWillHide(e) {
    this.setState({visibleBottom: 0});
  }

  updateWage(text) {
    text = text.trim();
    var re = /\d+\.?\d?\d?/;
    if ((text.length < 7 && re.test(text)) || text === '') {
      this.setState({wageRate: text});
    }
  }

  close() {
    requestAnimationFrame(() => this.props.navigator.pop());
  }

  submitReview() {
    if (!this.state.isLoading) {
      InteractionManager.runAfterInteractions(() => {
        this.setState({isLoading: true});
        this.props.dispatch(submitGigReview({
          gigId: this.props.gig.id,
          rating: this.state.rating,
          wageRate: this.state.wageRate,
          comment: this.state.comment,
        })).then(() => {
          this.setState({isLoading: false});
          this.close();
          this.props.dispatch(showToastMessage('Review submitted. Thanks!', 'short', 'bottom'));
          // Sync with new review content
          this.props.dispatch(loadReviews(this.props.gig.id, 0));
          this.props.dispatch(loadJobs(this.props.filter));
          this.props.dispatch(loadUserGigs());
        });
      });
    }
  }

  ratingChange(value) {
    this.setState({
      rating: value
    });
  }
}

function Star({isFull, value, onPress}) {
  const source = isFull
    ? require('./img/full-star.png')
    : require('./img/empty-star.png');

  const accessibilityTraits = ['button'];
  if (isFull) {
    accessibilityTraits.push('selected');
  }

  return (
    <TouchableOpacity
      accessibilityLabel={`${value} stars`}
      accessibilityTraits={accessibilityTraits}
      style={styles.star}
      activeOpacity={0.8}
      onPress={onPress}>
      <Image source={source} />
    </TouchableOpacity>
  );
}

const styles = createStylesheet({
  container: {
    flex: 1,
  },
  gigContainer: {
    padding: 15,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingTop: 10,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wageWrap: {
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textField: {
    fontSize: 20,
    width: 75,
    height: 20,
    paddingHorizontal: 5,
    paddingBottom: 2,
    textAlign: 'center',
    alignSelf: 'flex-end',
    borderBottomWidth: 1,
    borderColor: AppColors.cellBorder,
    textAlignVertical: 'bottom',
    android: {
      height: 34,
    }
  },
  textAreaWrap: {
    height: 100,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: AppColors.cellBorder,
  },
  textArea: {
    fontSize: 15,
    flex: 1,
    android: {
      textAlignVertical: 'top',
      alignSelf: 'stretch',
    },
  },
  star: {
    padding: 10,
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicationButtonWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: AppColors.cellBorder,
  },
  mutedText: {
    color: AppColors.inactiveText,
  },
});

function select(store) {
  return {
    filter: store.filter,
  };
}

module.exports = connect(select)(GigReview);
