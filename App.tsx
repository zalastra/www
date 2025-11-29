import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Downloader from './components/Downloader';
import AICaptionTool from './components/AICaptionTool';
import Footer from './components/Footer';
import { ToolMode } from './types';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<ToolMode>(ToolMode.DOWNLOADER);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentMode={currentMode} onNavigate={setCurrentMode} />
      
      <main className="flex-grow">
        {currentMode === ToolMode.DOWNLOADER ? (
          <Downloader />
        ) : (
          <AICaptionTool />
        )}
      </main>

      <div className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Why use Zalastra?</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Zalastra isn't just a downloader—it's your content creation companion. 
              While typical tools just save files, Zalastra helps you understand and enhance your media using advanced AI.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
               <div className="p-4 rounded-lg bg-slate-50">
                 <h4 className="font-bold text-slate-900 mb-2">Fast & Free</h4>
                 <p className="text-sm text-slate-600">No login required. Just paste and go. Optimized for speed.</p>
               </div>
               <div className="p-4 rounded-lg bg-slate-50">
                 <h4 className="font-bold text-slate-900 mb-2">AI Powered</h4>
                 <p className="text-sm text-slate-600">Leveraging Gemini 2.5 Flash for instant content analysis.</p>
               </div>
               <div className="p-4 rounded-lg bg-slate-50">
                 <h4 className="font-bold text-slate-900 mb-2">High Quality</h4>
                 <p className="text-sm text-slate-600">Get the best available resolution for photos and videos.</p>
               </div>
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default App;
