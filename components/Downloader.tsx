
import React, { useState, useRef } from 'react';
import { Download, Link as LinkIcon, AlertCircle, CheckCircle2, Video, Image as ImageIcon, Loader2, Play, FileDown, Copy, Check } from 'lucide-react';
import { MediaResult } from '../types';

const RAPID_API_KEY = 'c8561fa89bmsh248c6d835a5c86ap1dcd48jsnf0281bd581b6';
const RAPID_API_HOST = 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com';

const Downloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MediaResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard) {
         throw new Error("Clipboard API not available");
      }
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
      // Fallback: Focus input and instruct user
      setError('Auto-paste blocked by browser. Please press Ctrl+V to paste.');
      inputRef.current?.focus();
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const cleanInstagramUrl = (inputUrl: string): string => {
    try {
      let urlObj: URL;
      try {
        urlObj = new URL(inputUrl);
      } catch {
        urlObj = new URL(`https://${inputUrl}`);
      }

      // Enforce https and www.instagram.com
      urlObj.protocol = 'https:';
      urlObj.hostname = 'www.instagram.com';
      
      // Remove query params
      urlObj.search = ''; 
      
      // Remove trailing slash if present
      if (urlObj.pathname.endsWith('/')) {
        urlObj.pathname = urlObj.pathname.slice(0, -1);
      }
      
      return urlObj.toString();
    } catch (e) {
      // Fallback manual cleanup
      return inputUrl.split('?')[0];
    }
  };

  const extractShortcode = (inputUrl: string): string | null => {
    try {
      const urlObj = new URL(inputUrl);
      const parts = urlObj.pathname.split('/').filter(p => p.length > 0);
      // Matches /p/CODE, /reel/CODE, /reels/CODE, /tv/CODE
      const typeIndex = parts.findIndex(p => ['p', 'reel', 'reels', 'tv'].includes(p));
      if (typeIndex !== -1 && parts[typeIndex + 1]) {
        return parts[typeIndex + 1];
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const fetchData = async (endpoint: string, params: Record<string, string>) => {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`https://${RAPID_API_HOST}/${endpoint}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST
        }
      });
      
      if (!response.ok) {
          let errorDetail = "";
          try {
             const errData = await response.json();
             // Try to find the most relevant error message in common fields
             errorDetail = errData.message || errData.detail || errData.error || errData.description || "";
             
             // Sometimes the API returns a string directly as the body
             if (typeof errData === 'string') errorDetail = errData;
          } catch(e) {
             // If JSON parsing fails, use status text
             errorDetail = response.statusText;
          }

          // Return specific error types for the handler to interpret
          if (response.status === 404) {
             throw new Error(`Not Found: ${errorDetail}`);
          }
          if (response.status === 400) {
             throw new Error(`Bad Request: ${errorDetail}`);
          }
          if (response.status === 401 || response.status === 403) {
             throw new Error(`Unauthorized: ${errorDetail}`);
          }
          if (response.status === 429) {
             throw new Error("Rate Limit Exceeded");
          }

          throw new Error(errorDetail || `API Error: ${response.status}`);
      }
      
      return await response.json();
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError('Please paste a valid Instagram URL first');
      return;
    }
    if (!url.includes('instagram.com') && !url.includes('instagr.am')) {
      setError('Invalid URL. Please make sure it is an Instagram link.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);
    setLoadingStep("Connecting to Instagram Server...");

    try {
      const cleanUrl = cleanInstagramUrl(url);
      const shortcode = extractShortcode(url);
      let data: any = null;
      let lastError = null;

      // Strategy 1: /media_download with CLEAN URL (Primary)
      if (!data) {
        try {
          setLoadingStep("Fetching media (Strategy 1)...");
          data = await fetchData('media_download', { url: cleanUrl });
        } catch (err: any) {
          console.warn("Strategy 1 failed:", err.message);
          lastError = err;
        }
      }

      // Strategy 2: /media_info with CLEAN URL
      if (!data) {
        try {
            setLoadingStep("Trying info endpoint (Strategy 2)...");
            data = await fetchData('media_info', { link: cleanUrl });
        } catch (err: any) {
            console.warn("Strategy 2 failed:", err.message);
            lastError = err;
        }
      }

       // Strategy 3: /media_download with ORIGINAL URL (Fallback for signed/param-heavy links)
       if (!data) {
        try {
          setLoadingStep("Trying original link (Strategy 3)...");
          data = await fetchData('media_download', { url: url });
        } catch (err: any) {
          console.warn("Strategy 3 failed:", err.message);
          lastError = err;
        }
      }

      // Strategy 4: /media_info with ORIGINAL URL
      if (!data) {
        try {
            setLoadingStep("Trying info fallback (Strategy 4)...");
            data = await fetchData('media_info', { link: url });
        } catch (err: any) {
            console.warn("Strategy 4 failed:", err.message);
            lastError = err;
        }
      }

      // Strategy 5: /media with 'shortcode'
      if (!data && shortcode) {
        try {
            setLoadingStep("Trying shortcode lookup (Strategy 5)...");
            data = await fetchData('media', { shortcode: shortcode });
        } catch (err: any) {
             console.warn("Strategy 5 failed:", err.message);
             lastError = err;
        }
      }

      if (!data) {
        // Detailed error reporting based on the last error encountered
        const errorMessage = lastError?.message || "";
        
        if (errorMessage.includes("Not Found") || errorMessage.includes("404")) {
           throw new Error("Content not found. The post might be deleted, or the link is incorrect.");
        }
        
        if (errorMessage.includes("Bad Request") || errorMessage.includes("400") || errorMessage.includes("Unauthorized")) {
           throw new Error("Unable to access this post. The account is likely private or the link is expired.");
        }
        
        if (errorMessage.includes("Rate Limit")) {
            throw new Error("Server is busy. Please try again in a few seconds.");
        }

        // Fallback generic error if we have a raw message from API, show it, otherwise generic
        const cleanMsg = errorMessage.replace("API Error:", "").trim();
        throw new Error(cleanMsg || "Failed to retrieve media. Please ensure the link is correct and public.");
      }

      setLoadingStep("Processing media...");
      console.log('API Response:', data);

      // Robust Parsing Logic
      let videoUrl = null;
      let imageUrl = null;
      let type: 'video' | 'image' = 'image';

      // Normalize data structure
      const root = data.data || data; 

      // Check for video
      if (root.video_url) videoUrl = root.video_url;
      else if (root.video_versions && root.video_versions.length > 0) videoUrl = root.video_versions[0].url;
      else if (root.items && root.items[0]?.video_versions?.[0]?.url) videoUrl = root.items[0].video_versions[0].url;

      // Check for image
      if (root.display_url) imageUrl = root.display_url;
      else if (root.image_versions2?.candidates?.[0]?.url) imageUrl = root.image_versions2.candidates[0].url;
      else if (root.items && root.items[0]?.image_versions2?.candidates?.[0]?.url) imageUrl = root.items[0].image_versions2.candidates[0].url;
      
      // Check for direct flat response
      if (!videoUrl && !imageUrl && data.url) {
          if (data.type === 'video') videoUrl = data.url;
          else imageUrl = data.url;
      }

      if (videoUrl) {
          type = 'video';
      } else if (imageUrl) {
          type = 'image';
      } else {
          throw new Error("Unable to extract media from this link.");
      }

      const finalUrl = videoUrl || imageUrl;
      const thumbnail = imageUrl || videoUrl; // Fallback thumbnail
      
      // Extract Username
      const username = root.owner?.username || root.author || root.items?.[0]?.user?.username || 'instagram_user';

      setResult({
        id: root.id || Math.random().toString(36).substring(7),
        type: type,
        url: finalUrl,
        thumbnail: thumbnail,
        username: username,
        timestamp: new Date().toLocaleDateString()
      });

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

    } catch (err: any) {
      console.error("Download Error:", err);
      setError(err.message || 'Failed to fetch media. Please check the link and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const forceDownload = async (fileUrl: string, fileName: string) => {
    try {
      setIsDownloading(true);
      
      // Method 1: Fetch Blob
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (err) {
      console.error('Blob download failed, trying fallback:', err);
      // Method 2: Direct Window Open (Fallback)
      const newWindow = window.open(fileUrl, '_blank');
      if (!newWindow) {
        alert('Pop-up blocked. Please allow pop-ups to download.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Instagram <span className="text-brand-600">Reels</span> Downloader
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Download high-quality Instagram Reels, Videos, Photos, and IGTV directly to your gallery. Fast, free, and secure.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8 border border-slate-100 max-w-3xl mx-auto">
        <form onSubmit={handleDownload} className="relative flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LinkIcon className="h-6 w-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <input
              ref={inputRef}
              type="text"
              className="block w-full pl-12 pr-24 py-5 text-lg bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-brand-500 transition-all outline-none placeholder:text-slate-400"
              placeholder="Paste Instagram link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute inset-y-0 right-4 flex items-center text-sm font-bold text-slate-400 hover:text-brand-600 uppercase tracking-wide"
            >
              Paste
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="md:w-48 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold py-5 px-8 rounded-2xl transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center disabled:opacity-80 disabled:cursor-wait"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              <>
                <Download className="h-6 w-6 mr-2" />
                Download
              </>
            )}
          </button>
        </form>

        {isLoading && (
          <div className="mt-8 text-center animate-pulse">
             <div className="inline-flex items-center justify-center px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {loadingStep}
             </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Result Section */}
      {result && (
        <div ref={resultRef} className="mt-12 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 max-w-3xl mx-auto">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Media Found</h3>
                <p className="text-slate-500 text-sm">@{result.username} • Ready for download</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Media Preview */}
              <div className="w-full md:w-5/12">
                <div className="relative rounded-xl overflow-hidden bg-black shadow-lg aspect-[9/16] md:aspect-auto md:h-[350px]">
                  {result.type === 'video' ? (
                     <video 
                       src={result.url} 
                       poster={result.thumbnail}
                       controls 
                       className="w-full h-full object-contain"
                     />
                  ) : (
                    <img src={result.url} alt="Result" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
              
              {/* Download Actions */}
              <div className="flex-grow flex flex-col justify-center space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
                   <p className="text-sm text-slate-600 mb-1 font-medium">Download Option 1 (Recommended)</p>
                   <button 
                      onClick={() => forceDownload(result.url, `zalastra_${result.id}.${result.type === 'video' ? 'mp4' : 'jpg'}`)}
                      disabled={isDownloading}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center disabled:opacity-70 active:scale-95"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <FileDown className="w-5 h-5 mr-2" />
                      )}
                      {isDownloading ? 'Saving...' : `Download ${result.type === 'video' ? 'Video' : 'Photo'}`}
                    </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <p className="text-sm text-slate-600 mb-1 font-medium">Download Option 2 (Direct Link)</p>
                   <div className="flex gap-3">
                     <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-grow bg-white border-2 border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center"
                      >
                        <LinkIcon className="w-5 h-5 mr-2" />
                        Open Link
                      </a>
                      <button 
                        onClick={() => handleCopyLink(result.url)}
                        className="bg-white border-2 border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-700 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center min-w-[60px]"
                        title="Copy Link"
                      >
                         {isCopied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                      </button>
                   </div>
                   <p className="text-xs text-slate-400 mt-2 text-center">
                     Tip: If the video plays in a new tab, click the three dots (⋮) on the video player and select "Download".
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO / Features Grid */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
            <Video className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-900">Reels Downloader</h3>
          <p className="text-slate-600 leading-relaxed">The best tool to download Instagram Reels videos. Save standard and high-quality MP4 videos directly to your gallery.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 text-pink-600">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-900">Photo & Carousel</h3>
          <p className="text-slate-600 leading-relaxed">Save multiple photos from a single post. Our downloader automatically detects carousels and extracts all images.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-900">Safe & Secure</h3>
          <p className="text-slate-600 leading-relaxed">No login required. We do not store your downloads or track your history. Completely anonymous downloading.</p>
        </div>
      </div>
    </div>
  );
};

export default Downloader;
