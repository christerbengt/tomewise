import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Welcome to Tomewise</h1>
      <button onClick={logout}>Sign out</button>
    </div>
  );
};

export default DashboardPage;