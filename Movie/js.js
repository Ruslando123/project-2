document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const weeklyMovies = document.getElementById("weeklyMovies");
    const randomMovies = document.getElementById("randomMovies");
    const searchResults = document.getElementById("searchResults");

    const API_KEY = 'e5881fc67d9981b40fd05d557c061b76';
    const API_URL_POPULAR = 'https://api.themoviedb.org/3/movie/popular';
    const API_URL_SEARCH = 'https://api.themoviedb.org/3/search/movie';
    const API_URL_NOW_PLAYING = 'https://api.themoviedb.org/3/movie/now_playing';

    // Fetch and display movies for "This Week's Movies" and "Random Movies"
    fetchMovies(API_URL_NOW_PLAYING, weeklyMovies);
    fetchRandomMovies(API_URL_POPULAR, randomMovies);

    // Add event listener to search button
    searchButton.addEventListener("click", async () => {
        const query = searchInput.value.trim();
        console.log("Search query:", query);  // Debugging: Check if search query is being captured
        if (query) {
            await searchMovies(query);
        } else {
            searchResults.innerHTML = '<p>Please enter a search query.</p>';
        }
    });

    // Fetch movies for a specific category or type (e.g., Now Playing, Popular)
    async function fetchMovies(url, gridElement) {
        try {
            const response = await fetch(`${url}?api_key=${API_KEY}&language=en-US`);
            if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
            const data = await response.json();
            displayMovies(data.results, gridElement);
        } catch (error) {
            console.error('Error fetching movie data:', error);
            gridElement.innerHTML = '<p>Error fetching movies. Please try again later.</p>';
        }
    }

    // Fetch random movies by fetching popular movies and selecting random ones
    async function fetchRandomMovies(url, gridElement) {
        try {
            const response = await fetch(`${url}?api_key=${API_KEY}&language=en-US`);
            if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
            const data = await response.json();
            const randomMoviesList = getRandomMovies(data.results);
            displayMovies(randomMoviesList, gridElement);
        } catch (error) {
            console.error('Error fetching random movie data:', error);
            gridElement.innerHTML = '<p>Error fetching random movies. Please try again later.</p>';
        }
    }

    // Select a random subset of movies (e.g., 5 random movies)
    function getRandomMovies(movies) {
        const randomCount = 5;
        let randomMovies = [];
        while (randomMovies.length < randomCount) {
            const randomIndex = Math.floor(Math.random() * movies.length);
            const movie = movies[randomIndex];
            if (!randomMovies.includes(movie)) {
                randomMovies.push(movie);
            }
        }
        return randomMovies;
    }

    // Handle search query and fetch search results
    async function searchMovies(query) {
        console.log("Fetching search results for:", query);  // Debugging: Check if the search query is sent to API
        try {
            const response = await fetch(`${API_URL_SEARCH}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US`);
            if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
            const data = await response.json();
            console.log("Search results:", data);  // Debugging: Check API response
            displayMovies(data.results, searchResults);
        } catch (error) {
            console.error('Error fetching search data:', error);
            searchResults.innerHTML = '<p>Error fetching search results. Please try again later.</p>';
        }
    }

    // Display the movie results in the grid
    function displayMovies(movies, gridElement) {
        gridElement.innerHTML = '';  // Clear previous content
        if (movies.length === 0) {
            gridElement.innerHTML = '<p>No movies found.</p>';
            return;
        }

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path || ''}" alt="${movie.title || 'No title'}">
                <h3>${movie.title || 'No title'}</h3>
                <p>Rating: ${movie.vote_average || 'N/A'}</p>
                <button onclick="window.open('/movie-details.html?id=${movie.id}', '_blank')">View Details</button>
            `;
            gridElement.appendChild(movieCard);
        });
    }
});
