//@flow
'use strict';

import React, {Component} from 'React';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image,
  Platform,
} from 'react-native';
import AppColors from '../../common/AppColors';
import Share from 'react-native-share';
import moment from 'moment';
const { Crashlytics } = require('react-native-fabric');
const Mixpanel = require('react-native-mixpanel');

class ArticleCell extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageLoading: false
    };
  }

  render() {
    var likeImage = this.props.articleLiked
      ? <Image style={styles.footerIcon} source={require('../discuss/img/like_filled.png')} />
      : <Image style={styles.footerIcon} source={require('../discuss/img/like.png')} />;

    var authorAndTime, image, source;
    if (this.props.article.author) {
      authorAndTime = <Text style={styles.mutedText}>{this.props.article.author} | {moment(this.props.article.publishDate).format('MMM Do, YYYY')}</Text>;
    } else {
      authorAndTime = <Text style={styles.mutedText}>{moment(this.props.article.publishDate).format('MMM Do, YYYY')}</Text>;
    }
    if (this.props.article.imageUrl) {
      image = (
        <Image
          source={{uri: this.props.article.imageUrl}}
          style={[styles.image, this.state.imageLoading ? { backgroundColor: AppColors.gray } : {}]}
          onLoadStart={(e) => this.setState({imageLoading: true})}
          onLoad={(e) => this.setState({imageLoading: false})}
        />
      );
    }
    if (this.props.article.source) {
      source = <Text style={styles.mutedText}>{this.props.article.source.toUpperCase()}</Text>;
    }
    return (
      <TouchableHighlight onPress={this.props.onPress}>
        <View style={styles.cell}>
          <View style={styles.header}>
            {image}
            <View style={styles.metaContainer}>
              {source}
              <Text style={styles.title}>
                {this.props.article.title}
              </Text>
              <View style={styles.additionalInfo}>
                {authorAndTime}
              </View>
            </View>
          </View>
          <View style={styles.body}>
            <Text style={styles.text}>
              {this.props.article.description}
            </Text>
          </View>
          <View style={styles.footer}>
            <View style={styles.footerLikes}>
              <TouchableOpacity style={[styles.likes, this.props.articleLiked && styles.liked]} onPress={this.props.toggleLike}>
                {likeImage}
                <Text style={styles.footerText}>
                  {this.props.article.likeCount}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={this.shareArticle.bind(this)}>
              <Image source={require('../../common/img/share.png')} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  shareArticle() {
    Mixpanel.trackWithProperties('Tapped to share article', {article_id: this.props.article.id});
    Share.open({
      message: this.props.article.title + '\n\n' + this.props.article.description + '\n--\nvia The Gig Saloon app',
      url: this.props.article.url
    },(e) => {
      if (Platform.OS === 'ios') {
        Crashlytics.recordError('Failed to share article. Error: ' + e.message);
      } else {
        Crashlytics.logException('Failed to share article. Error: ' + e.message);
      }
    });
  }
}

const styles = StyleSheet.create({
  cell: {
    padding: 15,
    backgroundColor: 'white',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
  },
  metaContainer: {
    flex: 1,
  },
  mutedText: {
    fontSize: 11,
    color: AppColors.inactiveText,
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  additionalInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  image: {
    width: 75,
    height: 75,
    marginRight: 15,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  footerLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    height: 20,
    width: 20,
    marginRight: 5,
  },
  footerText: {
    color: AppColors.inactiveText,
    fontSize: 12,
  },
});

module.exports = ArticleCell;
