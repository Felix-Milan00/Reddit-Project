import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CreatePost } from './pages/CreatePost';
import { CreateCommunity } from './pages/CreateCommunity';
import { Community } from './pages/Community';
import { PostDetail } from './pages/PostDetail';
import { UserProfile } from './pages/UserProfile';
import { SavedPosts } from './pages/SavedPosts';
import { Search } from './pages/Search';
import { Settings } from './pages/Settings';

import { Popular } from './pages/Popular';
import { Communities } from './pages/Communities';

function App() {
  const { initialize, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-reddit-light dark:bg-reddit-dark text-gray-500">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/popular" element={<Popular />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/communities/create" element={<CreateCommunity />} />
          <Route path="/r/:communityName" element={<Community />} />
          <Route path="/r/:communityName/comments/:postId" element={<PostDetail />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/saved" element={<SavedPosts />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings/profile" element={<Settings />} />
          {/* We will add more routes here later */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
