import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import UploadCsv from "./pages/UploadCsv";
import MappingTool from "./pages/MappingTool";
import DataIngestion from "./pages/DataIngestion";
import RecordViewing from "./pages/RecordViewing";
import APIDocs from "./pages/APIDocs";
import NamasteList from "./components/NamasteList";
import "./App.css";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Login />
          </motion.div>
        } />
        <Route
          path="/dashboard"
          element={
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route
          path="/upload-csv"
          element={
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ProtectedRoute>
                <UploadCsv />
              </ProtectedRoute>
            </motion.div>
          }
        />
                <Route
          path="/mapping-tool"
          element={
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ProtectedRoute>
                <MappingTool />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route
          path="/data-ingestion"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ProtectedRoute>
                <DataIngestion />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route
          path="/record-viewing"
          element={
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ProtectedRoute>
                <RecordViewing />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route
          path="/api-docs"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ProtectedRoute>
                <APIDocs />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route path="/namaste" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <NamasteList />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
