import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider, useLoading } from "@/contexts/LoadingContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoadingScreen from "@/components/loading/LoadingScreen";
import RouteLoadingHandler from "@/components/loading/RouteLoadingHandler";
import "@/lib/i18n";

// Public Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

// Client Portal Pages (lazy loaded)
const ClientDashboard = lazy(() => import("./pages/client/Dashboard"));
const MyAssets = lazy(() => import("./pages/client/MyAssets"));
const Documents = lazy(() => import("./pages/client/Documents"));
const ResaleRequest = lazy(() => import("./pages/client/ResaleRequest"));

// Admin Dashboard Pages (lazy loaded)
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const ManageProperties = lazy(() => import("./pages/admin/ManageProperties"));
const ManageDocuments = lazy(() => import("./pages/admin/ManageDocuments"));
const ManageResaleRequests = lazy(() => import("./pages/admin/ManageResaleRequests"));
const Settings = lazy(() => import("./pages/admin/Settings"));

const queryClient = new QueryClient();

// Inner app component that can use loading context
const AppContent = () => {
  const { isLoading } = useLoading();

  return (
    <>
      <LoadingScreen isLoading={isLoading} minDuration={1000} />
      <RouteLoadingHandler />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        
        {/* Client Portal Routes */}
        <Route
          path="/client-portal/dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={null}>
                <ClientDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-portal/assets"
          element={
            <ProtectedRoute>
              <Suspense fallback={null}>
                <MyAssets />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-portal/documents"
          element={
            <ProtectedRoute>
              <Suspense fallback={null}>
                <Documents />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-portal/resale"
          element={
            <ProtectedRoute>
              <Suspense fallback={null}>
                <ResaleRequest />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={null}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={null}>
                <ManageUsers />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/properties"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={null}>
                <ManageProperties />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={null}>
                <ManageDocuments />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/resale"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={null}>
                <ManageResaleRequests />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={null}>
                <Settings />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        {/* Language-prefixed routes */}
        <Route path="/en" element={<Navigate to="/" replace />} />
        <Route path="/ar" element={<Navigate to="/" replace />} />
        <Route path="/en/*" element={<Navigate to="/" replace />} />
        <Route path="/ar/*" element={<Navigate to="/" replace />} />
        
        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <LoadingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </LoadingProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
