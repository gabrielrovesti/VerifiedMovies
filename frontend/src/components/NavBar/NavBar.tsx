import { Link } from "react-router-dom";
import "./NavBar.css";
import { useAuth } from "../../context/AuthContext";
import logo from "../logo192.png"; 

export default function NavBar() {
  const { isAuthenticated, logout } = useAuth();

  const handleLogoutClick = () => {
    logout();
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="VerifiedMovies" className="logo-image" />
          </Link>      
        </div>
      <div>
        <ul className="navbar-menu">
          {!isAuthenticated && (
            <>
              <li className="navbar-menu-item">
                <Link to="/">Home</Link>
              </li>
              <li className="navbar-menu-item">
                <Link to="/login">Accedi</Link>
              </li>
              <li className="navbar-menu-item">
                <Link to="/register">Registrati</Link>
              </li>
            </>
          )}
          {isAuthenticated && (
            <>
              <li className="navbar-menu-item">
                <Link to="/movies">Film</Link>
              </li>
              <li className="navbar-menu-item">
                <Link to="/" onClick={handleLogoutClick}>Esci</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
