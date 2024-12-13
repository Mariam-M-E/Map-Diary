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

        if (target.id === 'submitPost') {
            this.createNewPost();
        }

        const upvoteBtn = target.closest('.upvote-btn');
        const downvoteBtn = target.closest('.downvote-btn');

        if (upvoteBtn) {
            const postId = upvoteBtn.closest('.post').dataset.postId;
            this.updateVotes(postId, 1);
        } else if (downvoteBtn) {
            const postId = downvoteBtn.closest('.post').dataset.postId;
            this.updateVotes(postId, -1);
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
    this.mainBox.innerHTML = '';

    this.ensureInitialPosts();

    const posts = this.getAllPosts();
    const pageSpecificPosts = posts
        .filter(post => post.page === this.currentPage)
        .sort((a, b) => b.votes - a.votes);

    pageSpecificPosts.forEach(post => this.renderPost(post));
};

PostManager.prototype.renderPost = function(post) {
    const postHTML = `
        <div class="post" data-post-id="${post.id}">
            <img src="https://wallpapers.com/images/hd/basic-default-pfp-pxi77qv5o0zuz8j3.jpg" class="pfp">
            <div class="post-title">${post.title}</div>
            <div class="post-content">${post.description}</div>
            <div class="post-image">
                <img src="${post.image}" alt="Post image">
            </div>
            <div class="comments">
                <button class="btn upvote-btn">↑</button>
                <div class="votes">${post.votes}</div>
                <button class="btn downvote-btn">↓</button>
            </div>
        </div>
    `;
    this.mainBox.insertAdjacentHTML('beforeend', postHTML);
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

PostManager.prototype.updateVoteButtonStyles = function(postElement) {
    const upvoteButton = postElement.querySelector('.upvote-btn');
    const downvoteButton = postElement.querySelector('.downvote-btn');

    // Get the current vote from localStorage
    const votesData = JSON.parse(localStorage.getItem('votes') || '{}');
    const currentVote = votesData[postElement.dataset.postId];

    // Remove both voted and unvoted classes from both buttons
    upvoteButton.classList.remove('voted', 'unvoted');
    downvoteButton.classList.remove('voted', 'unvoted');

    // Add appropriate classes based on the current vote
    upvoteButton.classList.add(currentVote === 'upvote' ? 'voted' : 'unvoted');
    downvoteButton.classList.add(currentVote === 'downvote' ? 'voted' : 'unvoted');
};

PostManager.prototype.handleVote = function(postId, voteType) {
    const votesData = JSON.parse(localStorage.getItem('votes') || '{}');
    const currentVote = votesData[postId];  
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);

    // If the user clicks on the same type of vote, remove their vote
    if (currentVote === voteType) {
        this.removeVote(postId, voteType);
        votesData[postId] = null; // Explicitly set to null to indicate no vote
    } else {
        // If the user switches their vote or votes for the first time
        if (currentVote) {
            // Remove the previous vote first
            this.removeVote(postId, currentVote);
        }

        // Apply the new vote
        this.updateVotes(postId, voteType === 'upvote' ? 1 : -1);
        votesData[postId] = voteType;
    }

    localStorage.setItem('votes', JSON.stringify(votesData));
    this.updateVoteButtonStyles(postElement);
};

PostManager.prototype.updateVotes = function(postId, voteChange) {
    const posts = this.getAllPosts();
    const post = posts.find(post => post.id === postId);

    if (post) {
        post.votes += voteChange;  // Update the vote count by the voteChange
        localStorage.setItem('posts', JSON.stringify(posts));
        this.loadAndRenderPosts(); // Re-render posts to reflect updated votes
    }
};

PostManager.prototype.removeVote = function(postId, voteType) {
    const votesData = JSON.parse(localStorage.getItem('votes') || '{}');
    
    // Set the vote to null instead of deleting
    votesData[postId] = null;
    localStorage.setItem('votes', JSON.stringify(votesData));

    // Adjust the vote count to reflect the removal
    const voteChange = (voteType === 'upvote') ? -1 : 1;
    this.updateVotes(postId, voteChange);
};




PostManager.prototype.ensureInitialPosts = function() {
    const initialPosts = [
        {
            id: 'post_1',
            title: 'My Visit to Dubai',
            description: 'I visited this restaurant in Barsha, Dubai. It had really good food, 10/10!',
            image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/ba/41/a6/samgyupsal.jpg?w=600&h=400&s=1',
            timestamp: new Date().toISOString(),
            page: 'UAE',
            votes: 200,
            comments: []
        },
        {
            id: 'post_2',
            title: 'I Visited Burj Khalifa',
            description: 'The tallest tower in the world is one of the coolest places to visit.',
            image: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/12/32/ad/2c.jpg',
            timestamp: new Date().toISOString(),
            page: 'UAE',
            votes: 5,
            comments: []
        }
    ];

    const existingPosts = this.getAllPosts();
    if (existingPosts.length === 0) {
        localStorage.setItem('posts', JSON.stringify(initialPosts));
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PostManager();
});
