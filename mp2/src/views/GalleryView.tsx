// src/views/GalleryView.tsx
import React, { useState, useEffect, useMemo, ChangeEvent, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { searchMovies, getMovieGenres } from '../api/tmdbApi'; // Ensure correct path to api file
import { Movie, Genre } from '../types';
import MovieCard from '../components/MovieCard';
import { debounce } from 'lodash';
import './GalleryView.css'; // Import the new CSS

const GalleryView: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [query, setQuery] = useState<string>('');
    const [initialLoad, setInitialLoad] = useState<boolean>(true); // To fetch popular movies initially

    // Fetch genres on component mount
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const data = await getMovieGenres();
                setGenres(data.genres);
            } catch (error) {
                console.error('Error fetching genres:', error);
            }
        };
        fetchGenres();
    }, []);

    // Debounced movie fetching function
    const fetchMovies = useCallback(
        debounce(async (searchQuery: string, page: number) => {
            setLoading(true);
            try {
                const data = await searchMovies(searchQuery, page);
                setMovies(data.results);
                setTotalPages(data.total_pages);
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    // Effect for fetching movies based on query and page
    useEffect(() => {
        // If no query and it's an initial load, fetch popular movies without query
        // Otherwise, use the query for search
        const currentQuery = query.trim() === '' && initialLoad ? 'popular' : query;
        fetchMovies(currentQuery, currentPage);

        // Set initialLoad to false after the first fetch
        if (initialLoad) {
            setInitialLoad(false);
        }

        return () => {
            fetchMovies.cancel(); // Clean up debounce on unmount or re-render
        };
    }, [query, currentPage, fetchMovies, initialLoad]);

    const handleGenreChange = (event: ChangeEvent<HTMLInputElement>) => {
        const genreId = Number(event.target.value);
        setSelectedGenreIds((prev) =>
            event.target.checked ? [...prev, genreId] : prev.filter((id) => id !== genreId)
        );
        setCurrentPage(1); // Reset to first page when genre filters change
    };

    const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
        setCurrentPage(1); // Reset page on new query
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
        }
    };

    const filteredMovies = useMemo(() => {
        if (selectedGenreIds.length === 0) {
            return movies;
        }
        return movies.filter((movie) =>
            selectedGenreIds.some((genreId) => movie.genre_ids.includes(genreId))
        );
    }, [movies, selectedGenreIds]);
    const allMovieIds = filteredMovies.map(movie => movie.id);

    return (
        <div className="view-container gallery-view">
            <h2>Movie Gallery</h2>
            <div className="controls-container">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={query}
                    onChange={handleQueryChange}
                    className="search-bar"
                />

                <div className="genre-filters">
                    <h4>Filter by Genre:</h4>
                    <div className="genre-pills">
                        {genres.map((genre) => (
                            <div key={genre.id} className="genre-pill">
                                <input
                                    type="checkbox"
                                    id={`genre-${genre.id}`}
                                    value={genre.id}
                                    checked={selectedGenreIds.includes(genre.id)}
                                    onChange={handleGenreChange}
                                />
                                <label htmlFor={`genre-${genre.id}`}>{genre.name}</label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {loading && <p className="loading-text">Loading movies...</p>}
            {!loading && filteredMovies.length === 0 && (
                <p className="no-results-text">No movies found matching your criteria.</p>
            )}

            {!loading && filteredMovies.length > 0 && (
                <>
                    <div className="movie-grid">
                        {filteredMovies.map((movie) => (
                            <Link
                                key={movie.id}
                                to={`/movie/${movie.id}`}
                                state={{ movieIds: allMovieIds }} // <-- THIS IS THE REQUIRED CHANGE
                            >
                                <MovieCard movie={movie} />
                            </Link>
                        ))}
                    </div>

                    <div className="pagination">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            &larr; Previous
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            Next &rarr;
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default GalleryView;