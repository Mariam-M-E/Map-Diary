// Configuration object for countries and their pages
var CONFIG = {
    countries: ['UAE', 'Oman', 'Yemen', 'Saudi Arabia', 'Qatar', 'Jordan', 'Syria', 
                'Lebanon', 'Palestine', 'Egypt', 'Morroco'],
    searchMinLength: 2
};

// Class to handle all search functionality
function PostSearch() {
    this.pagesData = {};
    this.searchInput = document.getElementById('searchInput');
    this.searchResults = document.getElementById('searchResults');
    this.init();
}

PostSearch.prototype.init = function() {
    var self = this;
    this.initializePagesData().then(function() {
        self.setupEventListeners();
    });
};

PostSearch.prototype.initializePagesData = function() {
    var self = this;
    // Initialize empty arrays for each country
    CONFIG.countries.forEach(function(country) {
        self.pagesData[country] = [];
    });

    // Retrieve data from localStorage
    return new Promise(function(resolve) {
        CONFIG.countries.forEach(function(country) {
            // Retrieve the specific country data from localStorage
            var storedData = JSON.parse(localStorage.getItem(country) || '[]');
            
            // Transform stored data into search-friendly format
            self.pagesData[country] = storedData.map(function(post) {
                return {
                    title: post.title,
                    country: country,
                    description: post.description,
                    url: self.createPostUrl(country, post.title)
                };
            });
        });
        resolve();
    });
};

PostSearch.prototype.createPostUrl = function(country, title) {
    var titleSlug = title.toLowerCase().replace(/\s+/g, '-');
    return country + '.html#' + titleSlug;
};

PostSearch.prototype.setupEventListeners = function() {
    var self = this;
    
    // Search input event listener
    this.searchInput.addEventListener('input', function() {
        self.handleSearch();
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!self.searchResults.contains(e.target) && 
            !self.searchInput.contains(e.target)) {
            self.searchResults.classList.remove('active');
        }
    });
};

PostSearch.prototype.handleSearch = function() {
    var searchTerm = this.searchInput.value.toLowerCase();
    this.searchResults.innerHTML = '';

    if (searchTerm.length < CONFIG.searchMinLength) {
        this.searchResults.classList.remove('active');
        return;
    }

    var results = this.getSearchResults(searchTerm);
    this.displayResults(results);
};

PostSearch.prototype.getSearchResults = function(searchTerm) {
    var allPosts = [];
    var self = this;
    
    Object.keys(this.pagesData).forEach(function(country) {
        allPosts = allPosts.concat(self.pagesData[country]);
    });

    return allPosts.filter(function(post) {
        return post.title.toLowerCase().includes(searchTerm) || 
               post.description.toLowerCase().includes(searchTerm);
    });
};

PostSearch.prototype.displayResults = function(results) {
    var self = this;
    
    if (results.length === 0) {
        this.searchResults.classList.remove('active');
        return;
    }

    results.forEach(function(result) {
        var resultElement = document.createElement('div');
        resultElement.className = 'search-result-item';
        resultElement.textContent = result.title + ' (' + result.country + ')';
        resultElement.onclick = function() {
            window.location.href = result.url;
        };
        self.searchResults.appendChild(resultElement);
    });

    this.searchResults.classList.add('active');
};

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // First, ensure data is in localStorage if it isn't already
    if (!localStorage.getItem('UAE')) {
        // Assuming the data from the first document is available
        Object.keys(jsonData).forEach(function(country) {
            localStorage.setItem(country, JSON.stringify(jsonData[country]));
        });
    }

    new PostSearch();
});