//@flow
'use strict';

import React, {Component} from 'React';
import AppColors from '../../common/AppColors';
import AppHeader from '../../common/AppHeader';
import {Heading1} from '../../common/AppText';
import {createStylesheet} from '../../common/AppStyleSheet';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import {selectPostsTopic} from '../../actions';

import { connect } from 'react-redux';

class DiscussView extends Component {
  constructor(props) {
    super(props);

    this.showPostList = this.showPostList.bind(this);
  }

  render() {
    let header;
    if (Platform.OS === 'android') {
      header = (
        <AppHeader
          title="Discuss"
        />
      );
    }
    var topicList = [];
    this.props.topics.forEach((topic) => {
      topicList.push(<Topic topic={topic} key={topic.id} showPostList={this.showPostList} />);
    });
    return (
      <View style={styles.container}>
        {header}
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollview}>
          <Heading1 style={styles.title}>What are you interested in?</Heading1>
          <View style={styles.topicsList}>
            {topicList}
          </View>
        </ScrollView>
      </View>
    );
  }

  showPostList(topic) {
    this.props.dispatch(selectPostsTopic(topic.topic));
    this.props.navigator.push({postsList: true, discussTopic: topic});
  }
}

class Topic extends Component {
  render() {
    let icon = this.props.topic.icon;
    let topic = this.props.topic;
    return (
      <TouchableOpacity style={styles.topic} onPress={() => this.props.showPostList(topic)}>
        <View style={styles.topicWrap}>
          <Image source={{uri: icon}} style={styles.topicIcon} />
          <Text style={styles.topicLabel}>{this.props.topic.displayName}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const SCREEN_WIDTH = Dimensions.get('window').width;

var styles = createStylesheet({
  container: {
    flex: 1,
    backgroundColor: AppColors.tableViewBackground,
  },
  scrollview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    paddingVertical: 35,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topic: {
    height: 125,
    width: SCREEN_WIDTH / 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicIcon: {
    height: 60,
    width: 60,
    marginTop: 10,
  },
  topicWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicLabel: {
    fontSize: 17,
    paddingVertical: 10,
    color: AppColors.darkText,
  },
});

function select(store) {
  return {
    user: store.user,
    topics: store.discussTopics,
  };
}

module.exports = connect(select)(DiscussView);
