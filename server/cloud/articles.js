'use strict';
/* global Parse */

var req = require('request');
var scrape = require('html-metadata');
import feedparser from 'feedparser-promised';
const Article = Parse.Object.extend('Article');
import {setTag} from './tags';
import {sendArticleLikedNotification} from './notifications';

// Add Google Alert feeds here for parsing and importing
// URLs are in the format: https://www.google.com/alerts/feeds/:feedid/:id
const newsFeeds = [
  '',
];

// Cloud callbacks
//--------------------
Parse.Cloud.beforeSave('Article', function(request, response) {
  if (!request.object.get('likeCount')) {
    request.object.set('likeCount', 0);
  }

  response.success();
});

Parse.Cloud.afterSave('Article', function(request, response) {
  Parse.Cloud.useMasterKey();

  if (!request.object.existed()) {
    // Add meta data if article is new
    parseFromUrl(request.object);
  } else {
    // Check for new tags
    var tags = request.object.get('tags');
    if (tags && tags.length > 0) {
      tags.forEach(setTag);
    }
  }
});

function parseFromUrl(obj) {
  var url = obj.get('url');
  if (url) {
    var scraperOptions =  {
      url: url,
      jar: req.jar(),
      headers: {
        'User-Agent': 'webscraper'
      }
    };
    // Extract metadta from url
    return scrape(scraperOptions).then(
      function(data) {
        var generalData = data.general;
        var ogData = data.openGraph;

        // Set the article data
        if (generalData.title && generalData.title !== '') {
          obj.set('title', generalData.title.trim());
        } else if (ogData.title && ogData.title !== '') {
          obj.set('title', ogData.title.trim());
        }
        if (generalData.author && generalData.author !== '') {
          obj.set('author', generalData.author.trim());
        } else if (ogData.author && ogData.author !== '') {
          obj.set('author', ogData.author.trim());
        }
        if (generalData.description && generalData.description !== '') {
          obj.set('description', generalData.description.trim());
        } else if (ogData.description && ogData.description !== '') {
          obj.set('description', ogData.description.trim());
        }
        if (generalData.site_name && generalData.site_name !== '') {
          obj.set('source', generalData.site_name.trim());
        } else if (ogData.site_name && ogData.site_name !== '') {
          obj.set('source', ogData.site_name.trim());
        }
        if (generalData.image && generalData.image.url && generalData.image.url !== '') {
          obj.set('imageUrl', generalData.image.url);
        } else if (ogData.image && ogData.image.url && ogData.image.url !== '') {
          obj.set('imageUrl', ogData.image.url);
        }
        if (generalData.published && generalData.published !== '') {
          obj.set('publishDate', new Date(generalData.published));
        } else if (generalData.date && generalData.date !== '') {
          obj.set('publishDate', new Date(generalData.date));
        } else if (ogData.published && ogData.published !== '') {
          obj.set('publishDate', new Date(ogData.published));
        } else {
          obj.set('publishDate', new Date());
        }

        return obj.save();
      },
      function(error) {
        if (!obj.get('title')) {
          return obj.destroy();
        }
      }
    );
  } else {
    return Parse.Promise.as();
  }
}

// Import articles
//--------------------
Parse.Cloud.job('import_news', function(request, status) {
  Parse.Cloud.useMasterKey();

  status.message('Importing news...');

  Parse.Promise.all([newsFeeds.forEach(importFeed)]).then(() => {
    status.success('Finished importing news');
  }).catch((error) => {
    status.error(error.message);
  });
});

function importFeed(feed) {
  return feedparser.parse(feed).then((items) => {
    items.forEach( (item) => {
      var url = item.link.split('url=')[1];
      url = url.split('&ct=')[0];
      importArticle(url);
    });
    return;
  }).catch((error) => {
    return error;
  });
}

async function importArticle(url) {
  var query = new Parse.Query('Article');
  query.equalTo('url', url).find().then(
    function(articles) {
      if (articles.length > 0) {
        return;
      } else {
        let newArticle = new Article();
        newArticle.set('url', url);
        return newArticle.save();
      }
    },
    function(error) {
      console.log('error: ' + error.message);
      return;
    }
  );
}

// Custom functions
//---------------------
Parse.Cloud.define('liked_article', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.error('No user!');
  }

  var query = new Parse.Query('Article');
  query.get(request.params.articleId, {
    success: function(article) {
      if (user.id !== article.get('submittedBy').id) {
        sendArticleLikedNotification(article);
      }
      response.success();
    },
    error: (error) => response.error(error.message)
  });
});
