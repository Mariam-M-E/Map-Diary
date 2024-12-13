// function CommentHandler() {
//     this.init();
// }

// CommentHandler.prototype.init = function() {
//     this.setupGlobalCommentListeners();
//     this.loadExistingComments();
// };

// CommentHandler.prototype.setupGlobalCommentListeners = function() {
//     var self = this;
//     document.addEventListener('click', function(e) {
//         if (e.target.classList.contains('add-comment-btn')) {
//             self.handleAddComment(e.target);
//         } else if (e.target.classList.contains('show-more-comments')) {
//             self.toggleComments(e.target, true);
//         } else if (e.target.classList.contains('show-less-comments')) {
//             self.toggleComments(e.target, false);
//         }
//     });
// };

// CommentHandler.prototype.loadExistingComments = function() {
//     var posts = this.loadPostsByLocation();
//     posts.forEach(post => {
//         var postElement = document.querySelector(`[data-post-id="${post.id}"]`);
//         if (postElement) {
//             var commentsContainer = postElement.querySelector('.comments-container');
//             post.comments.forEach(comment => {
//                 this.displayComment(commentsContainer, comment);
//             });
//             this.updateCommentVisibility(commentsContainer);
//         }
//     });
// };

// CommentHandler.prototype.handleAddComment = function(button) {
//     var commentSection = button.closest('.comments-section');
//     var commentInput = commentSection.querySelector('.comment-input');
//     var commentText = commentInput.value.trim();
//     var postElement = button.closest('.post');
//     var postId = postElement.dataset.postId;

//     if (!commentText) {
//         alert('Please enter a comment');
//         return;
//     }

//     var comment = {
//         id: 'comment_' + Date.now(),
//         text: commentText,
//         timestamp: new Date().toISOString()
//     };

//     this.saveComment(postId, comment);
    
//     var commentsContainer = commentSection.querySelector('.comments-container');
//     this.displayComment(commentsContainer, comment);
//     commentInput.value = '';

//     this.updateCommentVisibility(commentsContainer);
// };

// CommentHandler.prototype.saveComment = function(postId, comment) {
//     const posts = this.loadPostsByLocation();
//     const post = posts.find(p => p.id === postId);
//     if (post) {
//         post.comments = post.comments || [];
//         post.comments.push(comment);
//         this.savePostsByLocation(posts); // Save posts back to localStorage
//     }
// };

// CommentHandler.prototype.displayComment = function(container, comment) {
//     var commentHTML = `
//         <div class="text-comments" data-comment-id="${comment.id}">
//             <img src="https://i.pinimg.com/236x/47/ba/71/47ba71f457434319819ac4a7cbd9988e.jpg" class="pfp">
//             <div>${comment.text}</div>
//         </div>
//     `;
//     container.insertAdjacentHTML('beforeend', commentHTML);
// };

// CommentHandler.prototype.updateCommentVisibility = function(container) {
//     var comments = container.querySelectorAll('.text-comments');
//     var showMoreBtn = container.querySelector('.show-more-comments');
//     var showLessBtn = container.querySelector('.show-less-comments');

//     if (comments.length > 3) {
//         comments.forEach((comment, index) => {
//             if (index >= 3) {
//                 comment.style.display = 'none';
//             }
//         });

//         if (!showMoreBtn && !showLessBtn) {
//             container.insertAdjacentHTML('beforeend', `
//                 <button class="show-more-comments" style="color: blue; background: none; border: none; cursor: pointer; margin-top: 10px;">Show more...</button>
//             `);
//         }
//     }
// };

// CommentHandler.prototype.toggleComments = function(button, showMore) {
//     var container = button.closest('.comments-container');
//     var comments = container.querySelectorAll('.text-comments');

//     comments.forEach((comment, index) => {
//         if (index >= 3) {
//             comment.style.display = showMore ? 'block' : 'none';
//         }
//     });

//     button.outerHTML = showMore 
//         ? `<button class="show-less-comments" style="color: blue; background: none; border: none; cursor: pointer; margin-top: 10px;">Show less...</button>`
//         : `<button class="show-more-comments" style="color: blue; background: none; border: none; cursor: pointer; margin-top: 10px;">Show more...</button>`;
// };

// CommentHandler.prototype.loadPostsByLocation = function() {
//     const location = this.getLocation();
//     const posts = JSON.parse(localStorage.getItem(location) || '[]');
//     return posts;
// };

// CommentHandler.prototype.savePostsByLocation = function(posts) {
//     const location = this.getLocation();
//     localStorage.setItem(location, JSON.stringify(posts)); // Save updated posts to localStorage
// };

// CommentHandler.prototype.getLocation = function() {
//     currentPage = window.location.pathname.split('/').pop().replace('.html', '');
//     return currentPage
// };

// document.addEventListener('DOMContentLoaded', function() {
//     new CommentHandler();
// });
