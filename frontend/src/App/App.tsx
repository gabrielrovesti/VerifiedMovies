import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import NavBar from '../components/NavBar/NavBar';
import LoginView from '../views/LoginView/LoginView';
import HomePage from '../views/HomePage/HomePage';
import RegisterView from '../views/RegisterView/RegisterView';
import MoviesView from '../views/MoviesView/MoviesView';
import AccountView from '../views/AccountView/AccountView';
import MovieBookingView from '../views/MovieBookingView/MovieBookingView';
import BookingListView from '../views/BookingListView/BookingListView';
import { AuthProvider } from '../context/AuthContext';
import ErrorView from '../views/ErrorView/ErrorView';
import PrivateRoute from '../components/PrivateRoute/PrivateRoute';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route
            path="/movies"
            element={
              <PrivateRoute redirectTo="/login">
                <MoviesView />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute redirectTo="/login">
                <AccountView />
              </PrivateRoute>
            }
          />
          <Route
            path="/movies/:id/book"
            element={
              <PrivateRoute redirectTo="/login">
                <MovieBookingView />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <PrivateRoute redirectTo="/login">
                <BookingListView />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<ErrorView />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}
