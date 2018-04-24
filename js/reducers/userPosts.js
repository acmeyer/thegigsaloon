//@flow
'use strict';

const initialState = {
  list: [],
  moreResults: false,
};

function userPosts(state = initialState, action) {
  if (action.type === 'LOADED_USER_POSTS') {
    let {posts, morePosts, page} = action.data;
    let postList = posts;
    let initialFetch = page === 0 ? true : false;
    if (!initialFetch) {
      postList = state.list.concat(postList);
    }
    return {
      moreResults: morePosts,
      list: postList,
    };
  }
  if (action.type === 'POST_LIKED') {
    let thePostList = state.list.map((post) => {
      if (post.id === action.post.id) {
        return Object.assign({}, post, {
          likeCount: post.likeCount + 1,
          overallLikes: post.overallLikes + 1,
        });
      }
      return post;
    });
    return {
      ...state,
      list: thePostList,
    };
  }
  if (action.type === 'POST_UNLIKED') {
    let updatedPostList = state.list.map((post) => {
      if (post.id === action.post.id) {
        return Object.assign({}, post, {
          likeCount: post.likeCount - 1,
          overallLikes: post.overallLikes - 1,
        });
      }
      return post;
    });
    return {
      ...state,
      list: updatedPostList,
    };
  }
  if (action.type === 'LOGGED_OUT') {
    return {
      list: [],
      moreResults: false,
    };
  }
  return state;
}

module.exports = userPosts;
