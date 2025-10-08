// src/components/MovieCard.tsx

import React from 'react';
import { Movie } from '../types';
import { getImageUrl } from '../api/tmdbApi';
import './MovieCard.css';

// 1. Add the optional onPrev and onNext function props
interface MovieCardProps {
    movie: Movie;
    onPrev?: () => void; // Optional function to go to the previous movie
    onNext?: () => void; // Optional function to go to the next movie
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onPrev, onNext }) => {
    // Handler functions that stop the event from triggering the parent Link
    const handlePrevClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onPrev?.(); // Call the passed-in onPrev function if it exists
    };

    const handleNextClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onNext?.(); // Call the passed-in onNext function if it exists
    };

    return (
        <div className="movie-card">
            <img
                src={getImageUrl(movie.poster_path)}
                alt={`${movie.title} poster`}
                className="movie-poster"
            />
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>★ {movie.vote_average.toFixed(1)}</p>
            </div>

            {/* 2. Add the navigation overlay with buttons */}
            {/* This overlay will be shown on hover via CSS */}
            <div className="navigation-overlay">
                {onPrev && (
                    <button className="nav-button prev" onClick={handlePrevClick}>
                        &larr;
                    </button>
                )}
                {onNext && (
                    <button className="nav-button next" onClick={handleNextClick}>
                        &rarr;
                    </button>
                )}
            </div>
        </div>
    );
};

export default MovieCard;