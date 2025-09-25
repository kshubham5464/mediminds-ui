import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import UploadCsv from "./pages/UploadCsv";
import DataAnalytics from "./pages/DataAnalytics";
import MappingTool from "./pages/MappingTool";
import DataIngestion from "./pages/DataIngestion";
import RecordViewing from "./pages/RecordViewing";
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
            transition={{ duration: 0.3 }}
          >
            <Login />
          </motion.div>
        } />
        <Route
          path="/dashboard"
          element={
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <ProtectedRoute>
                <UploadCsv />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route
          path="/data-analytics"
          element={
            <motion.div
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.3 }}
            >
              <ProtectedRoute>
                <DataAnalytics />
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
              transition={{ duration: 0.3 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
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
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <ProtectedRoute>
                <RecordViewing />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route path="/namaste" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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