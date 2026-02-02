import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ApiAuthProvider } from "@/contexts/ApiAuthContext";
import { LoadingProvider, useLoading } from "@/contexts/LoadingContext";
import { CompareProvider } from "@/contexts/CompareContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoadingScreen from "@/components/loading/LoadingScreen";
import RouteLoadingHandler from "@/components/loading/RouteLoadingHandler";
import CompareBar from "@/components/compare/CompareBar";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import "@/lib/i18n";

// Public Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Compare from "./pages/Compare";
import FindProperty from "./pages/FindProperty";

// Client Portal Pages (lazy loaded)
const ClientDashboard = lazy(() => import("./pages/client/Dashboard"));
const MyAssets = lazy(() => import("./pages/client/MyAssets"));
const Documents = lazy(() => import("./pages/client/Documents"));
const ResaleRequest = lazy(() => import("./pages/client/ResaleRequest"));
const EditProfile = lazy(() => import("./pages/client/EditProfile"));

// Admin Dashboard Pages (lazy loaded)
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const EditUser = lazy(() => import("./pages/admin/EditUser"));
const ManageProperties = lazy(() => import("./pages/admin/ManageProperties"));
const ManageDocuments = lazy(() => import("./pages/admin/ManageDocuments"));
const ManageResaleRequests = lazy(() => import("./pages/admin/ManageResaleRequests"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const ManageInventory = lazy(() => import("./pages/admin/ManageInventory"));
const ManageLeads = lazy(() => import("./pages/admin/ManageLeads"));
const ManageCMS = lazy(() => import("./pages/admin/ManageCMS"));
const GoogleSyncSettings = lazy(() => import("./pages/admin/GoogleSyncSettings"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminIntegrations = lazy(() => import("./pages/admin/Integrations"));
const AdminSEOAnalyzer = lazy(() => import("./pages/admin/SEOAnalyzer"));
const LeadsIntelligence = lazy(() => import("./pages/admin/LeadsIntelligence"));

// Agent Pages (lazy loaded)
const AgentDashboard = lazy(() => import("./pages/agent/Dashboard"));
const AgentProperties = lazy(() => import("./pages/agent/MyProperties"));

const queryClient = new QueryClient();

// Inner app component that can use loading context and location
const AppContent = () => {
  const { isLoading } = useLoading();
  const location = useLocation();
  const isComparePage = location.pathname === '/compare';

  return (
    <AnalyticsProvider>
      <LoadingScreen isLoading={isLoading} minDuration={1000} />
      <RouteLoadingHandler />
      {!isComparePage && <CompareBar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/find-property" element={<FindProperty />} />
        
        {/* Client Portal Routes */}
        <Route
          path="/client-portal/dashboard"
          element={
            <ProtectedRoute requiredRole="client">
              <Suspense fallback={null}>
                <ClientDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-portal/assets"
          element={
            <ProtectedRoute requiredRole="client">
              <Suspense fallback={null}>
                <MyAssets />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-portal/documents"
          element={
            <ProtectedRoute requiredRole="client">
              <Suspense fallback={null}>
                <Documents />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-portal/resale"
          element={
            <ProtectedRoute requiredRole="client">
              <Suspense fallback={null}>
                <ResaleRequest />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-portal/profile"
          element={
            <ProtectedRoute requiredRole="client">
              <Suspense fallback={null}>
                <EditProfile />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Agent Routes */}
        <Route
          path="/agent/dashboard"
          element={
            <ProtectedRoute requiredRole="agent">
              <Suspense fallback={null}>
                <AgentDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/properties"
          element={
            <ProtectedRoute requiredRole="agent">
              <Suspense fallback={null}>
                <AgentProperties />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <Suspense fallback={null}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <Suspense fallback={null}>
                <ManageUsers />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id/edit"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <Suspense fallback={null}>
                <EditUser />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/properties"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <Suspense fallback={null}>
                <ManageProperties />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <Suspense fallback={null}>
                <ManageInventory />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <Suspense fallback={null}>
                <ManageDocuments />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leads"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin', 'sales_agent']}>
              <Suspense fallback={null}>
                <ManageLeads />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/resale"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <Suspense fallback={null}>
                <ManageResaleRequests />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cms"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <Suspense fallback={null}>
                <ManageCMS />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <Suspense fallback={null}>
                <AdminSettings />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin', 'marketer', 'sales_manager']}>
              <Suspense fallback={null}>
                <AdminAnalytics />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/integrations"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <Suspense fallback={null}>
                <AdminIntegrations />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/seo"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <Suspense fallback={null}>
                <AdminSEOAnalyzer />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leads-intelligence"
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin', 'marketer', 'sales_manager']}>
              <Suspense fallback={null}>
                <LeadsIntelligence />
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
    </AnalyticsProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ApiAuthProvider>
        <LoadingProvider>
          <CompareProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </CompareProvider>
        </LoadingProvider>
      </ApiAuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
