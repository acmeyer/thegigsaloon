//@flow
'use strict';


function fromParseUser(user) {
  return {
    id: user.id,
    facebook_id: user.get('facebook_id'),
    profilePicture: user.get('profilePicture') && user.get('profilePicture').url(),
    name: user.get('name'),
  };
}

function fromParseComments(comment) {
  return {
    id: comment.id,
    text: comment.get('text'),
    postId: comment.get('post').id,
    author: comment.get('author') && fromParseUser(comment.get('author')),
    source: comment.get('source'),
    sourceAuthor: comment.get('sourceAuthor'),
    sourceUrl: comment.get('sourceUrl'),
    sourceCreatedAt: comment.get('sourceCreatedAt'),
    likeCount: comment.get('likeCount'),
    createdAt: comment.get('createdAt') && comment.get('createdAt').getTime(),
  };
}

function fromParsePosts(post) {
  return {
    id: post.id,
    title: post.get('title'),
    text: post.get('text'),
    photo: post.get('photo') && post.get('photo').url() || post.get('photoUrl'),
    author: post.get('author') && fromParseUser(post.get('author')),
    source: post.get('source'),
    sourceAuthor: post.get('sourceAuthor'),
    sourceUrl: post.get('sourceUrl'),
    sourceCreatedAt: post.get('sourceCreatedAt'),
    sourceCommentCount: post.get('sourceCommentCount'),
    commentsCount: post.get('commentsCount'),
    overallLikes: post.get('overallLikes'),
    likeCount: post.get('likeCount'),
    createdAt: post.get('createdAt') && post.get('createdAt').getTime(),
    actualCreatedAt: post.get('actualCreatedAt') && post.get('actualCreatedAt').getTime(),
  };
}

function fromParseJobs(job) {
  return {
    id: job.id,
    companyName: job.get('companyName'),
    companyLogo: job.get('companyLogo') && job.get('companyLogo').url(),
    jobType: job.get('jobType'),
    requirements: job.get('requirements') || [],
    roles: job.get('roles') || [],
    description: job.get('description'),
    applicationURL: job.get('applicationURL'),
    wage: job.get('wage'),
    avgRating: job.get('avgRating'),
    avgWageRate: job.get('avgWageRate'),
    ratingsCount: job.get('reviewsCount'),
    wageReviewsCount: job.get('wageReviewsCount'),
  };
}

function fromParseReviews(review) {
  return {
    id: review.id,
    wageRate: review.get('wageRate'),
    rating: review.get('rating'),
    comment: review.get('comment'),
    author: review.get('author') && fromParseUser(review.get('author')),
    gigId: review.get('gig') && review.get('gig').id,
    gigName: review.get('gig') && review.get('gig').get('jobType') + ' with ' + review.get('gig').get('companyName'),
    createdAt: review.get('createdAt') && review.get('createdAt').getTime(),
    likeCount: review.get('likeCount'),
  };
}

function fromParseArticles(article) {
  return {
    id: article.id,
    source: article.get('source'),
    author: article.get('author'),
    imageUrl: article.get('imageUrl'),
    title: article.get('title'),
    description: article.get('description'),
    url: article.get('url'),
    publishDate: article.get('publishDate') && article.get('publishDate').getTime(),
    likeCount: article.get('likeCount'),
  };
}

module.exports = {fromParseUser, fromParsePosts, fromParseComments, fromParseJobs, fromParseReviews, fromParseArticles};
