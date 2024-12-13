function PostManager() {
    this.mainBox = document.querySelector('.main-box');
    this.currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    if (!this.mainBox) {
        console.error('Main box element not found. Initialization aborted.');
        return;
    }
    this.init();
}

function getLocationKey() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    return currentPage;
}


PostManager.prototype.init = function() {
    this.createToggleButton();
    this.setupEventListeners();
    this.loadAndRenderPosts();
};

PostManager.prototype.createToggleButton = function() {
    const toggleButton = document.createElement('button');
    toggleButton.innerText = "Toggle View";
    toggleButton.addEventListener('click', () => this.toggleView());
    document.body.appendChild(toggleButton);
};

PostManager.prototype.createToggleButton = function() {
    const toggleButton = document.createElement('button');
    toggleButton.innerText = "Toggle View";
    toggleButton.addEventListener('click', () => this.toggleView());
    document.body.appendChild(toggleButton);

    const togglePostFormButton = document.getElementById('togglePostForm');
    if (togglePostFormButton) {
        togglePostFormButton.addEventListener('click', () => {
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
    this.mainBox.addEventListener('click', (e) => {
        if (e.target.classList.contains('upvote-btn')) {
            const postId = e.target.closest('.post').dataset.postId;
            this.handleVote(postId, 'upvote');
        } else if (e.target.classList.contains('downvote-btn')) {
            const postId = e.target.closest('.post').dataset.postId;
            this.handleVote(postId, 'downvote');
        } else if (e.target.id === 'submitPost') {
            this.createNewPost();
        }
    });
};


PostManager.prototype.getAllPosts = function() {
    return JSON.parse(localStorage.getItem('posts') || '[]');
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
        // First, load existing posts for the current country
        const posts = this.loadPostsByCountry();

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

        // Add the new post to the existing posts array
        posts.push(post);

        // Save the updated posts array
        this.savePostsByCountry(posts);
        this.loadAndRenderPosts();

        // Clear form inputs
        document.getElementById('postTitle').value = '';
        document.getElementById('postDescription').value = '';
        document.getElementById('postImage').value = '';

        // Remove the form
        const postForm = document.querySelector('.post-form');
        if (postForm) {
            postForm.remove(); 
        }
    };

    if (imageFile) {
        reader.readAsDataURL(imageFile);
    }
};

PostManager.prototype.setupEventListeners = function() {
    this.mainBox.addEventListener('click', (e) => {
        if (e.target.classList.contains('upvote-btn')) {
            const postId = e.target.closest('.post').dataset.postId;
            this.handleVote(postId, 'upvote');
        } else if (e.target.classList.contains('downvote-btn')) {
            const postId = e.target.closest('.post').dataset.postId;
            this.handleVote(postId, 'downvote');
        }
    });
};

PostManager.prototype.loadAndRenderPosts = function() {
    fetchPosts(this.currentPage)
        .then(posts => {
            renderPosts(posts);
        });
};

PostManager.prototype.handleVote = function(postId, voteType) {
    const country = getLocationKey();
    const votesKey = `votes_${country}`; // Country-specific votes storage
    const votesData = JSON.parse(localStorage.getItem(votesKey) || '{}');
    const currentVote = votesData[postId];

    const posts = this.loadPostsByCountry();
    const postToUpdate = posts.find(post => post.id === postId);

    if (!postToUpdate) {
        console.error('Post not found');
        return;
    }

    // Remove previous vote if exists
    if (currentVote) {
        postToUpdate.votes -= (currentVote === 'upvote') ? 1 : -1;
    }

    // Apply new vote
    if (currentVote !== voteType) {
        postToUpdate.votes += (voteType === 'upvote') ? 1 : -1;
        votesData[postId] = voteType;
    } else {
        // If voting the same way, effectively remove the vote
        votesData[postId] = null;
    }

    // Save updated votes and posts
    localStorage.setItem(votesKey, JSON.stringify(votesData));
    this.savePostsByCountry(posts);

    // Re-render to update UI
    this.loadAndRenderPosts();
};

PostManager.prototype.updateVoteButtonStyles = function(postElement) {
    if (!postElement) return;

    const upvoteButton = postElement.querySelector('.upvote-btn');
    const downvoteButton = postElement.querySelector('.downvote-btn');
    const voteCountElement = postElement.querySelector('.vote-count');
    
    if (!upvoteButton || !downvoteButton || !voteCountElement) return;

    const postId = postElement.dataset.postId;
    const country = getLocationKey();
    const votesKey = `votes_${country}`;
    const votesData = JSON.parse(localStorage.getItem(votesKey) || '{}');
    const currentVote = votesData[postId];

    // Remove active classes
    upvoteButton.classList.remove('active');
    downvoteButton.classList.remove('active');

    // Add active class based on current vote
    if (currentVote === 'upvote') {
        upvoteButton.classList.add('active');
    } else if (currentVote === 'downvote') {
        downvoteButton.classList.add('active');
    }
};

// Modify setupEventListeners to include buttons
PostManager.prototype.setupEventListeners = function() {
    this.mainBox.addEventListener('click', (e) => {
        if (e.target.classList.contains('upvote-btn')) {
            const postId = e.target.closest('.post').dataset.postId;
            this.handleVote(postId, 'upvote');
        } else if (e.target.classList.contains('downvote-btn')) {
            const postId = e.target.closest('.post').dataset.postId;
            this.handleVote(postId, 'downvote');
        } else if (e.target.id === 'submitPost') {
            this.createNewPost();
        }
    });
};

PostManager.prototype.loadPostsByCountry = function() {
    const country = getLocationKey(); // Dynamically define based on context
    return JSON.parse(localStorage.getItem(country) || '[]');
};

PostManager.prototype.savePostsByCountry = function(posts) {
    const country = getLocationKey(); // Dynamically define based on context
    localStorage.setItem(country, JSON.stringify(posts));
};

// Fetch posts from localStorage
function fetchPosts(currentPage) {
    const posts = JSON.parse(localStorage.getItem(currentPage) || '[]');
    return Promise.resolve(posts); // Return the posts as a resolved promise
}

document.addEventListener('DOMContentLoaded', function() {
    new PostManager();
});
