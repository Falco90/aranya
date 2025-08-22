import React from 'react';
import Navbar from '../components/Layout/Navbar';
import HeroSection from '../components/Landing/HeroSection';
import HowItWorks from '../components/Landing/HowItWorks';
import CoursePreviewSection from '../components/Landing/CoursePreviewSection';
import FAQSection from '../components/Landing/FAQSection';
import Footer from '../components/Layout/Footer';
import { CoursePreview } from '@/types/course';
interface LandingPageProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}
const LandingPage: React.FC<LandingPageProps> = async ({
  isLoggedIn,
  onLogin,
  onLogout
}) => {

  const [coursesResponse, countsResponse] = await Promise.all([
    fetch("http://localhost:4000/get-top-courses"),
    fetch("http://localhost:4000/get-counts"),
  ]);

  if (!coursesResponse.ok || !countsResponse.ok) {
    throw new Error("Failed to fetch data");
  }

  const [courses, counts] = await Promise.all([
    coursesResponse.json(),
    countsResponse.json(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
      <main>
        <HeroSection isLoggedIn={isLoggedIn} onLogin={onLogin} counts={counts} />
        <HowItWorks />
        <CoursePreviewSection courses={courses} />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
};
export default LandingPage;