// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import ListView from './views/ListView';
import GalleryView from './views/GalleryView';
import MovieDetailView from './views/MovieDetailView';
import './App.css'; // For basic styling

const App: React.FC = () => {
  return (
    // <Router basename="/<your-github-repo-name>">
    <Router>
      <header>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/list">Movie List</NavLink>
          <NavLink to="/gallery">Movie Gallery</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/list" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/movie/:id" element={<MovieDetailView />} />
        </Routes>
      </main>
    </Router>
  );
};

// src/App.tsx
const Home: React.FC = () => (
  <div className="home-view">
    <h1>Movie Database</h1>
    <p>CS 409 MP2 Haozhe Li</p>
  </div>
);

export default App;