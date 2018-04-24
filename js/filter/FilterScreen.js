//@flow
'use strict';

import React, {Component} from 'React';
import AppHeader from '../common/AppHeader';
import AppColors from '../common/AppColors';
import AppButton from '../common/AppButton';
import TagItem from './TagItem';
import FilterSection from './FilterSection';
import LocationFilter from './LocationFilter';
import ItemsWithSeparator from '../common/ItemsWithSeparator';
import update from 'react-addons-update';
import _ from 'lodash';
import {
  Animated,
  View,
  StyleSheet,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import Geocoder from 'react-native-geocoder';
import { Crashlytics } from 'react-native-fabric';
const Mixpanel = require('react-native-mixpanel');

const USE_HIGH_ACCURACY = Platform.OS === 'ios' ? true : false;

const {
  applyFilters,
  loadJobs,
  startLoadingJobs,
} = require('../actions');
const {connect} = require('react-redux');

class FilterScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFilters: {...this.props.selectedFilters},
      anim: new Animated.Value(0),
      useLocation: false,
      locationLoading: false,
      visibleBottom: 0,
    };

    this.applyFilter = this.applyFilter.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.close = this.close.bind(this);
    this.getLocation = this.getLocation.bind(this);
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

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedFilters !== nextProps.selectedFilters) {
      this.setState({selectedFilters: {...nextProps.selectedFilters}});
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.selectedFilters !== nextState.selectedFilters) {
      const changedFilters = !_.isEqual(nextProps.selectedFilters, nextState.selectedFilters);
      const toValue = changedFilters ? 1 : 0;
      Animated.spring(this.state.anim, {toValue}).start();
    }
  }

  render() {
    var visibleBottom = this.state.visibleBottom;
    var bottom = this.state.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, visibleBottom],
    });
    var selectedAnyLocation = this.state.selectedFilters.location !== null;
    var roles = this.props.roles.map((role, ii) => (
      <TagItem
        key={role}
        item={role}
        isChecked={this.state.selectedFilters.roles[role]}
        onToggle={this.toggleRole.bind(this, role)}
      />
    ));
    var selectedAnyRoles = this.props.roles.some(
      (role) => this.state.selectedFilters.roles[role]
    );
    var requirements = this.props.requirements.map((requirement, ii) => (
      <TagItem
        key={requirement}
        item={requirement}
        isChecked={this.state.selectedFilters.requirements[requirement]}
        onToggle={this.toggleRequirement.bind(this, requirement)}
      />
    ));
    var selectedAnyRequirements = this.props.requirements.some(
      (requirement) => this.state.selectedFilters.requirements[requirement]
    );
    var jobTypes = this.props.jobTypes.map((jobType, ii) => (
      <TagItem
        key={jobType}
        item={jobType}
        isChecked={this.state.selectedFilters.jobTypes[jobType]}
        onToggle={this.toggleJobType.bind(this, jobType)}
      />
    ));
    var selectedAnyJobTypes = this.props.jobTypes.some(
      (jobType) => this.state.selectedFilters.jobTypes[jobType]
    );

    var changedFilters = selectedAnyJobTypes || selectedAnyRoles || selectedAnyRequirements || selectedAnyLocation;
    let leftItem, rightItem;
    if (this.props.navigator) {
      leftItem = {
        title: 'Cancel',
        icon: require('../common/img/x.png'),
        onPress: this.close
      };
    }
    if (changedFilters) {
      rightItem = {
        title: 'Clear',
        layout: 'title',
        onPress: this.clearFilter,
      };
    }
    return (
      <View style={styles.container}>
        <AppHeader
          title="Filters"
          leftItem={leftItem}
          rightItem={rightItem}
        />
        <View style={styles.scrollviewContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollview}>
            <FilterSection
              title="Location"
              switchedOn={selectedAnyLocation}
              onToggleChange={(value) => this.toggleLocation(value)}>
              <LocationFilter
                onChangeText={(text) => this.updateLocation(text)}
                value={this.state.selectedFilters.location}
                getLocation={this.getLocation}
                useLocation={this.state.useLocation}
                locationLoading={this.state.locationLoading}
              />
            </FilterSection>
            <FilterSection
              title="Role"
              switchedOn={selectedAnyRoles}
              onToggleChange={(value) => this.toggleAllRoles(value)}>
              <ItemsWithSeparator separatorStyle={styles.separator}>
                {roles}
              </ItemsWithSeparator>
            </FilterSection>
            <FilterSection
              title="Requirements"
              switchedOn={selectedAnyRequirements}
              onToggleChange={(value) => this.toggleAllRequirements(value)}>
              <ItemsWithSeparator separatorStyle={styles.separator}>
                {requirements}
              </ItemsWithSeparator>
            </FilterSection>
            <FilterSection
              title="Gig Type"
              switchedOn={selectedAnyJobTypes}
              onToggleChange={(value) => this.toggleAllJobTypes(value)}>
              <ItemsWithSeparator separatorStyle={styles.separator}>
                {jobTypes}
              </ItemsWithSeparator>
            </FilterSection>
          </ScrollView>
          <Animated.View style={[styles.applyButton, {bottom}]}>
            <AppButton
              caption="Apply filters"
              onPress={this.applyFilter}
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

  toggleLocation(value) {
    Mixpanel.trackWithProperties('Toggled location filter', {value: value});
    let defaultLocation = value ? '' : null;
    var selectedFilters = {...this.state.selectedFilters};
    selectedFilters.location = defaultLocation;
    this.setState({selectedFilters});
  }

  getLocation() {
    Mixpanel.timeEvent('Lookup location');
    this.setState({locationLoading: true});
    navigator.geolocation.getCurrentPosition(
      (position) => {
        var selectedFilters = {...this.state.selectedFilters};
        var myPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        Mixpanel.trackWithProperties('Lookup location', {latitude: position.coords.latitude, longitude: position.coords.longitude});
        Geocoder.geocodePosition(myPosition).then(res => {
          selectedFilters.location = res[0].locality + ', ' + res[0].adminArea;
          this.setState({
            useLocation: true,
            locationLoading: false,
          });
          this.setState({selectedFilters});
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

  updateLocation(text) {
    var selectedFilters = {...this.state.selectedFilters};
    selectedFilters.location = text;
    this.setState({
      useLocation: false,
      locationLoading: false,
    });
    this.setState({selectedFilters});
  }

  toggleAllRoles(value) {
    Mixpanel.trackWithProperties('Toggled roles filter', {value: value});
    var selectedFilters = {...this.state.selectedFilters};
    if (value) {
      var rolesMap = Object.create(null);
      this.props.roles.map((role, ii) => (
        rolesMap[role] = true
      ));
      selectedFilters.roles = update(selectedFilters.roles, {
        $set: rolesMap
      });
    } else {
      selectedFilters.roles = _.omit(selectedFilters.roles, this.props.roles);
    }
    this.setState({selectedFilters});
  }

  toggleRole(role, value) {
    var selectedFilters = {...this.state.selectedFilters};
    var value = !selectedFilters.roles[role];
    if (value) {
      selectedFilters.roles = update(selectedFilters.roles, {
        $merge: {[role]: true}
      });
    } else {
      selectedFilters.roles = _.omit(selectedFilters.roles, role);
    }
    this.setState({selectedFilters});
  }

  toggleAllRequirements(value) {
    Mixpanel.trackWithProperties('Toggled requirements filter', {value: value});
    var selectedFilters = {...this.state.selectedFilters};
    if (value) {
      var requirementsMap = Object.create(null);
      this.props.requirements.map((requirement, ii) => (
        requirementsMap[requirement] = true
      ));
      selectedFilters.requirements = update(selectedFilters.requirements, {
        $set: requirementsMap
      });
    } else {
      selectedFilters.requirements = _.omit(selectedFilters.requirements, this.props.requirements);
    }
    this.setState({selectedFilters});
  }

  toggleRequirement(requirement, value) {
    var selectedFilters = {...this.state.selectedFilters};
    var value = !selectedFilters.requirements[requirement];
    if (value) {
      selectedFilters.requirements = update(selectedFilters.requirements, {
        $merge: {[requirement]: true}
      });
    } else {
      selectedFilters.requirements = _.omit(selectedFilters.requirements, requirement);
    }
    this.setState({selectedFilters});
  }

  toggleAllJobTypes(value) {
    Mixpanel.trackWithProperties('Toggled job types filter', {value: value});
    var selectedFilters = {...this.state.selectedFilters};
    if (value) {
      var jobTypesMap = Object.create(null);
      this.props.jobTypes.map((jobType, ii) => (
        jobTypesMap[jobType] = true
      ));
      selectedFilters.jobTypes = update(selectedFilters.jobTypes, {
        $set: jobTypesMap
      });
    } else {
      selectedFilters.jobTypes = _.omit(selectedFilters.jobTypes, this.props.jobTypes);
    }
    this.setState({selectedFilters});
  }

  toggleJobType(jobType, value) {
    var selectedFilters = {...this.state.selectedFilters};
    var value = !selectedFilters.jobTypes[jobType];
    if (value) {
      selectedFilters.jobTypes = update(selectedFilters.jobTypes, {
        $merge: {[jobType]: true}
      });
    } else {
      selectedFilters.jobTypes = _.omit(selectedFilters.jobTypes, jobType);
    }
    this.setState({selectedFilters});
  }

  applyFilter() {
    if (this.state.selectedFilters.location !== null) {
      var selectedFilters = {...this.state.selectedFilters};
      this.state.selectedFilters.location = _.trim(this.state.selectedFilters.location);
      this.setState({selectedFilters});
    }
    this.props.dispatch(applyFilters(this.state.selectedFilters));
    this.props.dispatch(startLoadingJobs());
    this.props.dispatch(loadJobs(this.state.selectedFilters));
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

  clearFilter() {
    Mixpanel.track('Tapped to clear filters');
    this.setState({selectedFilters: {jobTypes: {}, location: null, requirements: {}, roles: {}}});
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollviewContainer: {
    flex: 1,
    backgroundColor: AppColors.tableViewBackground,
  },
  scrollview: {
    paddingBottom: 50,
  },
  separator: {
    marginHorizontal: 20,
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

function select(store) {
  return {
    requirements: store.requirements,
    roles: store.roles,
    jobTypes: store.jobTypes,
    selectedFilters: store.filter,
  };
}

module.exports = connect(select)(FilterScreen);
