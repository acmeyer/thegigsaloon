//@flow
'use strict';

import _ from 'lodash';

function findTopicById(id, topics) {
  if (!id) {
    return null;
  }
  var topic = _.find(topics, (t) => { t.id === id; });
  return topic;
}

module.exports = findTopicById;
