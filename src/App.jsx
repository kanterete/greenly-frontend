import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AddMicroclimate from "./pages/AddMicroclimate";
import AddPlant from "./pages/AddPlant";
import Catalog from "./pages/Catalog";
import CatalogDetails from "./pages/CatalogDetails";
import Dashboard from "./pages/Dashboard";
import EditPlant from "./pages/EditPlant";
import Garden from "./pages/Garden";
import Login from "./pages/Login";
import Microclimates from "./pages/Microclimates";
import PlantDetails from "./pages/PlantDetails";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="garden" element={<Garden />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="catalog/:id" element={<CatalogDetails />} />
          <Route path="plants/add" element={<AddPlant />} />
          <Route path="plants/:id" element={<PlantDetails />} />
          <Route path="plants/:id/edit" element={<EditPlant />} />
          <Route path="microclimates" element={<Microclimates />} />
          <Route path="microclimates/add" element={<AddMicroclimate />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
