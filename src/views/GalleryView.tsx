import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { discoverMovies, getMovieGenres } from '../api/tmdbApi';
import { Movie, Genre } from '../types';
import MovieCard from '../components/MovieCard';
import './GalleryView.css';

const GalleryView: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

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

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const data = await discoverMovies(currentPage, selectedGenreIds);
                setMovies(data.results);
                setTotalPages(data.total_pages > 500 ? 500 : data.total_pages); // TMDB API caps results at page 500 for discover
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [currentPage, selectedGenreIds]); // Re-fetch when page or genres change

    const handleGenreChange = (event: ChangeEvent<HTMLInputElement>) => {
        const genreId = Number(event.target.value);
        setSelectedGenreIds((prev) =>
            event.target.checked ? [...prev, genreId] : prev.filter((id) => id !== genreId)
        );
        setCurrentPage(1); // Reset to first page when genre filters change
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
        }
    };

    // Get all movie IDs for the current page to pass to the detail view
    const allMovieIds = movies.map(movie => movie.id);

    return (
        <div className="view-container gallery-view">
            <h2>Movie Gallery</h2>
            <div className="controls-container">
                {/* Search bar removed */}
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
            {!loading && movies.length === 0 && (
                <p className="no-results-text">No movies found matching your criteria.</p>
            )}

            {!loading && movies.length > 0 && (
                <>
                    <div className="movie-grid">
                        {movies.map((movie) => (
                            <Link
                                key={movie.id}
                                to={`/movie/${movie.id}`}
                                state={{ movieIds: allMovieIds }}
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