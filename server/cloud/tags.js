'use strict';
/* global Parse */

const Tag = Parse.Object.extend('Tag');

// Parse.Cloud.job('tag_articles', function(request, status) {
//   Parse.Cloud.useMasterKey();
//
//   status.message('Tagging articles...');
//
//   new Parse.Query('Article')
//   .notEqualTo('hasSetTags', true).find()
//   .then((results) => Parse.Promise.when(results.forEach(addTagsToArticle)))
//   .then(() => status.success('Finished tagging articles.'))
//   .catch((error) => status.error(error.message));
// });
//
// Parse.Cloud.job('tag_posts', function(request, status) {
//   Parse.Cloud.useMasterKey();
//
//   status.message('Tagging posts...');
//
//   new Parse.Query('Post')
//   .notEqualTo('hasSetTags', true).find()
//   .then((results) => Parse.Promise.when(results.forEach(addTagsToPost)))
//   .then(() => status.success('Finished tagging posts.'))
//   .catch((error) => status.error(error.message));
// });


// function addTagsToArticle(article) {
//   var title = article.get('title');
//   var text = article.get('description');
//   return getTags(title, article).then(() => {
//     return article.save();
//   }).then(() => {
//     return getTags(text, article);
//   }).then(() => {
//     return article.save();
//   }).catch((error) => {
//     return error;
//   });
// }
//
// function addTagsToPost(post) {
//   var title = post.get('title');
//   var text = post.get('text');
//   return getTags(title, post).then(() => {
//     return post.save();
//   }).then(() => {
//     return getTags(text, post);
//   }).then(() => {
//     return post.save();
//   }).catch((error) => {
//     return error;
//   });
// }

function setTag(tag) {
  var query = new Parse.Query('Tag');
  return query.equalTo('canonicalName', tag.toLowerCase()).find().then((results) => {
    if (results.length > 0) {
      return Parse.Promise.as();
    } else {
      var newTag = new Tag({
        name: tag,
        canonicalName: tag.toLowerCase()
      });
      return newTag.save();
    }
  }).catch((error) => {
    return Parse.Promise.error(error);
  });
}

// async function getTags(text, obj) {
//   var promise = new Parse.Promise();
//   obj.set('hasSetTags', true);
//   if (!text || typeof text !== 'string') {return promise.resolve();}
//   // languageClient.detectEntities(text, (err, entities) => {
//   //   if (err) {
//   //     console.log('error', err);
//   //     return promise.reject();
//   //   }
//   //   if (entities) {
//   //     Object.keys(entities).forEach((key) => {
//   //       entities[key].forEach((value) => {
//   //         obj.addUnique('tags', value.toLowerCase());
//   //       });
//   //     });
//   //   }
//   //   return promise.resolve();
//   // });
//   return Parse.Promise.when([promise]);
// }

module.exports = {setTag};
