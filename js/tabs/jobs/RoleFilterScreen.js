//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
} from 'react-native';
import {Heading2} from '../../common/AppText';
import FilterItem from './FilterItem';

class RoleFilterScreen extends Component {
  render() {
    var roles = this.props.roles.map((role, ii) => (
      <FilterItem
        key={role}
        item={role}
        isChecked={this.props.selectedRoles[role]}
        onToggle={() => this.props.toggleRole(role)}
      />
    ));
    return (
      <View style={styles.container}>
        <Heading2 style={styles.text}>
          What kind of role(s) are you interested in?
        </Heading2>
        <View style={styles.roles}>
          {roles}
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  roles: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 20,
  },
  text: {
    marginBottom: 10,
    textAlign: 'center',
  },
});

module.exports = RoleFilterScreen;
