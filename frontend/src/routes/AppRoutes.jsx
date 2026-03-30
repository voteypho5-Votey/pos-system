import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import Dashboard from "../pages/dashboard/Dashboard";
import Category from "../pages/category/Category";
import Product from "../pages/product/Product";
import Sale from "../pages/sale/Sale";
import Pos from "../pages/pos/Pos";
import IncomeReport from "../pages/reports/IncomeReport";
import StockReport from "../pages/reports/StockReport";
import Report from "../pages/Report";
import Exchange from "../pages/Exchange/Exchange";

function AppRoutes() {
  const user = useAuthStore((state) => state.user);

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />

      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/" replace />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="category"
          element={
            <RoleRoute allowRoles={["admin"]}>
              <Category />
            </RoleRoute>
          }
        />

        <Route
          path="product"
          element={
            <RoleRoute allowRoles={["admin"]}>
              <Product />
            </RoleRoute>
          }
        />

        <Route
          path="income-report"
          element={
            <RoleRoute allowRoles={["admin"]}>
              <IncomeReport />
            </RoleRoute>
          }
        />

        <Route
          path="stock-report"
          element={
            <RoleRoute allowRoles={["admin"]}>
              <StockReport />
            </RoleRoute>
          }
        />

        <Route
          path="report"
          element={
            <RoleRoute allowRoles={["admin"]}>
              <Report />
            </RoleRoute>
          }
        />

        <Route
          path="sale"
          element={
            <RoleRoute allowRoles={["admin", "user"]}>
              <Sale />
            </RoleRoute>
          }
        />

        <Route
          path="pos"
          element={
            <RoleRoute allowRoles={["admin", "user"]}>
              <Pos />
            </RoleRoute>
          }
        />

         <Route
          path="exchange"
          element={
            <RoleRoute allowRoles={["admin"]}>
              <Exchange />
            </RoleRoute>
          }
        />
        
      </Route>
      

      
       
      

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;