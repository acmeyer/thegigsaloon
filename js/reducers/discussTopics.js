//@flow
'use strict';

function discussTopics(state = [], action) {
  if (action.type === 'LOADED_DISCUSS_TOPICS') {
    let list = action.list.map(fromParseObject);
    return list;
  }
  return state;
}

function fromParseObject(object) {
  return {
    id: object.id,
    displayName: object.get('displayName'),
    topic: object.get('topic'),
    icon: object.get('icon') && object.get('icon').url(),
    keywords: object.get('keywords'),
  };
}

module.exports = discussTopics;
