import React from 'react';
import './App.css';
import Router from './Router';
import NavBar from '../components/NavBar/NavBar';
import Footer from '../components/Footer/Footer';
import AuthProvider from '../context/AuthContext';

export default function App() {

  return (
      <AuthProvider>
        <NavBar></NavBar>
        <Router />
        <Footer></Footer>
      </AuthProvider>
  );
}
