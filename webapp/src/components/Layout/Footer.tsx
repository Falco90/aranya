import React from 'react';
import { Computer, Link } from 'lucide-react';

const Footer: React.FC = () => {
  return <footer className="bg-stone-800 text-stone-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-stone-400 text-sm">
          &copy; {new Date().getFullYear()} Aranya. All rights reserved.
        </p>
        <div className="mt-4 md:mt-0 flex space-x-6 text-sm">
          <a href="https://github.com/Falco90/aranya" className="text-stone-400 hover:text-amber-500">
            <Computer />
          </a>
          <a href={`https://coston2-explorer.flare.network/address/${process.env.NEXT_PUBLIC_COURSE_MANAGER_ADDRESS}?tab=contract`} className="text-stone-400 hover:text-amber-500">
            <Link />
          </a>
        </div>
      </div>
    </div>
  </footer>;
};
export default Footer;