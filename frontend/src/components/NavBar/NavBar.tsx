import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "./NavBar.css";
import { useAuth } from "../../context/AuthContext";
import logo from "../logo192.png";

export default function NavBar() {
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="VerifiedMovies" className="logo-image" />
        </Link>
      </div>
      <div className={`navbar-menu ${mobileMenuOpen ? "active" : ""}`}>
        <ul>
          {!isAuthenticated && (
            <>
              <li className="navbar-menu-item">
                <Link to="/" onClick={toggleMobileMenu}>
                  Home
                </Link>
              </li>
              <li className="navbar-menu-item">
                <Link to="/login" onClick={toggleMobileMenu}>
                  Accedi
                </Link>
              </li>
              <li className="navbar-menu-item">
                <Link to="/register" onClick={toggleMobileMenu}>
                  Registrati
                </Link>
              </li>
            </>
          )}
          {isAuthenticated && (
            <>
              <li className="navbar-menu-item">
                <Link to="/movies" onClick={toggleMobileMenu}>
                  Film
                </Link>
              </li>
              <li className="navbar-menu-item">
                <Link to="/account" onClick={toggleMobileMenu}>
                  Profilo
                </Link>
              </li>
              <li className="navbar-menu-item">
                <Link to="/bookings" onClick={toggleMobileMenu}>
                  Prenotazioni
                </Link>
              </li>
              <li className="navbar-menu-item">
                <Link to="/" onClick={handleLogoutClick}>
                  Esci
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </div>
    </nav>
  );
}
