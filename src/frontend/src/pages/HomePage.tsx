import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  console.log("✅ HomePage mounted");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{ padding: "2rem", fontSize: "24px", color: "blue" }}>
      ✅ Minimal HomePage Render
    </div>
  );
};

export default HomePage; 