import { useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  syncPathname,
  ACTION_NAVIGATE_SYNC,
  type NavigateSyncResponse,
} from "@tiendanube/nexo";
import nexo from "../nexoClient";
import { ChecklistIndex } from "../pages/ChecklistIndex/ChecklistIndex";
import { ChecklistResults } from "../pages/ChecklistResults/ChecklistResults";

export function AppRouter() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = search ? `${pathname}${search}` : pathname;
    syncPathname(nexo, path);
  }, [pathname, search]);

  useEffect(() => {
    const unsubscribe = nexo.suscribe(
      ACTION_NAVIGATE_SYNC,
      ({ path, replace }: NavigateSyncResponse) => {
        navigate(path, { replace });
      }
    );
    return unsubscribe;
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<ChecklistIndex />} />
      <Route path="/checklists/:id" element={<ChecklistResults />} />
    </Routes>
  );
}
