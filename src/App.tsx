import React, { useState, useRef } from 'react';
import {
  MessageSquare, Eye, Zap, MousePointer2, Cpu,
  Network, Ghost, BoxSelect, Send, Image as ImageIcon,
  Loader2, Play, CheckCircle2, AlertCircle, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MODELS, type ModelType } from './types';
import * as gemini from './services/gemini';
import * as hf from './services/huggingface';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getErrorMessage(e: unknown): string {
  const message = (e as Error).message;
  if (message.includes('429') || message.toLowerCase().includes('quota exceeded')) {
    return 'Quota Exceeded: The model has reached its daily limit. Please try again later or switch models.';
  }
  return 'Error: ' + message;
}

export default function App() {
  const [activeModel, setActiveModel] = useState<ModelType>('LLM');
  const [provider, setProvider] = useState<'gemini' | 'hf'>('gemini');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Helper to get active service
  const ai = provider === 'gemini' ? gemini : hf;

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden relative">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 flex flex-col bg-[#0F0F0F] transition-transform duration-300 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI Explorer</h1>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Switcher */}
        <div className="p-4 px-6 border-b border-white/10">
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">AI Engine</p>
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
            <button
              onClick={() => setProvider('gemini')}
              className={cn(
                "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                provider === 'gemini' ? "bg-emerald-500 text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              Gemini
            </button>
            <button
              onClick={() => setProvider('hf')}
              className={cn(
                "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                provider === 'hf' ? "bg-emerald-500 text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              Open Source
            </button>
          </div>
        </div>

        <div className="p-4 px-6">
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Model Architectures</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setActiveModel(model.id);
                closeSidebar();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeModel === model.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                activeModel === model.id ? "bg-white/10" : "bg-transparent group-hover:bg-white/5"
              )}>
                {getIcon(model.id, "w-5 h-5")}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">{model.name}</div>
                <div className="text-[10px] opacity-50 truncate w-32">{model.fullName}</div>
              </div>
              {activeModel === model.id && (
                <motion.div
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                />
              )}
            </button>
          ))}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />

        <header className="h-20 border-b border-white/10 flex items-center justify-between px-4 lg:px-8 bg-[#0A0A0A]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 bg-white/5 rounded-lg border border-white/10"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm lg:text-lg font-semibold truncate max-w-[150px] lg:max-w-none">
                {MODELS.find(m => m.id === activeModel)?.fullName}
              </h2>
              <p className="text-[10px] lg:text-xs text-white/40 hidden sm:block">
                {MODELS.find(m => m.id === activeModel)?.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2 lg:px-3 py-1 lg:py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] lg:text-[10px] font-bold text-emerald-500 uppercase tracking-wider">System Online</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto h-full"
            >
              {renderModelSection(activeModel, ai)}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function getIcon(id: ModelType, className: string) {
  switch (id) {
    case 'LLM': return <MessageSquare className={className} />;
    case 'VLM': return <Eye className={className} />;
    case 'LCM': return <Zap className={className} />;
    case 'LAM': return <MousePointer2 className={className} />;
    case 'SLM': return <Cpu className={className} />;
    case 'MoE': return <Network className={className} />;
    case 'MLM': return <Ghost className={className} />;
    case 'SAM': return <BoxSelect className={className} />;
  }
}

function renderModelSection(id: ModelType, ai: any) {
  switch (id) {
    case 'LLM': return <LLMSection ai={ai} />;
    case 'VLM': return <VLMSection ai={ai} />;
    case 'LCM': return <LCMSection ai={ai} />;
    case 'LAM': return <LAMSection ai={ai} />;
    case 'SLM': return <SLMSection ai={ai} />;
    case 'MoE': return <MoESection />;
    case 'MLM': return <MLMSection ai={ai} />;
    case 'SAM': return <SAMSection ai={ai} />;
  }
}

// --- Section Components ---

function LLMSection({ ai }: { ai: any }) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await ai.chat(input);
      setResponse(res || 'No response');
    } catch (e) {
      setResponse(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex-1 space-y-4">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl min-h-[200px] relative">
          {loading ? (
            <div className="flex items-center gap-2 text-white/40 italic">
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          ) : response ? (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-white/20 text-center mt-12">
              Ask the Large Language Model anything. It excels at reasoning, coding, and creative writing.
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a prompt for the LLM..."
          className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 pr-14 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none h-32"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="absolute bottom-4 right-4 p-2 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function VLMSection({ ai }: { ai: any }) {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Describe this image in detail.');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const res = await ai.analyzeImage(base64, prompt);
      setResponse(res || 'No analysis');
    } catch (e) {
      setResponse(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      <div className="space-y-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/30 transition-colors overflow-hidden relative group"
        >
          {image ? (
            <img src={image} alt="Upload" className="w-full h-full object-cover" />
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-sm text-white/40">Click to upload image</p>
            </>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-xs font-bold uppercase tracking-widest">Change Image</p>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
          placeholder="What should the VLM look for?"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !image}
          className="w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Analyze with VLM
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 overflow-y-auto max-h-[600px]">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Analysis Output</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-white/40 italic">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing visual tokens...
          </div>
        ) : response ? (
          <div className="prose prose-invert prose-sm">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-white/20 text-sm italic">Upload an image and click analyze to see the VLM in action.</p>
        )}
      </div>
    </div>
  );
}

function LCMSection({ ai }: { ai: any }) {
  const [prompt, setPrompt] = useState('A futuristic laboratory with holographic displays, cinematic lighting, 8k');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await ai.generateImage(prompt);
      setImage(res);
    } catch (e) {
      alert(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/50"
          placeholder="Describe the image you want to generate..."
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-8 py-4 sm:py-0 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
          Generate
        </button>
      </div>

      <div className="aspect-square w-full max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-[32px] lg:rounded-[40px] overflow-hidden relative group shadow-2xl">
        {image ? (
          <img src={image} alt="Generated" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p className="text-sm font-medium animate-pulse">Synthesizing Latent Space...</p>
              </div>
            ) : (
              <>
                <Zap className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-sm">Enter a prompt to generate an image</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
        <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <AlertCircle className="w-3 h-3" />
          Technical Note
        </h4>
        <p className="text-xs text-white/60 leading-relaxed">
          Latent Consistency Models (LCM) allow for high-quality image generation in just 1-4 steps, significantly faster than traditional diffusion models. This demo uses Gemini's native image generation capabilities to simulate the LCM experience.
        </p>
      </div>
    </div>
  );
}

function LAMSection({ ai }: { ai: any }) {
  const [task, setTask] = useState('Turn on the living room lights and set the temperature to 72 degrees.');
  const [steps, setSteps] = useState<{ action: string; params: string; status: 'pending' | 'done' }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    setSteps([]);
    try {
      const calls = await ai.simulateAction(task);
      if (calls) {
        const newSteps = calls.map(c => ({
          action: c.args.action as string,
          params: c.args.params as string,
          status: 'pending' as const
        }));
        setSteps(newSteps);

        // Simulate execution
        for (let i = 0; i < newSteps.length; i++) {
          await new Promise(r => setTimeout(r, 1000));
          setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-4 lg:p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Natural Language Command</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={handleExecute}
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              Execute
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Action Sequence</label>
          <div className="space-y-2">
            {steps.length > 0 ? (
              steps.map((step, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    step.status === 'done' ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10 text-white/30"
                  )}>
                    {step.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-tight">{step.action.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-white/40">{step.params}</div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center text-white/20 border border-dashed border-white/10 rounded-2xl">
                {loading ? "Planning actions..." : "Enter a command to see the Large Action Model plan and execute steps."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SLMSection({ ai }: { ai: any }) {
  const [input, setInput] = useState('Write a haiku about efficiency.');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  const handleRun = async () => {
    const start = Date.now();
    setLoading(true);
    try {
      const res = await ai.chat(input, ai.models.slm);
      setResponse(res || '');
      setLatency(Date.now() - start);
    } catch (e) {
      setResponse(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 lg:p-6 bg-white/5 border border-white/10 rounded-2xl">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Model Name</div>
          <div className="text-sm lg:text-lg font-bold text-emerald-500">{ai.models.slm}</div>
        </div>
        <div className="p-4 lg:p-6 bg-white/5 border border-white/10 rounded-2xl">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Optimization</div>
          <div className="text-sm lg:text-lg font-bold">Low Latency</div>
        </div>
        <div className="p-4 lg:p-6 bg-white/5 border border-white/10 rounded-2xl">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Response Time</div>
          <div className="text-sm lg:text-lg font-bold">{latency ? `${latency}ms` : '--'}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            Run SLM
          </button>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl min-h-[200px]">
          {loading ? (
            <div className="flex items-center gap-2 text-white/40 italic">
              <Loader2 className="w-4 h-4 animate-spin" />
              Executing on edge...
            </div>
          ) : response ? (
            <div className="prose prose-invert">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-white/20 italic">Small Language Models (SLM) are designed for speed and efficiency, often running directly on mobile devices or browsers.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MoESection() {
  const experts = [
    { name: 'Linguistics', active: true },
    { name: 'Mathematics', active: false },
    { name: 'Code Synthesis', active: true },
    { name: 'Creative Arts', active: false },
    { name: 'Logical Reasoning', active: true },
    { name: 'Data Analysis', active: false },
    { name: 'Scientific Knowledge', active: false },
    { name: 'Translation', active: true },
  ];

  return (
    <div className="space-y-12 py-4 lg:py-8">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">Mixture of Experts (MoE)</h3>
        <p className="text-xs lg:text-sm text-white/50 leading-relaxed">
          Instead of activating the entire model for every request, MoE architectures route inputs to specialized "expert" sub-networks. This allows for massive parameter counts with efficient inference.
        </p>
      </div>

      <div className="relative h-[300px] lg:h-[400px] flex items-center justify-center scale-75 sm:scale-100">
        {/* Central Router */}
        <div className="relative z-10 w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
          <Network className="w-10 h-10 text-black" />
          <div className="absolute -top-8 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Router</div>
        </div>

        {/* Experts */}
        <div className="absolute inset-0">
          {experts.map((expert, i) => {
            const angle = (i / experts.length) * Math.PI * 2;
            const x = Math.cos(angle) * 160;
            const y = Math.sin(angle) * 160;

            return (
              <motion.div
                key={expert.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div className={cn(
                  "px-4 py-2 rounded-xl border transition-all duration-500",
                  expert.active
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-white/5 border-white/10 text-white/20"
                )}>
                  <div className="text-[10px] font-bold uppercase tracking-tight">{expert.name}</div>
                </div>
                {expert.active && (
                  <motion.div
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    className="absolute top-1/2 left-1/2 -z-10"
                  >
                    <svg className="absolute top-0 left-0 w-[200px] h-[200px] -translate-x-1/2 -translate-y-1/2 overflow-visible pointer-events-none">
                      <line
                        x1="100" y1="100"
                        x2={100 - x} y2={100 - y}
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        className="text-emerald-500/30"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h4 className="font-bold mb-2">Efficiency</h4>
          <p className="text-sm text-white/40">Only 10-20% of parameters are active per token, reducing compute costs.</p>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h4 className="font-bold mb-2">Specialization</h4>
          <p className="text-sm text-white/40">Experts develop deep knowledge in specific domains like coding or math.</p>
        </div>
      </div>
    </div>
  );
}

function MLMSection({ ai }: { ai: any }) {
  const [text, setText] = useState('The quick brown [MASK] jumps over the lazy [MASK].');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const prompt = `You are a Masked Language Model. Fill in the [MASK] tokens in this sentence: "${text}". Provide the full sentence with the most likely tokens.`;
      const res = await ai.chat(prompt);
      setResult(res || '');
    } catch (e) {
      setResult(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-4 lg:p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Input with [MASK] tokens</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 h-24 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ghost className="w-5 h-5" />}
          Predict Masked Tokens
        </button>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">MLM Prediction</label>
          <div className="p-4 lg:p-6 bg-white/5 border border-white/10 rounded-xl min-h-[100px] flex items-center justify-center text-center">
            {loading ? (
              <div className="text-white/40 italic text-xs">Calculating bidirectional probabilities...</div>
            ) : result ? (
              <div className="text-sm lg:text-lg font-medium">{result}</div>
            ) : (
              <div className="text-white/20 italic text-xs">Masked Language Models (like BERT) look at context from both directions to predict missing information.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SAMSection({ ai }: { ai: any }) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setDetections([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSegment = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const res = await ai.segmentImage(base64);
      const parsed = JSON.parse(res || '[]');
      setDetections(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error(e);
      alert("Failed to parse detections. Try another image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg lg:text-xl font-bold">Segment Anything Model (SAM)</h3>
          <p className="text-xs lg:text-sm text-white/40">Zero-shot object segmentation and spatial localization.</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold transition-colors"
        >
          Upload Image
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 aspect-video bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative">
          {image ? (
            <>
              <img src={image} alt="Source" className="w-full h-full object-cover" />
              {detections.map((det, i) => {
                const [ymin, xmin, ymax, xmax] = det.box_2d || det.bbox || [0, 0, 0, 0];
                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={i}
                    style={{
                      top: `${ymin / 10}%`,
                      left: `${xmin / 10}%`,
                      width: `${(xmax - xmin) / 10}%`,
                      height: `${(ymax - ymin) / 10}%`,
                    }}
                    className="absolute border-2 border-emerald-500 bg-emerald-500/20 group cursor-help"
                  >
                    <div className="absolute -top-6 left-0 bg-emerald-500 text-black text-[8px] font-bold px-1 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {det.label || det.object || 'Object'}
                    </div>
                  </motion.div>
                );
              })}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
              <BoxSelect className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-xs">Upload an image to begin segmentation</p>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Running Spatial Inference...</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSegment}
            disabled={loading || !image}
            className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BoxSelect className="w-5 h-5" />}
            Run SAM Simulation
          </button>

          <div className="p-4 lg:p-6 bg-white/5 border border-white/10 rounded-2xl h-[200px] lg:h-[300px] overflow-y-auto">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Detected Entities</h4>
            <div className="space-y-2">
              {detections.length > 0 ? (
                detections.map((det, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[10px] font-medium">{det.label || det.object || 'Object'}</span>
                    <span className="text-[8px] text-white/30 font-mono">ID: {i}</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-white/20 italic">No objects detected yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
