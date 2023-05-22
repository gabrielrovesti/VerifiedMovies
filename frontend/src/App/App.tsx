import React from 'react';
import './App.css';
import Footer from '../components/Footer/Footer';
import NavBar from '../components/NavBar/NavBar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginView from '../views/LoginView/LoginView';
import HomePage from '../views/HomePage/HomePage';
import RegisterView from '../views/RegisterView/RegisterView';
import MoviesView from '../views/MoviesView/MoviesView';
import AccountView from '../views/AccountView/AccountView';
import MovieBookingView from '../views/MovieBookingView/MovieBookingView';
import BookingListView from '../views/BookingListView/BookingListView';
import { AuthProvider } from '../context/AuthContext';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/movies" element={<MoviesView />} />
          <Route path="/account" element={<AccountView />} />
          <Route path="/movies/:id/book" element={<MovieBookingView />} />
          <Route path="/bookings" element={<BookingListView />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}
