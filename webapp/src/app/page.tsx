import React from 'react';
import Navbar from '../components/Landing/Navbar';
import HeroSection from '../components/Landing/HeroSection';
import HowItWorks from '../components/Landing/HowItWorks';
import CoursePreviewSection from '../components/Landing/CoursePreviewSection';
import ProfilesSection from '../components/Landing/ProfilesSection';
import FAQSection from '../components/Landing/FAQSection';
import Footer from '../components/Landing/Footer';
interface LandingPageProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}
const LandingPage: React.FC<LandingPageProps> = ({
  isLoggedIn,
  onLogin,
  onLogout
}) => {
  return <div className="min-h-screen flex flex-col bg-stone-50">
    <Navbar isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
    <main>
      <HeroSection isLoggedIn={isLoggedIn} onLogin={onLogin} />
      <HowItWorks />
      <CoursePreviewSection />
      <ProfilesSection />
      <FAQSection />
    </main>
    <Footer />
  </div>;
};
export default LandingPage;