// src/api/tmdbApi.ts
import axios from "axios";
import { MovieSearchResponse, MovieDetail, Genre } from "../types";

const API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOGQ1MDA0NTQyYWYzYjE3MDMwMDkyZWZlYzFkMmQ2MyIsIm5iZiI6MTc1OTg4ODU1Ni41NDQ5OTk4LCJzdWIiOiI2OGU1YzRhY2Y1ZjZkOTM4YzI3OTRmNGQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.wq8ZJty79u64N6FIOOZUW2Vy-TAOmDA-5gfwQt3I2EI";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    accept: "application/json",
  },
});

export const searchMovies = async (
  query: string,
  page: number = 1
): Promise<MovieSearchResponse> => {
  const response = await api.get(`/search/movie`, {
    params: { query, page },
  });
  return response.data;
};

// NEW FUNCTION to discover movies by genre and popularity
export const discoverMovies = async (
  page: number = 1,
  genreIds: number[] = []
): Promise<MovieSearchResponse> => {
  const params: { page: number; sort_by: string; with_genres?: string } = {
    page,
    sort_by: "popularity.desc",
  };

  if (genreIds.length > 0) {
    params.with_genres = genreIds.join(",");
  }

  const response = await api.get(`/discover/movie`, { params });
  return response.data;
};

export const getMovieDetails = async (id: number): Promise<MovieDetail> => {
  const response = await api.get(`/movie/${id}`);
  return response.data;
};

export const getMovieGenres = async (): Promise<{ genres: Genre[] }> => {
  const response = await api.get(`/genre/movie/list`);
  return response.data;
};

export const getImageUrl = (path: string | null): string => {
  return path ? `${IMAGE_BASE_URL}${path}` : "https://picsum.photos/200/300";
};
