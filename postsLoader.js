function getPostById(postId) {
    const locationKey = getLocationKey();
    const posts = JSON.parse(localStorage.getItem(locationKey) || '[]');
    return posts.find(post => post.id === postId);
}

function loadInitialPosts() {
    fetch('posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
            const postsForPage = data[currentPage] || [];

            let locationKey = currentPage;
            let storedPosts = localStorage.getItem(locationKey);

            if (!storedPosts) {
                localStorage.setItem(locationKey, JSON.stringify(postsForPage));
                storedPosts = postsForPage;
            } else {
                storedPosts = JSON.parse(storedPosts);
            }

            renderPosts(storedPosts);
        })
        .catch(err => console.error('Error loading posts:', err));
}

function CommentHandler() {
    this.setupGlobalCommentListeners();
}

CommentHandler.prototype.loadPostComments = function(postId) {
    const post = getPostById(postId);
    const commentsContainer = document.querySelector(`[data-post-id="${postId}"] .comments-container`);

    if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
            displayComment(commentsContainer, comment);
        });
    }

    this.updateCommentVisibility(commentsContainer);
};

function renderPosts(posts) {
    const mainBox = document.querySelector('.main-box');
    if (!mainBox) {
        console.error('Main box element not found. Initialization aborted.');
        return;
    }
    
    mainBox.innerHTML = ''; 
    const commentHandlerInstance = new CommentHandler();

    posts.forEach(post => {
        const postHTML = `
        <div class="post" data-post-id="${post.id}">
            <div class="post-header">
                <img src="https://wallpapers.com/images/hd/basic-default-pfp-pxi77qv5o0zuz8j3.jpg" class="pfp" alt="Profile picture">
                <div class="post-title">${post.title}</div>
            </div>
            <div class="post-content">${post.description}</div>
            <div class="post-image">
                <img src="${post.image}" alt="Post image">
            </div>
            <div class="post-footer">
                <div class="votes">
                    <button class="btn upvote-btn" aria-label="Upvote">↑</button>
                    <div class="vote-count">${post.votes}</div>
                    <button class="btn downvote-btn" aria-label="Downvote">↓</button>
                </div>
                <div class="comments-section">
                    <div class="comments-container"></div>
                    <div class="comment-input-container">
                        <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                        <button class="add-comment-btn">Post Comment</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    
        mainBox.insertAdjacentHTML('beforeend', postHTML);
        commentHandlerInstance.loadPostComments(post.id);
    });
}

CommentHandler.prototype.setupGlobalCommentListeners = function() {
    var self = this;
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.add-comment-btn');
        if (button) {
            console.log("Button clicked:", button);  // Debug: Check if button is found
            e.preventDefault();
            e.stopPropagation();
            self.handleAddComment(e, button);
        } else if (e.target.closest('.show-more-comments')) {
            self.toggleComments(e.target, true);
        } else if (e.target.closest('.show-less-comments')) {
            self.toggleComments(e.target, false);
        }
    });
};



CommentHandler.prototype.handleAddComment = function(event, button) {
    event.preventDefault();  
    event.stopPropagation();

    var commentSection = button.closest('.comments-section');
    var commentInput = commentSection.querySelector('.comment-input');
    var commentText = commentInput.value.trim();
    var postElement = button.closest('.post');
    var postId = postElement.dataset.postId;

    if (!commentText) {
        //alert('Please enter a valid comment');
        return;
    }

    var comment = {
        id: 'comment_' + Date.now(),
        text: commentText,
        timestamp: new Date().toISOString()
    };

    this.saveComment(postId, comment);

    var commentsContainer = commentSection.querySelector('.comments-container');
    displayComment(commentsContainer, comment);

    commentInput.value = '';

    this.updateCommentVisibility(commentsContainer);
};

CommentHandler.prototype.saveComment = function(postId, comment) {
    const locationKey = getLocationKey();
    const posts = JSON.parse(localStorage.getItem(locationKey) || '[]');
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments = post.comments || [];
        post.comments.push(comment);
        localStorage.setItem(locationKey, JSON.stringify(posts));
    }
};

function displayComment(container, comment) {
    const commentHTML = `
        <div class="text-comments" data-comment-id="${comment.id}">
            <img src="https://i.pinimg.com/236x/47/ba/71/47ba71f457434319819ac4a7cbd9988e.jpg" class="pfp" alt="Profile picture">
            <div>${comment.text}</div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', commentHTML);
}

CommentHandler.prototype.updateCommentVisibility = function(container) {
    var comments = container.querySelectorAll('.text-comments');
    var showMoreBtn = container.querySelector('.show-more-comments');
    var showLessBtn = container.querySelector('.show-less-comments');

    if (comments.length > 3) {
        comments.forEach((comment, index) => {
            if (index >= 3) {
                comment.style.display = 'none';
            }
        });

        if (!showMoreBtn && !showLessBtn) {
            container.insertAdjacentHTML('beforeend', ` 
                <button class="show-more-comments" style="color: blue; background: none; border: none; cursor: pointer; margin-top: 10px;">Show more...</button>
            `);
        }
    }
};

CommentHandler.prototype.toggleComments = function(button, showMore) {
    var container = button.closest('.comments-container');
    if (!container) {
        console.error('Comments container not found');
        return;
    }

    var comments = container.querySelectorAll('.text-comments');
    comments.forEach((comment, index) => {
        if (index >= 3) {
            comment.style.display = showMore ? 'flex' : 'none';
        }
    });

    button.outerHTML = showMore 
        ? `<button class="show-less-comments" style="color: blue; background: none; border: none; cursor: pointer; margin-top: 10px;">Show less...</button>`
        : `<button class="show-more-comments" style="color: blue; background: none; border: none; cursor: pointer; margin-top: 10px;">Show more...</button>`;
};

function getLocationKey() {
    return window.location.pathname.split('/').pop().replace('.html', '');
}

document.addEventListener('DOMContentLoaded', function() {
    loadInitialPosts();
    new CommentHandler(); 
});
