import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <nav>
      <h1>E-Coffee Shop</h1>
      <button onClick={handleLoginClick}>Login</button>
    </nav>
  );
}

export default Navbar;
