import { useCallback, useContext } from "react";
import { AuthContext } from "../store/auth.context";
import { loginApi } from "../services/auth.service";
import type { LoginInput } from "../types";
import { getErrorMessage } from "../../../shared/lib/api";

export function useAuth() {
  const state = useContext(AuthContext);

  if (!state) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  const {
    user,
    isAuthenticated,
    loading,
    error,
    setUser,
    setLoading,
    setError,
  } = state;

  const handleLogin = useCallback(
    async (input: LoginInput) => {
      setLoading(true);
      setError(null);

      try {
        const response = await loginApi(input);
        setUser(response.user);
      } catch (caughtError) {
        setError(getErrorMessage(caughtError));
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setUser]
  );

  const handleLogout = useCallback(() => {
    setUser(null);
    setError(null);
  }, [setError, setUser]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    handleLogin,
    handleLogout,
  };
}
