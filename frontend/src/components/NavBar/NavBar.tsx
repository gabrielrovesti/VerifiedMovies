import { useContext } from "react";
import "./NavBar.css";
import { AuthContext } from "../../context/AuthContext";

export default function NavBar() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('Auth context not found');
  }

  const { isAuthenticated, logout } = authContext;

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
          {isAuthenticated ? (
            <>
              <li className="navbar-menu-item">
                <a href="/movies">Movies</a>
              </li>
              <li className="navbar-menu-item">
                <button onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-menu-item">
                <a href="/register">Registrati</a>
              </li>
              <li className="navbar-menu-item">
                <a href="/login">Accedi</a>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}