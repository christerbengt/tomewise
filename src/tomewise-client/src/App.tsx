import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MyBooksPage from "./pages/MyBooksPage";
import LocationsPage from "./pages/LocationsPage";
import LendingPage from "./pages/LendingPage";
import ListingsPage from "./pages/ListingsPage";
import Layout from "./components/Layout";
import AddBookPage from "./pages/AddBookPage";
import BookDetailPage from "./pages/BookDetailPage";
import LandingPage from "./pages/LandingPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminInvitesPage from "./pages/AdminInvitesPage";
import ProfilePage from "./pages/ProfilePage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <Layout>
              <AdminUsersPage />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/invites"
        element={
          <AdminRoute>
            <Layout>
              <AdminInvitesPage />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-books"
        element={
          <ProtectedRoute>
            <Layout>
              <MyBooksPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-books/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <BookDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-book"
        element={
          <ProtectedRoute>
            <Layout>
              <AddBookPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/locations"
        element={
          <ProtectedRoute>
            <Layout>
              <LocationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lending"
        element={
          <ProtectedRoute>
            <Layout>
              <LendingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings"
        element={
          <ProtectedRoute>
            <Layout>
              <ListingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
