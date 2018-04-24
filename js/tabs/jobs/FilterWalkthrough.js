//@flow
'use strict';

import React, {Component} from 'React';
import {
  View,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {createStylesheet} from '../../common/AppStyleSheet';
import FilterWalkthroughPage from './FilterWalkthroughPage';
import InitialFilterScreen from './InitialFilterScreen';
import LocationFilterScreen from './LocationFilterScreen';
import RoleFilterScreen from './RoleFilterScreen';
import RequirementsFilterScreen from './RequirementsFilterScreen';
import GigTypeFilterScreen from './GigTypeFilterScreen';
import ViewPager from '../../common/ViewPager';
import {
  skipGigFilter,
  finishedGigFilter,
  switchFilterScreen,
  applyFilters,
  startLoadingJobs,
  loadJobs,
} from '../../actions';
import Geocoder from 'react-native-geocoder';
import { Crashlytics } from 'react-native-fabric';
const Mixpanel = require('react-native-mixpanel');
import update from 'react-addons-update';
import _ from 'lodash';

import { connect } from 'react-redux';

const USE_HIGH_ACCURACY = Platform.OS === 'ios' ? true : false;

class FilterWalkthrough extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedFilters: {...this.props.selectedFilters},
      locationLoading: false,
      idx: 0,
    };

    this.handleSelectSegment = this.handleSelectSegment.bind(this);
    this.switchScreen = this.switchScreen.bind(this);
    this.nextScreen = this.nextScreen.bind(this);
    this.getLocation = this.getLocation.bind(this);
    this.toggleRole = this.toggleRole.bind(this);
    this.toggleRequirement = this.toggleRequirement.bind(this);
    this.toggleJobType = this.toggleJobType.bind(this);
    this.finishWalkthrough = this.finishWalkthrough.bind(this);
    this._refs = [];
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedFilters !== nextProps.selectedFilters) {
      this.setState({selectedFilters: {...nextProps.selectedFilters}});
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.content}>
            <TouchableOpacity
              accessibilityLabel="Skip filter setup"
              accessibilityTraits="button"
              style={styles.skip}
              onPress={() => this.props.skipGigFilter()}>
              <Image
                style={{opacity: 0.4}}
                source={require('../../common/img/x.png')}
              />
            </TouchableOpacity>
            <ViewPager
              count={5}
              selectedIndex={this.state.idx}
              onSelectedIndexChange={this.handleSelectSegment}>
              <FilterWalkthroughPage
                title="Find Gigs"
                actionButtonTitle="Let's Get Started"
                onNextScreen={this.nextScreen}
                image={require('./img/search.png')}>
                <InitialFilterScreen />
              </FilterWalkthroughPage>
              <FilterWalkthroughPage
                title="Location"
                actionButtonTitle="Next"
                onNextScreen={this.nextScreen}
                image={require('./img/find-location.png')}>
                <LocationFilterScreen
                  getLocation={this.getLocation}
                  value={this.state.selectedFilters.location}
                  onChangeText={(value) => this.updateLocation(value)}
                  locationLoading={this.state.locationLoading}
                />
              </FilterWalkthroughPage>
              <FilterWalkthroughPage
                title="Role"
                actionButtonTitle="Next"
                onNextScreen={this.nextScreen}
                image={require('./img/mask.png')}>
                <RoleFilterScreen
                  roles={this.props.roles}
                  selectedRoles={this.state.selectedFilters.roles}
                  toggleRole={this.toggleRole}
                />
              </FilterWalkthroughPage>
              <FilterWalkthroughPage
                title="Requirements"
                actionButtonTitle="Next"
                onNextScreen={this.nextScreen}
                image={require('./img/list.png')}>
                <RequirementsFilterScreen
                  requirements={this.props.requirements}
                  selectedRequirements={this.state.selectedFilters.requirements}
                  toggleRequirement={this.toggleRequirement}
                />
              </FilterWalkthroughPage>
              <FilterWalkthroughPage
                title="Gig Type"
                actionButtonTitle="Show me the gigs!"
                onNextScreen={this.finishWalkthrough}
                image={require('./img/work.png')}>
                <GigTypeFilterScreen
                  jobTypes={this.props.jobTypes}
                  selectedJobTypes={this.state.selectedFilters.jobTypes}
                  toggleJobType={this.toggleJobType}
                />
              </FilterWalkthroughPage>
            </ViewPager>
          </View>
        </View>
      </View>
    );
  }

  switchScreen(screen) {
    let filterScreen;
    switch (screen) {
      case 0:
        filterScreen = 'initial';
        break;
      case 1:
        filterScreen = 'location';
        break;
      case 2:
        filterScreen = 'role';
        break;
      case 3:
        filterScreen = 'requirements';
        break;
      case 4:
        filterScreen = 'gig-type';
        break;
      default:
        filterScreen = 'initial';
    }
    this.props.switchFilterScreen(filterScreen);
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.selectedSegment === 'number' &&
        nextProps.selectedSegment !== this.state.idx) {
      this.setState({idx: nextProps.selectedSegment});
    }
  }

  handleSelectSegment(idx: number) {
    if (this.state.idx !== idx) {
      this.setState({idx}, () => this.switchScreen(idx));
    }
  }

  nextScreen() {
    this.setState({idx: this.state.idx + 1}, () => this.switchScreen(this.state.idx + 1));
  }

  finishWalkthrough() {
    this.props.applyFilters(this.state.selectedFilters);
    this.props.startLoadingJobs();
    this.props.loadJobs(this.state.selectedFilters);
    this.props.finishedGigFilter();
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
}

const BOTTOM_HEIGHT = Platform.OS === 'android' ? 0 : 49;

var styles = createStylesheet({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: BOTTOM_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.66)',
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
    android: {
      elevation: 3,
    },
  },
  inner: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  skip: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  page: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: undefined,
    paddingBottom: 0,
  },
  button: {
    marginTop: 10,
    alignSelf: 'stretch',
  },
});

function select(store) {
  return {
    filterWalkthroughScreen: store.navigation.filterScreen,
    requirements: store.requirements,
    roles: store.roles,
    jobTypes: store.jobTypes,
    selectedFilters: store.filter,
  };
}

function actions(dispatch) {
  return {
    switchFilterScreen: (screen) => dispatch(switchFilterScreen(screen)),
    skipGigFilter: () => dispatch(skipGigFilter()),
    finishedGigFilter: () => dispatch(finishedGigFilter()),
    applyFilters: (filters) => dispatch(applyFilters(filters)),
    startLoadingJobs: () => dispatch(startLoadingJobs()),
    loadJobs: (filters) => dispatch(loadJobs(filters)),
  };
}

module.exports = connect(select, actions)(FilterWalkthrough);
