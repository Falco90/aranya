import CoursesList from "../../components/MyCourses/CoursesList"
import Navbar from "@/components/Layout/Navbar"

interface MyCoursesPageProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const MyCoursesPage: React.FC<MyCoursesPageProps> = (
  {
    isLoggedIn,
    onLogin,
    onLogout
  }
) => {
  return (
    <div className="w-full min-h-screen bg-stone-50">
      <Navbar isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
      <CoursesList />
    </div>
  )
}

export default MyCoursesPage;