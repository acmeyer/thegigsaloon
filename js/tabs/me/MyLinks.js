//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Image,
  Platform,
} from 'react-native';
import ItemsWithSeparator from '../../common/ItemsWithSeparator';
import AppColors from '../../common/AppColors';

const TAB_BAR_SPACE = Platform.OS === 'ios' ? 49 : 0;
const extraSpace = Platform.OS === 'ios' ? {marginBottom: 20} : {paddingBottom: 20};

class MyLinks extends Component {
  constructor(props) {
    super(props);

    this.showAccountDetail = this.showAccountDetail.bind(this);
  }

  render() {
    let postLinks = [{
      title: 'My Posts',
      type: 'myPosts',
    },
    {
      title: 'Liked Posts',
      type: 'likedPosts',
    }];
    let commentLinks = [{
      title: 'My Comments',
      type: 'myComments',
    },
    {
      title: 'Liked Comments',
      type: 'likedComments',
    }];
    let reviewLinks = [{
      title: 'My Reviews',
      type: 'myReviews',
    },
    {
      title: 'Liked Reviews',
      type: 'likedReviews',
    }];
    let newsLinks = [{
      title: 'My News Items',
      type: 'myArticles',
    },
    {
      title: 'Liked News Items',
      type: 'likedArticles',
    }];
    return (
      <View style={[{paddingBottom: TAB_BAR_SPACE}, extraSpace]}>
        <LinksSection title="Posts" links={postLinks} handlePress={this.showAccountDetail} />
        <LinksSection title="Comments" links={commentLinks} handlePress={this.showAccountDetail} />
        <LinksSection title="Reviews" links={reviewLinks} handlePress={this.showAccountDetail} />
        <LinksSection title="News Items" links={newsLinks} handlePress={this.showAccountDetail} />
      </View>
    );
  }

  showAccountDetail(type) {
    this.props.navigator.push({ accountDetailsList: true, type: type });
  }
}

class LinksSection extends Component {
  render() {
    let {handlePress} = this.props;
    let content = this.props.links.map(
      (link) => <Row link={link} key={link.title} handlePress={handlePress} />
    );
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {this.props.title.toUpperCase()}
          </Text>
        </View>
        <ItemsWithSeparator separatorStyle={styles.separator}>
          {content}
        </ItemsWithSeparator>
      </View>
    );
  }
}

class Row extends Component {
  render() {
    var {title, type} = this.props.link;
    return (
      <TouchableHighlight onPress={() => this.props.handlePress(type)}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Image source={require('../../common/img/disclosure.png')} />
        </View>
      </TouchableHighlight>
    );
  }
}

var styles = StyleSheet.create({
  separator: {
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 17,
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    paddingVertical: 5,
    fontSize: 13,
    color: AppColors.inactiveText,
  },
});

module.exports = MyLinks;
