function PostManager() {
    this.mainBox = document.querySelector('.main-box');
    this.currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    if (!this.mainBox) {
        console.error('Main box element not found. Initialization aborted.');
        return;
    }
    this.init();
}

PostManager.prototype.init = function() {
    this.createToggleButton();
    this.setupEventListeners();
    this.loadAndRenderPosts();
};

PostManager.prototype.createToggleButton = function() {
    const toggleButton = document.getElementById('togglePostForm');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            this.togglePostForm();
        });
    }
};

PostManager.prototype.togglePostForm = function() {
    let postForm = document.querySelector('.post-form');

    if (postForm) {
        postForm.remove(); // Remove the form if it exists
    } else {
        this.createPostForm(); // Create the form if it doesn't exist
    }
};

PostManager.prototype.createPostForm = function() {
    if (document.querySelector('.post-form')) {
        return;
    }

    const formHTML = `
        <div class="post post-form">
            <h3 style="font-weight: bold; font-size: 1.25rem; margin-bottom: 1rem;">Create New Post</h3>
            <input type="text" id="postTitle" placeholder="Enter title" 
                style="width: 100%; margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;">
            <textarea id="postDescription" placeholder="Enter description" 
                style="width: 100%; height: 100px; margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;"></textarea>
            <input type="file" id="postImage" accept="image/*" 
                style="margin-bottom: 10px; font-size: 1rem;">
            <button id="submitPost" class="btn">Submit Post</button>
        </div>
    `;

    this.mainBox.insertAdjacentHTML('afterbegin', formHTML);
};

PostManager.prototype.setupEventListeners = function() {
    this.mainBox.addEventListener('click', (event) => {
        const target = event.target;

        // Handle post submission
        if (target.id === 'submitPost') {
            this.createNewPost();
            return;
        }

        // Handle voting
        const upvoteBtn = target.closest('.upvote-btn');
        const downvoteBtn = target.closest('.downvote-btn');

        if (upvoteBtn) {
            const postId = upvoteBtn.closest('.post').dataset.postId;
            this.handleVote(postId, 'upvote');
        } else if (downvoteBtn) {
            const postId = downvoteBtn.closest('.post').dataset.postId;
            this.handleVote(postId, 'downvote');
        }
    });
};

PostManager.prototype.getAllPosts = function() {
    return JSON.parse(localStorage.getItem('posts') || '[]');
};

PostManager.prototype.savePost = function(post) {
    const posts = this.getAllPosts();
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
};

PostManager.prototype.createNewPost = function() {
    const title = document.getElementById('postTitle').value;
    const description = document.getElementById('postDescription').value;
    const imageFile = document.getElementById('postImage').files[0];

    if (!title || !description) {
        alert('Please fill in all required fields');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const post = {
            id: 'post_' + Date.now(),
            title: title,
            description: description,
            image: e.target.result,
            timestamp: new Date().toISOString(),
            page: this.currentPage,
            votes: 0,
            comments: []
        };

        this.savePost(post);
        this.loadAndRenderPosts();

        document.getElementById('postTitle').value = '';
        document.getElementById('postDescription').value = '';
        document.getElementById('postImage').value = '';

        const postForm = document.querySelector('.post-form');
        if (postForm) {
            postForm.remove(); // Remove the form after submission
        }
    };

    if (imageFile) {
        reader.readAsDataURL(imageFile);
    }
};

PostManager.prototype.loadAndRenderPosts = function() {
    this.mainBox.innerHTML = ''; // Clear existing posts
    const posts = this.getAllPosts();
    const pageSpecificPosts = posts
        .filter(post => post.page === this.currentPage)
        .sort((a, b) => b.votes - a.votes);

    pageSpecificPosts.forEach(post => this.renderPost(post));
};

PostManager.prototype.renderPost = function(post) {
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

    this.mainBox.insertAdjacentHTML('beforeend', postHTML);
    this.loadPostComments(post.id);
};

// Function to load comments for a specific post
PostManager.prototype.loadPostComments = function(postId) {
    const post = this.getPostById(postId);
    const commentsContainer = document.querySelector(`[data-post-id="${postId}"] .comments-container`);

    if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
            this.displayComment(commentsContainer, comment);
        });
    }

    this.updateCommentVisibility(commentsContainer);
};

PostManager.prototype.getPostById = function(postId) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    return posts.find(post => post.id === postId);
};

// Function to display comments
// Function to display comments with profile picture
PostManager.prototype.displayComment = function(container, comment) {
    const commentText = comment.text || '[Unknown Comment]'; // Comment text
    const pfpUrl = comment.pfp || 'default-pfp.png'; // Profile picture URL (fallback to default)

    var commentHTML = `
        <div class="text-comments" data-comment-id="${comment.id}">
            <img src="https://i.pinimg.com/236x/dd/25/48/dd2548cfcdfff672100aa6cba83d99ea.jpg"m;, class="pfp">
            <div>${comment.text}</div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', commentHTML);
};


// Function to update visibility of comments
PostManager.prototype.updateCommentVisibility = function(container) {
    const comments = container.querySelectorAll('.comment');
    comments.forEach(comment => {
        if (comment.textContent.trim() === '') {
            comment.style.display = 'none';
        } else {
            comment.style.display = 'block';
        }
    });
};

// Vote handling
PostManager.prototype.handleVote = function(postId, voteType) {
    const votesData = JSON.parse(localStorage.getItem('votes') || '{}');
    const currentVote = votesData[postId];
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);

    if (currentVote === voteType) {
        this.removeVote(postId, voteType);
        votesData[postId] = null; // Explicitly set to null to indicate no vote
    } else {
        if (currentVote) {
            this.removeVote(postId, currentVote);
        }
        this.updateVotes(postId, voteType === 'upvote' ? 1 : -1);
        votesData[postId] = voteType;
    }

    localStorage.setItem('votes', JSON.stringify(votesData));
    this.updateVoteButtonStyles(postElement);
};

// Updating vote count
PostManager.prototype.updateVotes = function(postId, voteChange) {
    const posts = this.getAllPosts();
    const post = posts.find(post => post.id === postId);

    if (post) {
        post.votes += voteChange; // Update the vote count
        localStorage.setItem('posts', JSON.stringify(posts));
        this.loadAndRenderPosts(); // Re-render posts
    }
};

// Removing votes
PostManager.prototype.removeVote = function(postId, voteType) {
    const votesData = JSON.parse(localStorage.getItem('votes') || '{}');
    votesData[postId] = null;
    localStorage.setItem('votes', JSON.stringify(votesData));
    this.loadAndRenderPosts(); // Re-render posts after vote removal
};

// Update vote button styles
PostManager.prototype.updateVoteButtonStyles = function(postElement) {
    const upvoteButton = postElement.querySelector('.upvote-btn');
    const downvoteButton = postElement.querySelector('.downvote-btn');
    const votes = postElement.querySelector('.vote-count').textContent;

    upvoteButton.classList.remove('active');
    downvoteButton.classList.remove('active');

    if (votes > 0) {
        upvoteButton.classList.add('active');
    } else if (votes < 0) {
        downvoteButton.classList.add('active');
    }
};

// Initialize the PostManager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PostManager();
});
