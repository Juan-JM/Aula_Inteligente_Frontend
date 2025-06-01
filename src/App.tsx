import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { Layout } from "@/components/layout/Layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Dashboard } from "@/pages/Dashboard"
import { StudentsPage } from "@/pages/students/StudentsPage"
import { TeachersPage } from "@/pages/teachers/TeachersPage"
import { TutorsPage } from "@/pages/tutors/TutorsPage"
import { CoursesPage } from "@/pages/courses/CoursesPage"
import { SubjectsPage } from "@/pages/subjects/SubjectsPage"
import { RolesPage } from "@/pages/roles/RolesPage"
import { UsersPage } from "@/pages/users/UsersPage"
import { ProfilePage } from "@/pages/profile/ProfilePage"
import { Login } from "@/pages/Login"
import { GradesPage } from "@/pages/grades/GradesPage"
import { AttendancePage } from "@/pages/attendance/AttendancePage"
import { ParticipationPage } from "@/pages/participation/ParticipationPage"
import { ReportsPage } from "@/pages/reports/ReportsPage"
import { SettingsPage } from "@/pages/settings/SettingsPage"
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/students" element={<StudentsPage />} />
                      <Route path="/teachers" element={<TeachersPage />} />
                      <Route path="/tutors" element={<TutorsPage />} />
                      <Route path="/courses" element={<CoursesPage />} />
                      <Route path="/subjects" element={<SubjectsPage />} />
                      <Route path="/roles" element={<RolesPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/grades" element={<GradesPage />} />
                      <Route path="/attendance" element={<AttendancePage />} />
                      <Route path="/participation" element={<ParticipationPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
