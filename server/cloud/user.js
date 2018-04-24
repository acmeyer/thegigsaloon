'use strict';
/* global Parse */

import {fromParsePosts, fromParseComments, fromParseUser, fromParseReviews, fromParseArticles} from './fromParseObjects';
import NodeGeocoder from 'node-geocoder';
let geocoder = NodeGeocoder({
  provider: 'google',
  apiKey: process.env.GOOGLE_API_KEY
});
import {sendWelcomeEmail} from './emails';

const PER_PAGE = 100;

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
  if (request.object.get('allowMyPostNotifications') === undefined) {
    request.object.set('allowMyPostNotifications', true);
  }
  if (request.object.get('allowLikedPostNotifications') === undefined) {
    request.object.set('allowLikedPostNotifications', true);
  }
  if (request.object.get('allowCommentedPostNotifications') === undefined) {
    request.object.set('allowCommentedPostNotifications', true);
  }
  if (request.object.get('allowMyCommentNotifications') === undefined) {
    request.object.set('allowMyCommentNotifications', true);
  }
  if (request.object.get('allowLikedReviewsNotifications') === undefined) {
    request.object.set('allowLikedReviewsNotifications', true);
  }
  if (request.object.get('allowLikedArticlesNotifications') === undefined) {
    request.object.set('allowLikedArticlesNotifications', true);
  }
  response.success();
});

Parse.Cloud.afterSave(Parse.User, function(request, response) {
  if (!request.object.existed()) {
    sendWelcomeEmail(request.object);
  }

  response.success();
});

Parse.Cloud.define('sync_post_likes', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.success([]);
  }

  var likedPosts = [];
  var page = request.params.page;
  var more = false;
  user.relation('postsLiked').query()
    .include('author')
    .descending('createdAt')
    .limit((page + 1) * PER_PAGE)
    .skip(page * PER_PAGE)
    .find()
    .then(
      function(posts) {
        likedPosts = posts.map(fromParsePosts);
        return response.success({
          posts: likedPosts,
          morePosts: more,
          page: page,
        });
      },
      function(error) { response.error(error);}
    );
});

Parse.Cloud.define('sync_review_likes', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.success([]);
  }

  var likedReviews = [];
  var page = request.params.page;
  var more = false;
  user.relation('reviewsLiked').query()
    .include('author')
    .include('gig')
    .descending('createdAt')
    .limit((page + 1) * PER_PAGE)
    .skip(page * PER_PAGE)
    .find()
    .then(
      function(reviews) {
        likedReviews = reviews.map(fromParseReviews);
        return response.success({
          reviews: likedReviews,
          moreReviews: more,
          page: page,
        });
      },
      function(error) { response.error(error);}
    );
});

Parse.Cloud.define('sync_article_likes', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.success([]);
  }

  var likedArticles = [];
  var page = request.params.page;
  var more = false;
  user.relation('articlesLiked').query()
    .descending('createdAt')
    .limit((page + 1) * PER_PAGE)
    .skip(page * PER_PAGE)
    .find()
    .then(
      function(articles) {
        likedArticles = articles.map(fromParseArticles);
        return response.success({
          articles: likedArticles,
          moreArticles: more,
          page: page,
        });
      },
      function(error) { response.error(error);}
    );
});

Parse.Cloud.define('load_user', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.error('No user!');
  }

  return response.success(fromParseUser(user));
});

Parse.Cloud.define('load_user_gigs', function (request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.error('No user!');
  }

  user.relation('gigs').query()
    .find()
    .then(
      function(gigs) {
        gigs = gigs.map((gig) => gig.id);
        return response.success(gigs);
      },
      function(error) { response.error(error);}
    );
});

Parse.Cloud.define('load_user_gig_notifications', function (request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.error('No user!');
  }

  var notifications = [];
  if (user.get('notificationChannels')) {
    notifications = user.get('notificationChannels').filter((channel) => {
      return channel.indexOf('job_') !== -1;
    }).map((channel) => {
      return channel.replace('job_', '');
    });
  }
  response.success(notifications);
});

Parse.Cloud.define('load_user_gigs_following', function (request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.error('No user!');
  }

  user.relation('gigsFollowing').query()
  .find()
  .then(
    function(gigs) {
      gigs = gigs.map((gig) => gig.id);
      return response.success(gigs);
    },
    function(error) { response.error(error);}
  );
});

Parse.Cloud.define('sync_comment_likes', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.success([]);
  }

  var likedComments = [];
  var page = request.params.page;
  var more = false;
  user.relation('commentsLiked').query()
    .include('author')
    .descending('createdAt')
    .limit((page + 1) * PER_PAGE)
    .skip(page * PER_PAGE)
    .find()
    .then(
      function(comments) {
        likedComments = comments.map(fromParseComments);
        return response.success({
          comments: likedComments,
          moreComments: more,
          page: page,
        });
      },
      function(error) { response.error(error);}
    );
});

Parse.Cloud.define('update_user', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.error('No user!');
  }

  var userData = request.params.userData;
  if (userData.name) {
    user.set('name', userData.name);
  }
  if (userData.email) {
    user.set('email', userData.email);
  }
  if (userData.birthMonth || userData.birthMonth === '') {
    user.set('birthMonth', userData.birthMonth);
  }
  if (userData.birthDay || userData.birthDay === '') {
    user.set('birthDay', userData.birthDay);
  }
  if (userData.birthYear || userData.birthYear === '') {
    user.set('birthYear', userData.birthYear);
  }
  if (userData.postalCode || userData.postalCode === '') {
    user.set('postalCode', userData.postalCode);
  }
  if (userData.phoneNumber || userData.phoneNumber === '') {
    user.set('phoneNumber', userData.phoneNumber);
  }

  var waitFor;
  if (userData.photoData && userData.photoName) {
    var imageFile = new Parse.File(userData.photoName, { base64: userData.photoData});
    waitFor = imageFile.save().then(() => user.set('profilePicture', imageFile));
  } else {
    waitFor = Parse.Promise.resolve(undefined);
  }

  waitFor.then(() => {
    return lookupCity(userData.postalCode).then((city) => {
      if (userData.postalCode) {
        user.set('city', city);
      }
      return user.save();
    });
  }).then((result) => {
    response.success({
      name: result.get('name'),
      profilePicture: result.get('profilePicture') && result.get('profilePicture').url(),
      email: result.get('email'),
      birthMonth: result.get('birthMonth'),
      birthDay: result.get('birthDay'),
      birthYear: result.get('birthYear'),
      postalCode: result.get('postalCode'),
      city: result.get('city'),
      phoneNumber: result.get('phoneNumber'),
    });
  }).catch((error) => {
    response.error(error);
  });
});

Parse.Cloud.define('user_posts', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.success([]);
  }

  var page = request.params.page;
  var posts = [];
  var more = false;
  var query = new Parse.Query('Post')
    .equalTo('author', user)
    .include('author')
    .descending('createdAt')
    .limit((page + 1) * PER_PAGE)
    .skip(page * PER_PAGE);
  query.find().then(function(userPosts) {
    more = userPosts.length === PER_PAGE ? true : false;
    page = userPosts.length === 0 ? page - 1 : page;
    posts = userPosts.map(fromParsePosts);
  }).then(
    function(value) {
      response.success({
        posts: posts,
        morePosts: more,
        page: page,
      });
    },
    function(error) { response.error(error); }
  );
});

Parse.Cloud.define('user_comments', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.success([]);
  }

  var page = request.params.page;
  var comments = [];
  var more = false;
  var query = new Parse.Query('Comment')
    .equalTo('author', user)
    .include('author')
    .descending('createdAt')
    .limit((page + 1) * PER_PAGE)
    .skip(page * PER_PAGE);
  query.find().then(function(userComments) {
    more = userComments.length === PER_PAGE ? true : false;
    page = userComments.length === 0 ? page - 1 : page;
    comments = userComments.map(fromParseComments);
  }).then(
    function(value) {
      response.success({
        comments: comments,
        moreComments: more,
        page: page,
      });
    },
    function(error) { response.error(error); }
  );
});

Parse.Cloud.define('user_reviews', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.success([]);
  }

  var page = request.params.page;
  var reviews = [];
  var more = false;
  var query = new Parse.Query('Review')
    .equalTo('author', user)
    .include('author')
    .include('gig')
    .descending('createdAt')
    .limit((page + 1) * PER_PAGE)
    .skip(page * PER_PAGE);
  query.find().then(function(userReviews) {
    more = userReviews.length === PER_PAGE ? true : false;
    page = userReviews.length === 0 ? page - 1 : page;
    reviews = userReviews.map(fromParseReviews);
  }).then(
    function(value) {
      response.success({
        reviews: reviews,
        moreReviews: more,
        page: page,
      });
    },
    function(error) { response.error(error); }
  );
});

Parse.Cloud.define('user_articles', function(request, response) {
  Parse.Cloud.useMasterKey();

  var user = request.user;
  if (!user) {
    return response.success([]);
  }

  var page = request.params.page;
  var articles = [];
  var more = false;
  var query = new Parse.Query('Article')
    .equalTo('submittedBy', user)
    .include('submittedBy')
    .descending('createdAt')
    .limit((page + 1) * PER_PAGE)
    .skip(page * PER_PAGE);
  query.find().then(function(userArticles) {
    more = userArticles.length === PER_PAGE ? true : false;
    page = userArticles.length === 0 ? page - 1 : page;
    articles = userArticles.map(fromParseArticles);
  }).then(
    function(value) {
      response.success({
        articles: articles,
        moreArticles: more,
        page: page,
      });
    },
    function(error) { response.error(error); }
  );
});

function lookupCity(postalCode) {
  return geocoder.geocode('postal code: ' + postalCode).then(
    function(results) {
      var city = '';
      if (results[0]) {
        city = results[0].city;
      }

      return city;
    },
    function(error) {
      console.log('lookup error', error);
      return '';
    }
  );
}
