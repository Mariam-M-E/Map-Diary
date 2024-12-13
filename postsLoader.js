function loadInitialPosts() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    fetch('posts.json')
        .then(response => response.json())
        .then(data => {
            const postsForPage = data[currentPage] || [];
            const existingPosts = JSON.parse(localStorage.getItem('posts') || '[]');
            if (existingPosts.length === 0) {
                localStorage.setItem('posts', JSON.stringify(postsForPage));
            }
        })
        .catch(error => {
            console.error('Error loading posts:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadInitialPosts();
});
