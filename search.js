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

    // Fetch all country data in parallel
    return Promise.all(
        CONFIG.countries.map(function(country) {
            return self.fetchCountryData(country);
        })
    );
};

PostSearch.prototype.fetchCountryData = function(country) {
    var self = this;
    return fetch(country + '.html')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }
            return response.text();
        })
        .then(function(html) {
            self.extractPostTitles(html, country);
        })
        .catch(function(error) {
            console.error('Error fetching ' + country + ' data:', error);
        });
};

PostSearch.prototype.extractPostTitles = function(pageContent, country) {
    var self = this;
    var parser = new DOMParser();
    var doc = parser.parseFromString(pageContent, 'text/html');
    var posts = doc.querySelectorAll('.post');
    
    posts.forEach(function(post) {
        var titleElement = post.querySelector('.post-title');
        if (titleElement) {
            var title = titleElement.textContent.trim();
            self.pagesData[country].push({
                title: title,
                country: country,
                url: self.createPostUrl(country, title)
            });
        }
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
        return post.title.toLowerCase().includes(searchTerm);
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
    new PostSearch();
});