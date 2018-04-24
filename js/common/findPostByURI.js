//@flow
'use strict';

import {urlScheme} from '../env';
import {loadPost} from '../actions';

async function findPostByURI(uri) {
  if (!uri) {
    return null;
  }
  var post_id = uri.replace(urlScheme + 'post/', '');
  const post = await loadPost(post_id);
  return Promise.resolve(post);
}

module.exports = findPostByURI;
