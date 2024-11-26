// Post Creator class for handling post creation and storage
function PostCreator() {
    this.postForm = null;
    this.mainBox = document.querySelector('.main-box');
    this.currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    this.init();
}

PostCreator.prototype.init = function() {
    this.createPostForm();
    this.setupEventListeners();
    this.loadExistingPosts();
};

PostCreator.prototype.createPostForm = function() {
    var formHTML = `
        <div class="post-form" style="width: 80%; background-color: white; padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h3>Create New Post</h3>
            <input type="text" id="postTitle" placeholder="Enter title" style="width: 100%; margin-bottom: 10px; padding: 5px;">
            <textarea id="postDescription" placeholder="Enter description" style="width: 100%; height: 100px; margin-bottom: 10px; padding: 5px;"></textarea>
            <input type="file" id="postImage" accept="image/*" style="margin-bottom: 10px;">
            <button id="submitPost" style="background-color: rgb(74, 74, 112); color: white; padding: 10px; border: none; border-radius: 5px;">Submit Post</button>
        </div>
    `;
    this.mainBox.insertAdjacentHTML('afterbegin', formHTML);
    this.postForm = document.querySelector('.post-form');
};

PostCreator.prototype.setupEventListeners = function() {
    var self = this;
    document.getElementById('submitPost').addEventListener('click', function() {
        self.createNewPost();
    });
};

PostCreator.prototype.loadExistingPosts = function() {
    var posts = this.getAllPosts();
    var pageSpecificPosts = posts.filter(post => post.page === this.currentPage);
    
    pageSpecificPosts.forEach(post => {
        this.displayPost(post);
    });
};

PostCreator.prototype.getAllPosts = function() {
    return JSON.parse(localStorage.getItem('posts') || '[]');
};

PostCreator.prototype.savePost = function(post) {
    var posts = this.getAllPosts();
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
};

PostCreator.prototype.createNewPost = function() {
    var title = document.getElementById('postTitle').value;
    var description = document.getElementById('postDescription').value;
    var imageFile = document.getElementById('postImage').files[0];

    if (!title || !description) {
        alert('Please fill in all required fields');
        return;
    }

    var self = this;
    var reader = new FileReader();
    reader.onload = function(e) {
        var post = {
            id: 'post_' + Date.now(),
            title: title,
            description: description,
            image: e.target.result,
            timestamp: new Date().toISOString(),
            page: self.currentPage,
            votes: 0,
            comments: []
        };

        self.savePost(post);
        self.displayPost(post);
        
        // Reset form
        document.getElementById('postTitle').value = '';
        document.getElementById('postDescription').value = '';
        document.getElementById('postImage').value = '';
    };

    if (imageFile) {
        reader.readAsDataURL(imageFile);
    }
};

PostCreator.prototype.displayPost = function(post) {
    var postHTML = `
        <div class="post" data-post-id="${post.id}">
            <img src="https://wallpapers.com/images/hd/basic-default-pfp-pxi77qv5o0zuz8j3.jpg" class="pfp">
            <div class="post-title">${post.title}</div>
            <div class="post-content">${post.description}</div>
            <div class="post-image">
                <img src="${post.image}" alt="Post image">
            </div>
            <div class="comments">
                <div class="btn">↑</div>
                <div class="votes">${post.votes}</div>
                <div class="btn">↓</div>
            </div>
            <div class="comments-section">
                <div class="comments-container"></div>
                <textarea class="comment-input" placeholder="Write a comment..." style="width: 100%; margin-top: 10px; padding: 5px;"></textarea>
                <button class="add-comment-btn" style="background-color: rgb(74, 74, 112); color: white; padding: 5px 10px; border: none; border-radius: 5px; margin-top: 5px;">Add Comment</button>
            </div>
        </div>
    `;
    document.querySelector('.main-box').insertAdjacentHTML('beforeend', postHTML);
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new PostCreator();
});