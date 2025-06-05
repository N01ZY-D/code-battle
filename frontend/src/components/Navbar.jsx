import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import AuthContext from "../context/AuthContext";
import "./navbar.css"; // Предполагается, что стили находятся в этом файле

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleMenu = (e) => {
    setMenuOpen((prev) => !prev);
    e.currentTarget.blur(); // сбросить фокус с кнопки
  };

  const handleClickOutside = (e) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target) && // не в меню
      burgerRef.current &&
      !burgerRef.current.contains(e.target) // и не на кнопке
    ) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="navbar">
      {user && (
        <>
          <div className="avatar-container">
            <Avatar
              matrix={user.avatarMatrix}
              color={user.avatarColor}
              size={60}
            />
          </div>

          <div className="nav-right">
            <button
              type="button"
              className="burger"
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              ☰
            </button>

            <div className="nav-links-desktop">
              <Link to="/dashboard">
                <button className="nav-button">На главную</button>
              </Link>
              <Link to="/profile">
                <button className="nav-button">Профиль</button>
              </Link>
              <Link to="/leaderboard">
                <button className="nav-button">Таблица Лидеров</button>
              </Link>
              <button onClick={handleLogout} className="nav-button exit">
                Выйти
              </button>
            </div>
          </div>

          {menuOpen && (
            <div
              className={`mobile-menu-wrapper ${menuOpen ? "open" : ""}`}
              ref={menuRef}
            >
              <div className="mobile-menu">
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                  <button className="nav-button">На главную</button>
                </Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  <button className="nav-button">Профиль</button>
                </Link>
                <Link to="/leaderboard" onClick={() => setMenuOpen(false)}>
                  <button className="nav-button">Таблица Лидеров</button>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="nav-button exit"
                >
                  Выйти
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </nav>
  );
};

export default Navbar;
