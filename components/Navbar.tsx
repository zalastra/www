import React from 'react';
import { Menu, Zap } from 'lucide-react';
import { NavItem, ToolMode } from '../types';

interface NavbarProps {
  currentMode: ToolMode;
  onNavigate: (mode: ToolMode) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentMode, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems: NavItem[] = [
    { label: 'Instagram Downloader', mode: ToolMode.DOWNLOADER },
    { label: 'AI Magic Captions', mode: ToolMode.AI_CAPTION },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer group"
            onClick={() => onNavigate(ToolMode.DOWNLOADER)}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-brand-600 to-pink-500 rounded-lg flex items-center justify-center mr-2 shadow-lg group-hover:shadow-brand-500/30 transition-all">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              Zalastra
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.mode}
                onClick={() => onNavigate(item.mode)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  currentMode === item.mode
                    ? 'text-brand-600'
                    : 'text-slate-600 hover:text-brand-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.mode}
                onClick={() => {
                  onNavigate(item.mode);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  currentMode === item.mode
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
