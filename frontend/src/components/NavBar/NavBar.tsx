import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "./NavBar.css";
import { useAuth } from "../../context/AuthContext";
import logo from "../../img/logo192.png";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const auth = useAuth();
  const { isAuthenticated = false, logout = () => {} } = auth || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  const navigate = useNavigate();

  const handleLogoutClick = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowLogoutModal(true);
    setLogoutMessage("Disconnessione in corso..");

    setTimeout(async () => {
      await logout();
      setShowLogoutModal(false);
      setLogoutMessage("");
      navigate("/");
    }, 2000);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-logo">
        <Link to="/">
          <img
            src={logo}
            alt="Logo del sito: clicca qui per tornare alla pagina principale"
            className="logo-image"
          />
        </Link>
      </div>
      <div className={`navbar-menu ${mobileMenuOpen ? "active" : ""}`}>
        <ul>
          {!isAuthenticated ? (
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
          ) : (
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

      {showLogoutModal && (
        <div className="logout-modal">
          <div className="logout-modal-content">
            <p>{logoutMessage}</p>
          </div>
        </div>
      )}
    </nav>
  );
}
