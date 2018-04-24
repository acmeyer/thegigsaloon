//@flow
'use strict';

import _ from 'lodash';

function postsForTopicSorted(posts, topic) {
  switch (topic) {
    case 'popular':
      return _.orderBy(posts, ['overallLikes', 'likeCount', 'sourceLikeCount', 'commentsCount', 'sourceCommentCount', 'actualCreatedAt', 'createdAt'], ['desc', 'desc', 'desc', 'desc', 'desc', 'desc', 'desc']);
    default:
      return _.orderBy(posts, ['actualCreatedAt', 'createdAt'], ['desc', 'desc']);
  }
}

module.exports = {postsForTopicSorted};
