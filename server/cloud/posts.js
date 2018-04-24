'use strict';
/* global Parse */

const Post = Parse.Object.extend('Post');
import fetch from 'isomorphic-fetch';
import {fromParsePosts} from './fromParseObjects';
import {sendPostLikedNotification} from './notifications';
import {setTag} from './tags';

// Cloud callbacks
//--------------------
Parse.Cloud.beforeSave('Post', function(request, response) {
  if (!request.object.get('likeCount')) {
    request.object.set('likeCount', 0);
  }
  if (!request.object.get('commentsCount')) {
    request.object.set('commentsCount', 0);
  }
  if (request.object.get('sourceLikeCount')) {
    let count = request.object.get('sourceLikeCount') + request.object.get('likeCount');
    request.object.set('overallLikes', count);
  } else {
    request.object.set('overallLikes', request.object.get('likeCount'));
  }


  response.success();
});

Parse.Cloud.afterSave('Post', function(request, response) {
  Parse.Cloud.useMasterKey();

  if (!request.object.get('actualCreatedAt')) {
    if (request.object.get('sourceCreatedAt')) {
      request.object.set('actualCreatedAt', new Date(request.object.get('sourceCreatedAt') * 1000));
    } else {
      request.object.set('actualCreatedAt', request.object.get('createdAt'));
    }
    request.object.save();
  } else {
    var tags = request.object.get('tags');
    if (tags && tags.length > 0) {
      tags.forEach(setTag);
    }
  }
});

Parse.Cloud.afterDelete('Post', function(request) {
  var query = new Parse.Query('Comment');
  query.equalTo('post', request.object);
  query.find({
    success: function(comments) {
      Parse.Object.destroyAll(comments, {
        success: function() {},
        error: function(error) {
          console.error('Error deleting related comments ' + error.code + ': ' + error.message);
        }
      });
    },
    error: function(error) {
      console.error('Error finding related comments ' + error.code + ': ' + error.message);
    }
  });
});

// Importing posts from outside sources
//--------------------
const subreddits = [
  'postmates',
  'doordash',
  'InstacartShoppers',
  'lyftdrivers',
  'UberDriver',
  'uberdrivers',
];

const filteredTerms = [];

Parse.Cloud.job('import_posts', function(request, status) {
  Parse.Cloud.useMasterKey();

  status.message('Importing posts...');

  Parse.Promise.all([subreddits.forEach(fetchSubreddit)])
  .then(() => status.success('Finished importing posts'))
  .catch((error) => status.error(error.message));
});

function notAppropriate(text) {
  var notgood = false;
  filteredTerms.forEach((term) => {
    if (text.toLowerCase().includes(term)) {
      notgood = true;
    }
  });
  return notgood;
}

async function fetchSubreddit(subreddit) {
  fetch(`http://www.reddit.com/r/${subreddit}.json`)
  .then(result => result.json())
  .then(json => {
    json.data.children.map(child => {
      var query = new Parse.Query('Post');
      if (child.data.over_18 || child.data.banned_by || notAppropriate(child.data.selftext) || notAppropriate(child.data.title)) {
        return Parse.Promise.as();
      }
      query.equalTo('sourceId', child.data.id).find().then(
        function(posts) {
          var post;
          if (posts.length > 0) {
            post = posts[0];
          } else {
            post = new Post();
          }
          post.set('sourceData', child.data);
          post.set('text', child.data.selftext);
          post.set('title', child.data.title);
          post.set('sourceId', child.data.id);
          var re = /(https?:\/\/[^ ]*\.(?:gif|png|jpg|jpeg))/;
          if (re.test(child.data.url)) { // filter for image urls only
            post.set('photoUrl', child.data.url);
          } else if (child.data.preview && child.data.preview.images[0]) {
            post.set('photoUrl', child.data.preview.images[0].source.url);
          } else if (!child.data.url.includes('www.reddit.com/r/' + subreddit)) {
            post.set('text', child.data.url + '\n\n' + child.data.selftext);
          }
          post.set('source', 'reddit');
          post.set('sourceCommentCount', child.data.num_comments);
          post.set('sourceLikeCount', child.data.score);
          post.set('sourceAuthor', child.data.author);
          post.set('sourceUrl', 'https://www.reddit.com' + child.data.permalink);
          post.set('sourceCreatedAt', child.data.created_utc);
          switch (subreddit) {
            case 'postmates':
              post.addUnique('tags', 'postmates');
              break;
            case 'doordash':
              post.addUnique('tags', 'doordash');
              break;
            case 'InstacartShoppers':
              post.addUnique('tags', 'instacart');
              break;
            case 'lyftdrivers':
              post.addUnique('tags', 'lyft');
              break;
            case 'UberDriver':
              post.addUnique('tags', 'uber');
              break;
            case 'uberdrivers':
              post.addUnique('tags', 'uber');
              break;
          }
          return post.save();
        },
        function(error) {
          console.log('error: ' + error.message);
          return Parse.Promise.error(error);
        }
      );
    });
  });
}

// Custom functions
//--------------------
Parse.Cloud.define('load_post', function(request, response) {
  Parse.Cloud.useMasterKey();

  var query = new Parse.Query('Post');
  query.include('author').get(request.params.postId)
    .then(
      function(post) {
        response.success(fromParsePosts(post));
      },
      function(error) {
        response.error(null);
      }
    );
});

Parse.Cloud.define('liked_post', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.error('No user!');
  }

  var query = new Parse.Query('Post');
  query.get(request.params.postId, {
    success: function(post) {
      if (user.id !== post.get('author').id) {
        sendPostLikedNotification(post);
      }
      response.success();
    },
    error: (error) => response.error(error.message)
  });
});
