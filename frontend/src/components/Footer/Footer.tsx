import React from "react";
import "./Footer.css";

export default function Footer() {
  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="footer-container">
      <div className="footer-content">
        <p><span lang="en">VerifiedMovies</span> - Gabriel Rovesti - 2023.</p>
        <a href="#" className="back-to-top sr-only" onClick={handleBackToTop}>
          Torna su
        </a>
      </div>
    </div>
  );
}
