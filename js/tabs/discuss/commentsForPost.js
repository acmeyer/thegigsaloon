//@flow
'use strict';

function commentsForPost(comments, postId) {
  return comments.filter((comment) => {
    return comment.postId === postId;
  });
}

module.exports = {commentsForPost};
