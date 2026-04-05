import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="landing-hero">
        <img src="/Tomewise-logo.png" alt="Tomewise" className="landing-logo" />
        <h1>Tomewise</h1>
        <p className="landing-tagline">Your personal book collection, beautifully organised.</p>
        <div className="landing-actions">
          <Link to="/login" className="button-primary landing-button">Sign in</Link>
          <Link to="/register" className="button-secondary landing-button">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;