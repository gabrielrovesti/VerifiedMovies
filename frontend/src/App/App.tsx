import React from 'react';
import './App.css';
import Router from './Router';
import NavBar from '../components/NavBar/NavBar';
import Footer from '../components/Footer/Footer';

export default function App() {

  return (
      <>
      <NavBar></NavBar>
        <Router />
      <Footer></Footer></>
  );
}
