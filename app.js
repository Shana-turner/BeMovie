// Constants
const apiKey = "eaf2a9fdeaeb3ceccee307e8ce7421aa";
let fetchedGenres = [];

// --------------
// API functions
// --------------

// Fetches the latest movies from the API.
async function fetchLatestMovies() {
  const response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`);
  const data = await response.json();
  return data.results;
}

// Fetches the movie cast from the API.
async function fetchMovieCast(movieId) {
  console.log("FETCH CAST");
  const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`);
  const data = await response.json();
  console.log(data.cast);
  return data.cast;
}

// Fetches the genres from the API.
async function fetchGenres() {
  const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
  const data = await response.json();
  return data.genres;
}

// Fetches the movies by genre from the API.
async function fetchMoviesByGenre(genreId) {
  const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=1`);
  const data = await response.json();
  return data.results;
}

// Fetches all movies with a particular word in the title from the API.
async function fetchMoviesByTitle(query) {
  const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${query}&page=1&include_adult=false`);
  const data = await response.json();
  return data.results;
}

// --------------
// Utils
// --------------

// Shows the given popup
function showPopup(popupContainer) {
    popupContainer.style.display = 'block';

    // Switch between Login/Register popups.
    const loginPopupContainer = document.querySelector('.container-popup-login');
    const registerPopupContainer = document.querySelector('.container-popup-register');
    if (popupContainer === loginPopupContainer) {
        const registerButtons = loginPopupContainer.querySelectorAll(".btn-register .signup, .link-sign-up");
        registerButtons.forEach(button => {
            button.addEventListener('click', (event) => {
              event.preventDefault();
              hidePopup(loginPopupContainer);
              showPopup(registerPopupContainer);
          });
        })
    } else if (popupContainer === registerPopupContainer) {
        const loginButtons = registerPopupContainer.querySelectorAll(".btns-register .login, .link-register");
        loginButtons.forEach(button => {
            button.addEventListener('click', () => {
                event.preventDefault();
                hidePopup(registerPopupContainer);
                showPopup(loginPopupContainer);
            });
        });
    }
}

// Hides the given popup
function hidePopup(popupContainer) {
    popupContainer.style.display = 'none';
}

// Creates a swiper movie slide.
function createMovieSlide(movie, moviePopupContainer) {
    const slide = document.createElement("div");
    slide.classList.add('swiper-slide');
    const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : "placeholder.jpg";
    slide.style.backgroundImage = `url("${posterUrl}")`;
    slide.style.backgroundSize = "100%";

    const movieDetails = document.createElement("div");
    movieDetails.classList.add("movie");
    movieDetails.style.display = "none";

    const movieTitle = movie.title;
    const movieYear = new Date(movie.release_date).getFullYear();
    const genreNames = getGenreNames(movie.genre_ids);
    const movieGenres = genreNames.join(' / ');
    const movieRating = movie.vote_average.toFixed(1);

    movieDetails.innerHTML = `
        <span class="movie-title">${movieTitle}</span><br>
        <span class="movie-year">${movieYear}</span><br>
        <span class="movie-genre">${movieGenres}</span><br>
        <span class="movie-rating"><img src="Vectoretoile.svg" alt=""><br>${movieRating}</span>
    `
    slide.appendChild(movieDetails);

    // Open the movie popup on click.
    slide.addEventListener('click', () => {
        updateMoviePopupContainer(moviePopupContainer, movie);
        showPopup(moviePopupContainer);
    });

    // Display the movie details on hover.
    slide.addEventListener("mouseover", () => {
        movieDetails.style.display = "block";
    });
    slide.addEventListener("mouseout", () => {
        movieDetails.style.display = "none";
    });

    return slide;
}

// Creates/updates the swipers to show the movies of the given section (= search results, latest movies or movies by genre).
function updateSwiperWrapper(swipperSectionSelector, movies, moviePopupContainer) {
    const swiperWrapper = document.querySelector(`${swipperSectionSelector} .swiper-wrapper`);
    swiperWrapper.innerHTML = '';
    movies.forEach(movie => {
        const slide = createMovieSlide(movie, moviePopupContainer);
        swiperWrapper.appendChild(slide);
    });

    // Initialize Swiper
    const swiper = new Swiper(`${swipperSectionSelector} .mySwiper`, {
        slidesPerView: 4,
        spaceBetween: 30,
        navigation: {
            nextEl: `${swipperSectionSelector} .swiper-button-next`,
            prevEl: `${swipperSectionSelector} .swiper-button-prev`,
        },
    }); // TODO chercher pagination/starting slide
}

// Updates the movie popup with the current movie details.
async function updateMoviePopupContainer(moviePopupContainer, movie) {
    const image = moviePopupContainer.querySelector(".image-movie");
    image.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    const name = moviePopupContainer.querySelector(".name-movie");
    name.textContent = movie.title;

    const year = moviePopupContainer.querySelector(".date-movie");
    year.textContent = new Date(movie.release_date).getFullYear();

    const overview = moviePopupContainer.querySelector(".resume-movie");
    overview.textContent = movie.overview;

    const rating = moviePopupContainer.querySelector(".note-movie");
    rating.textContent = movie.vote_average.toFixed(1);

    const genres = moviePopupContainer.querySelector(".genre-movie");
    const genreNames = getGenreNames(movie.genre_ids);
    genres.textContent = genreNames.join(' / ');
    
    const castContainer = moviePopupContainer.querySelector(".acteur-movie");
    const cast = await fetchMovieCast(movie.id);
    castContainer.textContent = cast.slice(0, 4).map(actor => actor.name).join(', ');
}

// Returns the genre names corresponding to the genre IDs.
function getGenreNames(genreIds) {
    const genreMap = {};
    fetchedGenres.forEach(genre => {
        genreMap[genre.id] = genre.name;
    });
    return genreIds.map(id => genreMap[id]);
}

// --------------
// Main
// --------------

document.addEventListener('DOMContentLoaded', async (event) => {
    // Fetch the genres and store them once.
    fetchedGenres =  await fetchGenres();

    // Hide the search result container.
    const searchResultsContainer = document.querySelector(".resultat");
    searchResultsContainer.style.display = "none";

    // ------------------------------
    // CREATE POPUP EVENT LISTENERS
    // ------------------------------

    // Login and register popups.
    const openLoginBtn = document.querySelector('.open-login');
    const openRegisterBtn = document.querySelector('.open-register');
    const loginPopupContainer = document.querySelector('.container-popup-login');
    const registerPopupContainer = document.querySelector('.container-popup-register');
    const closeLoginPopup = loginPopupContainer.querySelector('span');
    const closeRegisterPopup = registerPopupContainer.querySelector('span');
    // Movie details popup.
    const moviePopupContainer = document.querySelector('.container-movie');
    const closeMoviePopup = moviePopupContainer.querySelector('.close-popup-movie');

    const popups = [loginPopupContainer, registerPopupContainer, moviePopupContainer];
    const loginRegisterBtns = [openLoginBtn, openRegisterBtn];
    const popupCloseBtns = [closeLoginPopup, closeRegisterPopup, closeMoviePopup];

    // Show the corresponding popup when the header links are clicked.
    loginRegisterBtns.forEach((btn, index) => {
        btn.addEventListener("click", (event) => {
            event.preventDefault();
            showPopup(popups[index]);
        });
    });
  
    // Close the corresponding popup when the close buttons are clicked.
    popupCloseBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            hidePopup(popups[index]);
        });
    });

    // Close the popups when clicking outside of them.
    popups.forEach(popup => {
        window.addEventListener("click", (event) => {
            if (event.target === popup) {
                hidePopup(popup);
            }
        });
    })
  
    // ------------
    // LATEST RESULTS
    // ------------

    // Load and display the latest movies.
    const latestMovies = await fetchLatestMovies();
    updateSwiperWrapper("#LATEST", latestMovies, moviePopupContainer);
  
    // ----------------
    // MOVIES BY GENRE 
    // ----------------

    // Sets the corresponding genre IDs on the links.
    async function setGenreLinks() {
        const genres = fetchedGenres;
        const genreLinks = document.querySelectorAll('.list-genre a');
        genreLinks.forEach(link => {
            const genreName = link.textContent;
            const genreId = genres.find(genre => genre.name === genreName).id;
            link.dataset.genreId = genreId;
        });
    }

    // Displays the movies of a specific genre.
    async function updateGenreSwiper(link) {
        const genreId = link.dataset.genreId;
        const movies = await fetchMoviesByGenre(genreId);
        updateSwiperWrapper(".by-genre", movies, moviePopupContainer);
    }
  
    await setGenreLinks();
    // Load and displays the movies of the default genre (first genre in the list).
    const defaultGenreLink = document.querySelector(".list-genre a");
    await updateGenreSwiper(defaultGenreLink);
    // Add the "active" class on the link to show it is selected.
    defaultGenreLink.classList.add('active');

    // Event listener to update the movies when clicking on the genre links.
    document.querySelectorAll('.list-genre a').forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();
            await updateGenreSwiper(link);
            // Update the "active" class.
            document.querySelectorAll('.list-genre a').forEach(link => link.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // -------------------
    // SEARCH BAR RESULTS
    // ------------------
  
    // Gets and displays the search results.
    async function displaySearchResults(query) {
        const movies = await fetchMoviesByTitle(query);
        updateSwiperWrapper(".resultat", movies, moviePopupContainer);
        
        // Update the search results title.
        const searchTitle = document.querySelector('.recherche-film');
        searchTitle.textContent = `${query}`;
  
        // Show the search results section.
        searchResultsContainer.style.display = 'block';
    }
  
    // Event listener when clicking on the search button.
    const searchInput = document.querySelector('input.search');
    const searchBtn = document.querySelector('.btn-search');
    searchBtn.addEventListener('click', async () => {
        const query = document.getElementById('recherche').value.trim();
        if (query) {
            // Display the search results.
            await displaySearchResults(query);
        }
    });
    // Event listener when pressing "Enter" in the search input.
    searchInput.addEventListener('keyup', async (event) => {
        if (event.key === "Enter") {     
            const query = document.getElementById('recherche').value.trim();
            if (query) {
                await displaySearchResults(query);
            }
        }
    });
});
  

