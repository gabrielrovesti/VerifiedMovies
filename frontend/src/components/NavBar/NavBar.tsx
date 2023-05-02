import React from "react";
import "./NavBar.css";

export default function NavBar() {
  return (
    <nav className="navbar-container">
      <div className="navbar-logo">
        <h1>VerifiedMovies</h1>
      </div>
      <div>
        <ul className="navbar-menu">
          <li className="navbar-menu-item">
            <a href="/">Home</a>
          </li>
          <li className="navbar-menu-item">
            <a href="/register">Registrati</a>
          </li>
          <li className="navbar-menu-item">
            <a href="/login">Accedi</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
