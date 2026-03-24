import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [fetchMe, token]);

  if (isCheckingAuth) {
    return <div>កំពុងពិនិត្យការចូលប្រើ...</div>;
  }

  return <AppRoutes />;
}

export default App;