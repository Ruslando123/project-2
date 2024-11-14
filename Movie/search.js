document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const moviesGrid = document.getElementById("moviesGrid");
    const suggestionsList = document.getElementById("suggestions");
    const sortOptions = document.getElementById("sortOptions"); // Sort dropdown

    const API_KEY = 'e5881fc67d9981b40fd05d557c061b76';
    const API_URL = 'https://api.themoviedb.org/3/search/movie';

    let currentQuery = '';
    let currentResults = []; // To store current search results

    // Event listener for search button
    searchButton.addEventListener("click", () => {
        currentQuery = searchInput.value;
        searchMovies(currentQuery);
    });

    // Event listener for sort dropdown
    sortOptions.addEventListener("change", () => {
        if (currentResults.length > 0) {
            sortAndDisplayMovies(sortOptions.value);
        }
    });

    // Event listener for search input to show suggestions
    searchInput.addEventListener("input", async () => {
        const query = searchInput.value.trim();
        if (query) {
            await showSuggestions(query);
        } else {
            suggestionsList.classList.add("hidden");
        }
    });

    // Function to search for movies
    async function searchMovies(query) {
        if (query) {
            try {
                const response = await fetch(`${API_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
                
                const data = await response.json();
                currentResults = data.results || []; // Store results for sorting

                if (currentResults.length > 0) {
                    sortAndDisplayMovies(sortOptions.value); // Display sorted results
                } else {
                    moviesGrid.innerHTML = '<p>No results found.</p>';
                }
            } catch (error) {
                console.error('Error fetching movie data:', error);
                moviesGrid.innerHTML = '<p>Error fetching movies. Please try again later.</p>';
            }
        }
    }

    // Function to sort and display movies
    function sortAndDisplayMovies(sortBy) {
        const sortedMovies = [...currentResults]; // Clone the array to avoid modifying the original data

        // Apply sorting based on the selected option
        switch (sortBy) {
            case 'popularity.desc':
                sortedMovies.sort((a, b) => b.popularity - a.popularity);
                break;
            case 'popularity.asc':
                sortedMovies.sort((a, b) => a.popularity - b.popularity);
                break;
            case 'release_date.desc':
                sortedMovies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
                break;
            case 'release_date.asc':
                sortedMovies.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
                break;
            case 'vote_average.desc':
                sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
                break;
            case 'vote_average.asc':
                sortedMovies.sort((a, b) => a.vote_average - b.vote_average);
                break;
            default:
                break;
        }

        displayMovies(sortedMovies, moviesGrid); // Display sorted movies
    }

    // Function to show movie title suggestions
    async function showSuggestions(query) {
        try {
            const response = await fetch(`${API_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error(`Error fetching suggestions: ${response.statusText}`);

            const data = await response.json();
            displaySuggestions(data.results || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            suggestionsList.classList.add("hidden");
        }
    }

    // Function to display suggestions in the dropdown
    function displaySuggestions(movies) {
        suggestionsList.innerHTML = '';
        if (movies.length > 0) {
            movies.slice(0, 5).forEach(movie => {
                const suggestionItem = document.createElement("li");
                suggestionItem.textContent = movie.title;
                suggestionItem.addEventListener("click", () => {
                    searchInput.value = movie.title;
                    suggestionsList.classList.add("hidden");
                    currentQuery = movie.title;
                    searchMovies(movie.title);
                });
                suggestionsList.appendChild(suggestionItem);
            });
            suggestionsList.classList.remove("hidden");
        } else {
            suggestionsList.classList.add("hidden");
        }
    }

    // Function to display movies in a grid
    function displayMovies(movies, grid) {
        grid.innerHTML = ''; // Clear previous results
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path || ''}" alt="${movie.title || 'No title'}">
                <h3>${movie.title || 'No title'}</h3>
                <p>Release Date: ${movie.release_date || 'N/A'}</p>
                <button onclick="window.open('/movie-details.html?id=${movie.id}', '_blank')">View Details</button>
            `;
            grid.appendChild(movieCard);
        });
    }

    // Close suggestions when clicking outside the input or suggestions list
    document.addEventListener("click", (event) => {
        if (!suggestionsList.contains(event.target) && event.target !== searchInput) {
            suggestionsList.classList.add("hidden");
        }
    });
});
