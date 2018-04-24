//@flow
'use strict';

import React, {Component} from 'React';
import {
  View,
  StyleSheet,
} from 'react-native';
import AppHeader from './AppHeader';
import AppColors from './AppColors';
import AppSegmentedControl from './AppSegmentedControl';
import ViewPager from './ViewPager';

class ListContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      idx: this.props.selectedSegment || 0,
    };

    this.handleSelectSegment = this.handleSelectSegment.bind(this);
    this._refs = [];
  }

  render() {
    const segments = [];
    const content = React.Children.map(this.props.children, (child, idx) => {
      segments.push(child.props.title);
      return React.cloneElement(child, {
        ref: (ref) => {this._refs[idx] = ref;},
        onScroll: (e) => this.handleScroll(idx, e),
        style: styles.listView,
        showsVerticalScrollIndicator: false,
        scrollEventThrottle: 16,
        contentInset: {bottom: 49, top: 0},
        automaticallyAdjustContentInsets: false,
        renderHeader: this.renderHeader,
        scrollsToTop: idx === this.state.idx,
      });
    });

    var segmentsHeader;
    if (segments.length > 1) {
      segmentsHeader = (
        <View style={styles.segmentedControl}>
          <AppSegmentedControl
            values={segments}
            selectedIndex={this.state.idx}
            selectionColor={this.props.selectedSectionColor}
            onChange={this.handleSelectSegment}
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <AppHeader
          title={this.props.title}
          rightItem={this.props.rightItem}
          extraItems={this.props.extraItems}
        >
          {segmentsHeader}
        </AppHeader>
        <ViewPager
          style={styles.viewPager}
          count={segments.length}
          selectedIndex={this.state.idx}
          onSelectedIndexChange={this.handleSelectSegment}>
          {content}
        </ViewPager>
      </View>
    );
  }

  handleScroll(idx: number, e: any) {
    if (idx !== this.state.idx) {
      return;
    }
    let y = 0;
    this._refs.forEach((ref, ii) => {
      if (ii !== idx && ref) {
        ref.scrollTo && ref.scrollTo({y, animated: false});
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.selectedSegment === 'number' &&
        nextProps.selectedSegment !== this.state.idx) {
      this.setState({idx: nextProps.selectedSegment});
    }
  }

  handleSelectSegment(idx: number) {
    if (this.state.idx !== idx) {
      const {onSegmentChange} = this.props;
      this.setState({idx}, () => onSegmentChange && onSegmentChange(idx));
    }
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewPager: {
    backgroundColor: 'white',
  },
  segmentedControl: {
    marginTop: -2,
    backgroundColor: AppColors.headerBackground,
  },
});

module.exports = ListContainer;
