// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
} from 'react-native';
import ListContainer from '../../common/ListContainer';
import FilterWalkthrough from './FilterWalkthrough';
import AvailableJobsView from './AvailableJobsView';
import MyGigsView from './MyGigsView';
import {switchGigsList} from '../../actions';
import {connect} from 'react-redux';

class JobsView extends Component {
  constructor(props) {
    super(props);

    this.openFilterScreen = this.openFilterScreen.bind(this);
    this.switchList = this.switchList.bind(this);
  }

  render() {
    let filterItem;
    if (this.props.list === 'available') {
      filterItem = {
        icon: require('../../common/img/filter.png'),
        title: 'Filters',
        onPress: this.openFilterScreen,
      };
    }

    var modal;
    if (!this.props.seenFilterWalkthrough) {
      modal = (
        <FilterWalkthrough />
      );
    }

    return (
      <View style={styles.container}>
        <ListContainer
          title="Gigs"
          selectedSegment={this.props.list === 'myGigs' ? 1 : 0}
          onSegmentChange={this.switchList}
          rightItem={filterItem}
        >
          <AvailableJobsView
            title="Available"
            navigator={this.props.navigator}
          />
          <MyGigsView
            title="My Gigs"
            navigator={this.props.navigator}
          />
        </ListContainer>
        {modal}
      </View>
    );
  }

  switchList(list) {
    let gigsList = list === 0 ? 'available' : 'myGigs';
    this.props.dispatch(switchGigsList(gigsList));
  }

  openFilterScreen() {
    this.props.navigator.push({ filter: true });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function select(store) {
  return {
    list: store.navigation.gigsList,
    seenFilterWalkthrough: store.user.hasSeenFilterWalkthrough,
    user: store.user,
  };
}

module.exports = connect(select)(JobsView);
