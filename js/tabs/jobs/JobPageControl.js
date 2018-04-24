// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
} from 'react-native';
import JobPageMenu from './JobPageMenu';


class JobPageControl extends Component {
  constructor(props) {
    super(props);

    this.state = {
      idx: this.props.selectedSegment || 0,
    };

    this.handleSelectSegment = this.handleSelectSegment.bind(this);
    this._refs = [];
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.selectedSegment === 'number' &&
        nextProps.selectedSegment !== this.state.idx) {
      this.setState({idx: nextProps.selectedSegment});
    }
  }

  render() {
    const segments = [];
    const content = React.Children.map(this.props.children, (child, idx) => {
      segments.push(child.props.title);
      if (idx === this.state.idx) {
        return React.cloneElement(child, {
          ref: (ref) => {this._refs[idx] = ref;},
          style: styles.listView,
        });
      }
    });
    var menuHeader;
    if (segments.length > 1) {
      menuHeader = (
        <JobPageMenu
          values={segments}
          selectedIndex={this.state.idx}
          onChange={this.handleSelectSegment}
        />
      );
    }
    return (
      <View style={styles.container}>
        {menuHeader}
        {content}
      </View>
    );
  }

  handleSelectSegment(idx) {
    if (this.state.idx !== idx) {
      const {onSegmentChange} = this.props;
      this.setState({idx}, () => onSegmentChange && onSegmentChange(idx));
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listView: {
    flex: 1,
  },
  viewPager: {
    backgroundColor: 'white',
  },
});

module.exports = JobPageControl;
