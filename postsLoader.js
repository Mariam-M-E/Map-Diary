// Function to load and render posts
function loadInitialPosts() {
    fetch('posts.json')
        .then(response => response.json())
        .then(data => {
            const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
            const postsForPage = data[currentPage] || [];
            if (!localStorage.getItem('posts')) {
                localStorage.setItem('posts', JSON.stringify(postsForPage));
            }
            renderPosts(postsForPage);
        })
        .catch(err => console.error('Error loading posts:', err));
}

// Render posts when the document is ready
document.addEventListener('DOMContentLoaded', loadInitialPosts);
