// src/views/ListView.tsx
import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { searchMovies, getImageUrl } from '../api/tmdbApi';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard'; // Reusable component
import { debounce } from 'lodash';
import './ListView.css'; // For basic styling

type SortKey = 'title' | 'release_date' | 'popularity' | 'vote_average';
type SortOrder = 'asc' | 'desc';

const ListView: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [sortKey, setSortKey] = useState<SortKey>('popularity');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Debounce the search input to avoid excessive API calls
    const debouncedSearch = useMemo(
        () =>
            debounce(async (searchQuery: string) => {
                if (!searchQuery.trim()) {
                    setMovies([]);
                    return;
                }
                setLoading(true);
                try {
                    const data = await searchMovies(searchQuery);
                    setMovies(data.results);
                } catch (error) {
                    console.error('Error searching movies:', error);
                    setMovies([]);
                } finally {
                    setLoading(false);
                }
            }, 500),
        []
    );

    useEffect(() => {
        debouncedSearch(query);
        return () => {
            debouncedSearch.cancel(); // Clean up on unmount
        };
    }, [query, debouncedSearch]);

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSortKey(event.target.value as SortKey);
    };

    const handleOrderChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(event.target.value as SortOrder);
    };

    const sortedAndFilteredMovies = useMemo(() => {
        // Client-side filtering as you type (already handled by debouncedSearch)
        // Here we focus on client-side sorting
        const sorted = [...movies].sort((a, b) => {
            let comparison = 0;
            if (sortKey === 'title') {
                comparison = a.title.localeCompare(b.title);
            } else if (sortKey === 'release_date') {
                comparison = a.release_date.localeCompare(b.release_date);
            } else if (sortKey === 'popularity') {
                comparison = a.popularity - b.popularity;
            } else if (sortKey === 'vote_average') {
                comparison = a.vote_average - b.vote_average;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });
        return sorted;
    }, [movies, sortKey, sortOrder]);
    const allMovieIds = sortedAndFilteredMovies.map(movie => movie.id);

    return (
        <div className="view-container">
            <h2>Movie List</h2>
            <div className="controls-container">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={query}
                    onChange={handleSearchChange}
                    className="search-bar"
                />
                <div className="sort-controls">
                    <label htmlFor="sort-by">Sort By:</label>
                    <select id="sort-by" value={sortKey} onChange={handleSortChange}>
                        <option value="popularity">Popularity</option>
                        <option value="title">Title</option>
                        <option value="release_date">Release Date</option>
                        <option value="vote_average">Vote Average</option>
                    </select>
                    <label htmlFor="sort-order">Order:</label>
                    <select id="sort-order" value={sortOrder} onChange={handleOrderChange}>
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>

            {loading && <p>Loading movies...</p>}
            {!loading && sortedAndFilteredMovies.length === 0 && query.trim() !== '' && <p>No movies found for "{query}".</p>}
            {!loading && sortedAndFilteredMovies.length === 0 && query.trim() === '' && <p>Type in to search</p>}

            <div className="movie-grid">
                {sortedAndFilteredMovies.map((movie) => (
                    <Link
                        key={movie.id}
                        to={`/movie/${movie.id}`}
                        state={{ movieIds: allMovieIds }}
                    >
                        <MovieCard movie={movie} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ListView;