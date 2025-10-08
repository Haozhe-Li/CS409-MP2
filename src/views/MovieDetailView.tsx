// src/views/MovieDetailView.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getMovieDetails, getImageUrl } from '../api/tmdbApi'; // Ensure correct path
import { MovieDetail } from '../types';
import './MovieDetailView.css'; // Import the styles

const MovieDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Get the list of movie IDs passed from the previous page
    const movieIds: number[] = location.state?.movieIds || [];
    const currentMovieId = Number(id);
    const currentIndex = movieIds.indexOf(currentMovieId);

    // Determine if there is a previous or next movie in the list
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < movieIds.length - 1;

    useEffect(() => {
        // Scroll to the top of the page whenever a new movie ID is loaded
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const fetchDetail = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                const data = await getMovieDetails(Number(id));
                setMovie(data);
            } catch (err) {
                console.error('Error fetching movie details:', err);
                setError('Failed to load movie details. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]); // Re-run this effect every time the ID in the URL changes

    const navigateToMovie = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && hasPrevious) {
            const prevMovieId = movieIds[currentIndex - 1];
            navigate(`/movie/${prevMovieId}`, { state: { movieIds } }); // Pass state along
        } else if (direction === 'next' && hasNext) {
            const nextMovieId = movieIds[currentIndex + 1];
            navigate(`/movie/${nextMovieId}`, { state: { movieIds } }); // Pass state along
        }
    };

    if (loading) return <p className="status-text">Loading movie details...</p>;
    if (error) return <p className="status-text error-text">{error}</p>;
    if (!movie) return <p className="status-text">Movie not found.</p>;

    return (
        <div className="movie-detail-container">
            <div className="detail-navigation">
                <button onClick={() => navigateToMovie('prev')} disabled={!hasPrevious}>
                    &larr; Previous
                </button>
                <button onClick={() => navigateToMovie('next')} disabled={!hasNext}>
                    Next &rarr;
                </button>
            </div>

            <div className="detail-content">
                <div className="detail-poster-container">
                    <img src={getImageUrl(movie.poster_path)} alt={movie.title} className="detail-poster" />
                </div>
                <div className="detail-info">
                    <h1>{movie.title} <span className="release-year">({new Date(movie.release_date).getFullYear()})</span></h1>
                    {movie.tagline && <p className="tagline">"{movie.tagline}"</p>}

                    <h3>Overview</h3>
                    <p>{movie.overview}</p>

                    <div className="info-grid">
                        <div><strong>Rating:</strong> ★ {movie.vote_average.toFixed(1)} ({movie.vote_count} votes)</div>
                        <div><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} min` : 'N/A'}</div>
                        <div><strong>Genres:</strong> {movie.genres?.map(g => g.name).join(', ') || 'N/A'}</div>
                        <div><strong>Release Date:</strong> {movie.release_date}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetailView;