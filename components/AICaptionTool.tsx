import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Copy, RefreshCw, X, Hash, MessageSquare } from 'lucide-react';
import { generateImageCaptions } from '../services/gemini';
import { CaptionResult } from '../types';

const AICaptionTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Basic validation
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size too large. Please upload an image under 5MB.");
        return;
      }
      if (!selectedFile.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }

      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await generateImageCaptions(file);
      setResult(data);
    } catch (err: any) {
      setError("Failed to generate captions. Please try again later or verify your API key.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-4">
          Powered by Gemini AI
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
          AI Magic <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Captions</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Upload your photo and let our AI create viral captions and hashtags tailored to your content.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload */}
        <div className="space-y-6">
          <div 
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
              ${preview ? 'border-brand-500 bg-brand-50/10' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'}
              ${isLoading ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            {!preview ? (
              <div 
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Upload your photo</h3>
                <p className="text-slate-500 text-sm mb-6">Drag & drop or click to browse</p>
                <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                  Select File
                </button>
              </div>
            ) : (
              <div className="relative group">
                 <img src={preview} alt="Preview" className="w-full rounded-lg shadow-md max-h-[400px] object-contain mx-auto" />
                 <button 
                   onClick={handleClear}
                   className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                 >
                   <X className="w-4 h-4" />
                 </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/webp" 
              onChange={handleFileChange} 
            />
          </div>

          {preview && !result && (
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Magic Captions
                </>
              )}
            </button>
          )}

           {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {!result && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[300px] border border-slate-100 rounded-2xl bg-white p-8 text-center">
              <Sparkles className="w-12 h-12 mb-4 text-slate-200" />
              <p>Upload an image to see the magic happen</p>
            </div>
          )}

          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center min-h-[300px] space-y-4">
               <div className="flex space-x-2">
                 <div className="w-3 h-3 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                 <div className="w-3 h-3 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-3 h-3 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               </div>
               <p className="text-slate-500 font-medium">Gemini is thinking...</p>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
               <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 border-b border-indigo-100">
                  <h3 className="font-bold text-indigo-900 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-indigo-600" /> 
                    AI Strategy
                  </h3>
                  <p className="text-indigo-700 text-sm mt-1">
                    {result.strategy}
                  </p>
               </div>
               
               <div className="p-6 space-y-6">
                 <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" /> Viral Captions
                    </h4>
                    <div className="space-y-3">
                      {result.captions.map((caption, idx) => (
                        <div key={idx} className="group relative bg-slate-50 hover:bg-slate-100 p-4 rounded-lg transition-colors border border-slate-200">
                          <p className="text-slate-700 text-sm pr-8">{caption}</p>
                          <button 
                            onClick={() => copyToClipboard(caption)}
                            className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                      <Hash className="w-4 h-4 mr-1" /> Hashtags
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {result.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}
                        </p>
                        <button 
                            onClick={() => copyToClipboard(result.hashtags.join(' '))}
                            className="absolute top-2 right-2 p-1.5 bg-white shadow-sm border border-slate-200 rounded-md text-slate-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                    </div>
                 </div>
                 
                 <button 
                   onClick={handleClear}
                   className="w-full py-3 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors border-t border-slate-100 mt-2"
                 >
                   Start Over
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICaptionTool;
