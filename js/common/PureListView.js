// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  ListView,
  Platform,
} from 'react-native';
import AppColors from './AppColors';

// FIXME: Android has a bug when scrolling ListView the view insertions
// will make it go reverse. Temporary fix - pre-render more rows
const LIST_VIEW_PAGE_SIZE = Platform.OS === 'android' ? 20 : 1;

// Extra height to adjust scroll view in case of tabbar;
const EXTRA_HEIGHT = Platform.OS === 'ios' ? 44 : 0;

class PureListView extends Component {
  constructor(props) {
    super(props);
    let dataSource = new ListView.DataSource({
      getRowData: (dataBlob, sid, rid) => dataBlob[sid][rid],
      getSectionHeaderData: (dataBlob, sid) => dataBlob[sid],
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });

    this.state = {
      contentHeight: 0,
      dataSource: cloneWithData(dataSource, props.data),
    };

    this.renderFooter = this.renderFooter.bind(this);
    this.onContentSizeChange = this.onContentSizeChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.setState({
        dataSource: cloneWithData(this.state.dataSource, nextProps.data),
      });
    }
  }

  render() {
    const {contentInset, tabBarSpace} = this.props;
    const bottomPadding = tabBarSpace ? EXTRA_HEIGHT : 0;
    const bottom = contentInset.bottom + bottomPadding;
    return (
      <ListView
        initialListSize={10}
        pageSize={LIST_VIEW_PAGE_SIZE}
        {...this.props}
        ref="listview"
        dataSource={this.state.dataSource}
        renderFooter={this.renderFooter}
        contentInset={{bottom, top: contentInset.top}}
        automaticallyAdjustContentInsets={false}
        enableEmptySections={true}
      />
    );
  }

  onContentSizeChange(contentWidth, contentHeight) {
    if (contentHeight !== this.state.contentHeight) {
      this.setState({contentHeight});
    }
  }

  scrollTo(...args) {
    this.refs.listview.scrollTo(...args);
  }

  getScrollResponder() {
    return this.refs.listview.getScrollResponder();
  }

  renderFooter() {
    if (this.state.dataSource.getRowCount() === 0) {
      return this.props.renderEmptyList && this.props.renderEmptyList();
    }

    return this.props.renderFooter && this.props.renderFooter();
  }
}

PureListView.defaultProps = {
  data: [],
  contentInset: { top: 0, bottom: 0 },
  renderSeparator: (sectionID, rowID) => <View style={styles.separator} key={rowID} />,
};

function cloneWithData(dataSource, data) {
  if (!data) {
    return dataSource.cloneWithRows([]);
  }
  if (Array.isArray(data)) {
    return dataSource.cloneWithRows(data);
  }
  return dataSource.cloneWithRowsAndSections(data);
}

const styles = StyleSheet.create({
  separator: {
    backgroundColor: AppColors.cellBorder,
    height: 1,
  },
});

module.exports = PureListView;
