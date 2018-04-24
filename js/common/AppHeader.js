// @flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  Image,
  ToolbarAndroid,
} from 'react-native';
import AppColors from './AppColors';
import _ from 'lodash';

class AppHeaderAndroid extends React.Component {
  constructor(props) {
    super(props);

    this.handleShowMenu = this.handleShowMenu.bind(this);
  }

  render() {
    const {rightItem, extraItems} = this.props;
    let actions = [];
    var leftItem = this.props.leftItem;
    if (!leftItem && Platform.OS === 'android') {
      leftItem = {
        title: 'Menu',
        icon: this.context.hasUnreadNotifications
          ? require('./img/hamburger-unread.png')
          : require('./img/hamburger.png'),
        onPress: this.handleShowMenu,
      };
    }

    if (rightItem) {
      const {title, icon, layout} = rightItem;
      actions.push({
        icon: layout !== 'title' ? icon : undefined,
        title: title,
        show: 'always',
      });
    }
    if (extraItems) {
      actions = actions.concat(extraItems.map((item) => ({
        title: item.title,
        show: 'never',
      })));
    }

    let content;
    if (React.Children.count(this.props.children) > 0) {
      content = (
        <View collapsable={false} style={{flexGrow: 1}}>
          {this.props.children}
        </View>
      );
    }

    return (
      <View style={[styles.toolbarContainer, this.props.style]}>
        <ToolbarAndroid
          navIcon={leftItem && leftItem.icon}
          onIconClicked={leftItem && leftItem.onPress}
          title={this.props.title}
          actions={actions}
          onActionSelected={this.handleActionSelected.bind(this)}
          style={styles.toolbar} />
        {content}
      </View>
    );
  }

  handleShowMenu() {
    this.context.openDrawer();
  }

  handleActionSelected(position: number) {
    let items = this.props.extraItems || [];
    if (this.props.rightItem) {
      items = [this.props.rightItem, ...items];
    }
    const item = items[position];
    item && item.onPress && item.onPress();
  }
}

AppHeaderAndroid.contextTypes = {
  openDrawer: React.PropTypes.func,
  hasUnreadNotifications: React.PropTypes.bool,
};

class AppHeaderIOS extends Component {
  render() {
    const {leftItem, title, rightItem} = this.props;

    const content = React.Children.count(this.props.children) === 0
      ? null
      : this.props.children;

    return (
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <View style={styles.leftItem}>
            <ItemWrapperIOS color={AppColors.actionText} item={leftItem} />
          </View>
          <View
            accessible={true}
            accessibilityLabel={title}
            accessibilityTraits="header"
            style={styles.centerItem}>
            <Text style={styles.titleText}>
              {_.truncate(title, {'length': 18})}
            </Text>
          </View>
          <View style={styles.rightItem}>
            <ItemWrapperIOS color={AppColors.actionText} item={rightItem} />
          </View>
        </View>
        {content}
      </View>
    );
  }
}

class ItemWrapperIOS extends Component {
  render() {
    const {item, color} = this.props;
    if (!item) {
      return null;
    }

    let content;
    const {title, icon, layout, onPress} = item;

    if (layout !== 'icon' && title) {
      content = (
        <Text style={[styles.itemText, {color}]}>
          {title}
        </Text>
      );
    } else if (icon) {
      content = <Image source={icon} />;
    }

    return (
      <TouchableOpacity
        accessibilityLabel={title}
        accessibilityTraits="button"
        onPress={onPress}
        style={styles.itemWrapper}>
        {content}
      </TouchableOpacity>
    );
  }
}



const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : 25;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 44 + STATUS_BAR_HEIGHT : 56 + STATUS_BAR_HEIGHT;

const styles = StyleSheet.create({
  toolbarContainer: {
    paddingTop: STATUS_BAR_HEIGHT,
    backgroundColor: AppColors.headerBackground,
    elevation: 2,
  },
  toolbar: {
    height: HEADER_HEIGHT - STATUS_BAR_HEIGHT,
  },
  headerWrap: {
    backgroundColor: AppColors.headerBackground,
    borderBottomWidth: 1,
    borderColor: AppColors.cellBorder,
  },
  header: {
    paddingTop: STATUS_BAR_HEIGHT,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  leftItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerItem: {
    flex: 2,
    alignItems: 'center',
  },
  rightItem: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemWrapper: {
    padding: 11,
  },
  itemText: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

const Header = Platform.OS === 'ios' ? AppHeaderIOS : AppHeaderAndroid;
Header.height = HEADER_HEIGHT;

module.exports = Header;
