import { LoginPage } from "../features/auth/pages/LoginPage";
import { useAuth } from "../features/auth/hooks/useAuth";
import { ReelsPage } from "../features/reels/pages/ReelsPage";

export function App() {
  const { user } = useAuth();

  return user ? <ReelsPage /> : <LoginPage />;
}
