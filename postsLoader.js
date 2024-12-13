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

            let locationKey = getLocationKey(); // Fetch location-specific key (e.g., 'Dubai')
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

function renderPosts(posts) {
    const mainBox = document.querySelector('.main-box');
    if (!mainBox) {
        console.error('Main box element not found. Initialization aborted.');
        return;
    }
    
    mainBox.innerHTML = ''; 
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
        loadPostComments(post.id);
    });
}

function loadPostComments(postId) {
    const post = getPostById(postId);
    const commentsContainer = document.querySelector(`[data-post-id="${postId}"] .comments-container`);

    if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
            displayComment(commentsContainer, comment);
        });
    }

    updateCommentVisibility(commentsContainer);
}

function getPostById(postId) {
    const locationKey = getLocationKey(); // Fetch location key dynamically
    const posts = JSON.parse(localStorage.getItem(locationKey) || '[]');
    return posts.find(post => post.id === postId);
}

function getLocationKey() {
    currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    return currentPage
}

function displayComment(container, comment) {
    const commentText = comment.text || '[Unknown Comment]'; 
    const pfpUrl = comment.pfp || 'default-pfp.png'; 

    const commentHTML = `
        <div class="text-comments" data-comment-id="${comment.id}">
            <img src="${pfpUrl}" class="pfp" alt="Profile picture">
            <div>${commentText}</div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', commentHTML);
}

function updateCommentVisibility(container) {
    const comments = container.querySelectorAll('.comment');
    comments.forEach(comment => {
        if (comment.textContent.trim() === '') {
            comment.style.display = 'none';
        } else {
            comment.style.display = 'block';
        }
    });
}

document.addEventListener('DOMContentLoaded', loadInitialPosts);
