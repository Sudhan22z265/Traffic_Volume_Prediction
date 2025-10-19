import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const handleGoToPredict = () => {
    const auth = localStorage.getItem("tvp_auth");
    let isAuthenticated = false;
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        isAuthenticated = !!parsed.authenticated;
      } catch {}
    }
    if (isAuthenticated) {
      navigate("/predict");
    } else {
      navigate("/login");
    }
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#f4f8fb' }}>
      <div style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 12, padding: '2.5rem 2rem', maxWidth: 480, textAlign: 'center' }}>
        <img src="https://img.icons8.com/color/96/traffic-jam.png" alt="Traffic" style={{ marginBottom: 16 }} />
        <h1 style={{ color: '#2d3e50', marginBottom: 12 }}>Traffic Volume Prediction</h1>
        <p style={{ color: '#4a5a6a', fontSize: 18, marginBottom: 24 }}>
          Welcome! Use the <b>Predict</b> page to get traffic volume predictions.<br />
          You can also login or sign up for more features.
        </p>
        <button onClick={handleGoToPredict} style={{ display: 'inline-block', background: '#1976d2', color: '#fff', padding: '0.75rem 2rem', borderRadius: 6, border: 'none', fontWeight: 500, fontSize: 17, cursor: 'pointer' }}>Go to Predict</button>
      </div>
    </div>
  );
}

export default Home;


