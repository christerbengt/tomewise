import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="landing-hero">
        <img src="/Tomewise-logo.png" alt="Tomewise" className="landing-logo" />
        <h1>Tomewise</h1>
        <p className="landing-tagline">Your personal book collection, beautifully organised.</p>
        <span className="landing-subtitle">Books in Order</span>
        <div className="landing-actions">
          <Link to="/login" className="button-primary landing-button">Sign in</Link>
          <Link to="/register" className="button-secondary landing-button">Create account</Link>
        </div>
        <p className="landing-support">
          Free and open source —{' '}
          <a href="https://ko-fi.com/christerbengt" target="_blank" rel="noreferrer">
            support development on Ko-fi
          </a>
        </p>
      </div>
    </div>
  );
};

export default LandingPage;