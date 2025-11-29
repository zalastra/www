import React, { useState } from 'react';
import { Twitter, Facebook, Link as LinkIcon, Check, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);

  // Use window.location.origin if available, otherwise a placeholder for SSR/initial render
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://zalastra.com';
  const shareText = "Check out Zalastra - The best free Instagram Downloader and AI Tool!";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
             <span className="font-bold text-2xl text-slate-900">Zalastra</span>
             <p className="text-slate-500 text-sm mt-4 leading-relaxed">
               The fastest and most secure tool for downloading Instagram content. Save Reels, Videos, Photos, and Stories in high quality.
             </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Tools</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-brand-600 transition-colors">Instagram Downloader</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Reels Downloader</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Story Saver</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">AI Caption Generator</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-brand-600 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">DMCA</a></li>
            </ul>
          </div>

          <div>
             <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
             <p className="text-xs text-slate-400 leading-relaxed">
               Zalastra is not affiliated with Instagram™. We do not host any pirated or copyright content on our server. All downloaded content is served directly from their respective CDNs.
             </p>
          </div>
        </div>
        
        <div className="mt-12 border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm">© 2024 Zalastra. All rights reserved.</p>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-500 hidden sm:block">Share us:</span>
            
            <a 
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors hover:scale-110 transform duration-200"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>

            <a 
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-50 text-blue-400 rounded-full hover:bg-blue-100 transition-colors hover:scale-110 transform duration-200"
              title="Share on Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>

            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors hover:scale-110 transform duration-200"
              title="Share on Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>

            <button
              onClick={handleCopy}
              className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors hover:scale-110 transform duration-200"
              title="Copy Website Link"
            >
              {isCopied ? <Check className="w-5 h-5 text-green-600" /> : <LinkIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;