import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import PatientDetails from "../components/PatientDetails";
import { fetchAllPatients, fetchAllBundles } from "../services/patientApi";
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
  Upload,
  Search,
  Bell,
  Settings,
  X,
  Stethoscope,
  Clipboard,
  Heart,
  Calendar,
  Shield,
} from "lucide-react";

const Dashboard = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalBundles: 0,
    recentRegistrations: 0,
    systemStatus: "online",
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [allPatients, setAllPatients] = useState([]);
  const [allBundles, setAllBundles] = useState([]);
  const [deletedBundles, setDeletedBundles] = useState(
    new Set(JSON.parse(localStorage.getItem("deletedBundles") || "[]"))
  );

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const patientsResponse = await fetchAllPatients();
      const bundlesResponse = await fetchAllBundles();

      const patients = patientsResponse.success ? patientsResponse.data : [];
      const bundles = bundlesResponse.success
        ? bundlesResponse.data.filter((b) => !deletedBundles.has(b.id))
        : [];

      setAllPatients(patients);
      setAllBundles(bundles);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentPatients = patients.filter(
        (p) => p.registrationDate && new Date(p.registrationDate) > sevenDaysAgo
      );

      setStats({
        totalPatients: patients.length,
        totalBundles: bundles.length,
        recentRegistrations: recentPatients.length,
        systemStatus: "online",
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalPatients: 0,
        totalBundles: 0,
        recentRegistrations: 0,
        systemStatus: "offline",
      });
    }
    setLoadingStats(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const handleBundlesUpdate = () => {
      fetchStats();
    };
    window.addEventListener("bundlesUpdated", handleBundlesUpdate);
    return () =>
      window.removeEventListener("bundlesUpdated", handleBundlesUpdate);
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const patientResults = allPatients
        .filter(
          (patient) =>
            patient.firstName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            patient.lastName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            patient.phoneNumber?.includes(searchTerm) ||
            patient.abhaId?.includes(searchTerm) ||
            patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
        .map((patient) => ({
          type: "patient",
          id: patient.id || patient.abhaId,
          title: `${patient.firstName} ${patient.lastName}`,
          subtitle: `Phone: ${patient.phoneNumber}`,
          details: `ABHA: ${patient.abhaId}`,
          icon: Users,
        }));

      const bundleResults = allBundles
        .filter(
          (bundle) =>
            bundle.resourceType
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            bundle.id?.includes(searchTerm)
        )
        .slice(0, 3)
        .map((bundle) => ({
          type: "bundle",
          id: bundle.id,
          title: bundle.resourceType || "FHIR Bundle",
          icon: FileText,
        }));

      setSearchResults([...patientResults, ...bundleResults]);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm, allPatients, allBundles]);

  const sections = [
    { id: "overview", name: "Dashboard", icon: "🏥", isTab: true },
    {
      id: "patient-registration",
      name: "Patient Details",
      icon: "👤",
      isTab: true,
    },
    {
      id: "mapping-tool",
      name: "Code Mapping",
      icon: "🔄",
      route: "/mapping-tool",
    },
    {
      id: "record-viewing",
      name: "Patient Records",
      icon: "📋",
      route: "/record-viewing",
    },
    { id: "upload-csv", name: "Data Upload", icon: "📤", route: "/upload-csv" },
    { id: "api-docs", name: "API Docs", icon: "📘", route: "/api-docs" },
  ];

  const quickActions = [
    {
      name: "Patient Details",
      icon: Users,
      action: () => setActiveTab("patient-registration"),
      color: "from-medical-light-blue to-blue-100 text-blue-700",
    },
    {
      name: "Code Mapping",
      icon: Stethoscope,
      action: () => (window.location.href = "/mapping-tool"),
      color: "from-medical-light-teal to-cyan-100 text-cyan-700",
    },
    {
      name: "Patient Records",
      icon: Clipboard,
      action: () => (window.location.href = "/record-viewing"),
      color: "from-medical-light-purple to-purple-100 text-purple-700",
    },
    {
      name: "API Docs",
      icon: FileText,
      action: () => (window.location.href = "/api-docs"),
      color: "from-medical-light-orange to-orange-100 text-orange-700",
    },
  ];

  const recentActivities = [
    {
      type: "patient",
      message: "New patient registered",
      time: "2 hours ago",
      icon: Users,
    },
    {
      type: "upload",
      message: "CSV data uploaded successfully",
      time: "4 hours ago",
      icon: Upload,
    },
    {
      type: "mapping",
      message: "Code mapping completed",
      time: "1 day ago",
      icon: FileText,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light-gray to-white">
      <nav className="bg-white/70 backdrop-blur shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {sections.map((section) =>
              section.route ? (
                <Link
                  key={section.id}
                  to={section.route}
                  className="flex items-center px-3 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                >
                  <span className="mr-2 text-lg">{section.icon}</span>
                  {section.name}
                </Link>
              ) : (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === section.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2 text-lg">{section.icon}</span>
                  {section.name}
                </button>
              )
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === "overview" ? (
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="bg-gradient-to-r from-medical-light-purple to-medical-light-teal rounded-xl p-6 border border-gray-100"
              variants={itemVariants}
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  className="p-3 bg-white rounded-full shadow-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </motion.div>
                <div>
                  <motion.h2
                    className="text-xl font-semibold text-gray-900 mb-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    Good morning, {user?.firstName} {user?.lastName}
                  </motion.h2>
                  <motion.p
                    className="text-gray-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    Ready to provide excellent patient care today?
                  </motion.p>
                  <motion.div
                    className="mt-2 flex items-center space-x-4 text-sm text-gray-600"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1 text-red-500" />
                      {stats.totalPatients} Active Patients
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                      {stats.recentRegistrations} New This Week
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
            >
              <motion.div
                className="bg-gradient-to-br from-medical-light-blue to-blue-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-50 rounded-full">
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    ) : (
                      <Users className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-700">
                      Total Patients
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {loadingStats ? "..." : stats.totalPatients}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-medical-light-green to-green-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-green-50 rounded-full">
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    ) : (
                      <FileText className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-700">
                      FHIR Bundles
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {loadingStats ? "..." : stats.totalBundles}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-orange-50 rounded-full">
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    ) : (
                      <Activity className="h-6 w-6 text-orange-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-700">
                      Recent Registrations
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {loadingStats ? "..." : stats.recentRegistrations}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={`bg-gradient-to-br ${
                  stats.systemStatus === "online"
                    ? "from-green-50 to-green-100"
                    : "from-red-50 to-red-100"
                } rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow`}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <div
                    className={`p-3 rounded-full ${
                      stats.systemStatus === "online"
                        ? "bg-green-50"
                        : "bg-red-50"
                    }`}
                  >
                    {loadingStats ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                    ) : (
                      <Shield
                        className={`h-6 w-6 ${
                          stats.systemStatus === "online"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700">
                      System Status
                    </p>
                    <p className="text-sm font-bold text-gray-900 capitalize">
                      {loadingStats ? "Loading..." : stats.systemStatus}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-100"
                variants={itemVariants}
              >
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-medical-light-blue to-white rounded-t-xl">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      onClick={action.action}
                      className={`bg-gradient-to-br ${action.color} p-4 rounded-lg hover:opacity-90 transition-all duration-200 flex flex-col items-center shadow-sm hover:shadow-md`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <action.icon className="h-6 w-6 mb-2 opacity-90" />
                      <span className="text-sm font-medium">{action.name}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-100"
                variants={itemVariants}
              >
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-medical-light-purple to-white rounded-t-xl">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={index}
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                        activity.type === "patient"
                          ? "bg-blue-50 border-blue-200"
                          : activity.type === "upload"
                          ? "bg-green-50 border-green-200"
                          : "bg-purple-50 border-purple-200"
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div
                        className={`p-2 rounded-full shadow-sm ${
                          activity.type === "patient"
                            ? "bg-blue-100"
                            : activity.type === "upload"
                            ? "bg-green-100"
                            : "bg-purple-100"
                        }`}
                      >
                        <activity.icon
                          className={`h-4 w-4 ${
                            activity.type === "patient"
                              ? "text-blue-600"
                              : activity.type === "upload"
                              ? "text-green-600"
                              : "text-purple-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100"
              variants={itemVariants}
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-medical-light-teal to-white rounded-t-xl">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Patient ABHA IDs - Demo Login Options
                </h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Click on any patient to login as them for demo purposes:
                </p>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {allPatients.length > 0 ? (
                    allPatients.map((patient, index) => (
                      <motion.div
                        key={patient.abhaId || index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={async () => {
                          const result = await login(patient.abhaId);
                          if (result.success) {
                            window.location.reload();
                          } else {
                            alert("Login failed: " + result.error);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <p className="text-sm text-gray-600 font-mono">
                              {patient.abhaId}
                            </p>
                          </div>
                        </div>
                        <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                          Login as User
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No patients available for demo login.
                    </p>
                  )}
                </div>
              </div>
            </motion.div> */}

            <motion.div
              className="bg-gradient-to-r from-medical-light-gray to-medical-light-blue rounded-xl shadow-sm p-6 border border-gray-100"
              variants={itemVariants}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <input
                      type="text"
                      placeholder="Search patients, records, or data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onBlur={() =>
                        setTimeout(() => setShowSearchResults(false), 200)
                      }
                      onFocus={() => searchTerm && setShowSearchResults(true)}
                      className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                    />
                    {showSearchResults && searchResults.length > 0 && (
                      <motion.div
                        className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto border"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {searchResults.map((result, index) => (
                          <motion.div
                            key={`${result.type}-${result.id}-${index}`}
                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer last:border-b-0 border-gray-200"
                            onClick={() => {
                              if (result.type === "patient") {
                                window.location.href = `/record-viewing?id=${result.id}`;
                              } else {
                                console.log("Bundle clicked:", result.id);
                              }
                              setShowSearchResults(false);
                              setSearchTerm("");
                            }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            whileHover={{ backgroundColor: "#f9fafb" }}
                          >
                            <div className="p-2 bg-blue-50 rounded-full mr-3">
                              <result.icon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {result.title}
                              </p>
                              <p className="text-xs text-gray-600">
                                {result.subtitle}
                              </p>
                              <p className="text-xs text-gray-500">
                                {result.details}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
                <motion.button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-sm hover:shadow-md transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <PatientDetails />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
