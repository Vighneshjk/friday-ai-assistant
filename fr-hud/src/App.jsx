import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Activity, Cpu, Terminal, Plus, Image, Camera, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api/chat';
console.log("[FRIDAY] Connecting to uplink:", API_URL);

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Systems online, Boss. Performance metrics are within nominal ranges. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [diagnostics, setDiagnostics] = useState({
    cpu: 12,
    temp: 42,
    shield: 100,
    network: 'Optimized'
  });
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDiagnostics(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 15) + 5,
        temp: 40 + Math.floor(Math.random() * 5)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      
      // Known female voice names across Windows, macOS, and Google Chrome
      const femaleNames = ['zira', 'hazel', 'samantha', 'victoria', 'karen', 'tessa', 'veena', 'moira', 'fiona', 'grace', 'susan', 'catherine'];
      
      // 1. Try to find explicitly female labeled voice
      let preferredVoice = voices.find(v => v.name.toLowerCase().includes('female') && v.lang.includes('en'));
      
      // 2. Try to find known female names
      if (!preferredVoice) {
        preferredVoice = voices.find(v => femaleNames.some(name => v.name.toLowerCase().includes(name)) && v.lang.includes('en'));
      }
      
      // 3. Fallback to any English voice that DOES NOT contain male identifiers
      if (!preferredVoice) {
        const maleNames = ['david', 'mark', 'arthur', 'daniel', 'alex', 'fred', 'male'];
        preferredVoice = voices.find(v => 
          v.lang.includes('en') && 
          !maleNames.some(name => v.name.toLowerCase().includes(name))
        );
      }
      
      // 4. Absolute fallback
      if (!preferredVoice && voices.length > 0) {
        preferredVoice = voices.find(v => v.lang.includes('en')) || voices[0];
      }
      
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.pitch = 1.3;
      utterance.rate = 1.1;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !filePreview) || isProcessing) return;

    const userMessage = { role: 'user', text: input, image: filePreview };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentFile = filePreview;
    
    setInput('');
    clearFile();
    setIsProcessing(true);

    try {
      const response = await axios.post(API_URL, {
        prompt: currentInput,
        image: currentFile,
        history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
      });

      const assistantMessage = { role: 'assistant', text: response.data.response };
      setMessages(prev => [...prev, assistantMessage]);
      speak(assistantMessage.text);
    } catch (error) {
      console.error("Link failure, Boss.", error);
      const errorMsg = "I'm detecting an uplink disruption, Boss. Please check the backend systems.";
      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-screen relative flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#050a0f] selection:bg-[#00f2ff30]">
      <div className="grid-bg"></div>
      
      {/* Left Sidebar - Status (Hidden on Mobile) */}
      <div className="hidden lg:flex w-80 h-full p-6 flex-col gap-6 z-10">
        <div className="glass p-4 border-l-2 border-l-[#00f2ff]">
          <h3 className="text-sm mb-4 flex items-center gap-2 text-[#00f2ff]">
            <Activity size={16} /> SYSTEM DIAGNOSTICS
          </h3>
          <div className="space-y-4">
            <DiagnosticBar label="CORE CPU" value={diagnostics.cpu} unit="%" color="var(--accent-blue)" />
            <DiagnosticBar label="THERMAL" value={diagnostics.temp} unit="°C" color={diagnostics.temp > 44 ? 'var(--accent-gold)' : 'var(--accent-blue)'} />
            <DiagnosticBar label="INTEGRITY" value={diagnostics.shield} unit="%" color="var(--accent-blue)" />
          </div>
        </div>

        <div className="glass p-4 border-l-2 border-l-[#ffcc00] flex-1">
          <h3 className="text-sm mb-4 flex items-center gap-2 text-[#ffcc00]">
            <Terminal size={16} /> ACTIVE PROCESSES
          </h3>
          <div className="space-y-2 text-xs opacity-70 font-mono">
            <p className="animate-pulse">{">"} Network: Encrypted</p>
            <p>{">"} Uplink: Stable</p>
            <p>{">"} Identity: F.R.I.D.A.Y.</p>
            <p>{">"} Auth: Admin (VJ)</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col items-center justify-start lg:justify-center relative p-4 md:p-6 pb-24 lg:pb-6">
        <div className="mt-4 lg:mt-8 lg:absolute lg:top-10 flex flex-col items-center z-10">
            <h1 className="text-2xl md:text-4xl font-bold glow-text tracking-widest text-[#00f2ff]">F.R.I.D.A.Y.</h1>
            <div className="flex items-center gap-2 mt-1 md:mt-2">
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-[#00f2ff]'}`}></div>
              <p className="text-[8px] md:text-xs tracking-[0.3em] opacity-50 uppercase">Uplink: {isProcessing ? 'Processing' : 'Stable'}</p>
            </div>
        </div>

        <div className="scale-50 md:scale-75 lg:scale-100 my-4 lg:my-8">
          <FridayCore isProcessing={isProcessing} />
        </div>

        <div className="w-full max-w-2xl glass flex flex-col h-[50vh] md:h-[400px] z-10 shadow-2xl">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#00f2ff20] border border-[#00f2ff40]' 
                      : 'bg-[#ffffff05] border border-white/10'
                  }`}>
                    {msg.image && (
                      <img src={msg.image} alt="Uploaded" className="max-w-full h-auto rounded mb-2 border border-[#00f2ff30]" />
                    )}
                    <p className="opacity-90 leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-[#ffffff05] border border-white/10 p-3 rounded-lg flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </motion.div>
            )}
          </div>

          {filePreview && (
            <div className="px-4 py-2 border-t border-white/10 flex items-center gap-3 bg-[#00f2ff05] backdrop-blur-md">
              <div className="relative w-14 h-14 rounded border border-[#00f2ff50] overflow-hidden group">
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00f2ff20] to-transparent animate-pulse pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00f2ff] animate-[scan_2s_linear_infinite] opacity-50"></div>
                <button onClick={clearFile} className="absolute top-0 right-0 bg-[#ff3333] text-white p-1 rounded-bl transition-transform hover:scale-110">
                  <X size={14} />
                </button>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#00f2ff] font-bold uppercase tracking-widest glow-text">MEDIA STAGED</span>
                <span className="text-[8px] text-[#00f2ff] opacity-40 uppercase">Ready for analysis...</span>
              </div>
            </div>
          )}

          <div className="p-2 md:p-4 border-t border-white/10 flex items-center gap-2 bg-black/40 backdrop-blur-xl">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
            <input 
              type="file" 
              ref={cameraInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
              capture="environment" 
            />
            
            <div className="flex items-center gap-0.5 md:gap-1">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-[#00f2ff10] text-[#00f2ff] rounded-full transition-all hover:scale-110 active:scale-95"
                title="Upload File"
              >
                <Plus size={20} />
              </button>
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="p-2 hover:bg-[#00f2ff10] text-[#00f2ff] rounded-full transition-all hover:scale-110 active:scale-95 md:hidden"
                title="Camera"
              >
                <Camera size={20} />
              </button>
              <div className="w-[1px] h-6 bg-white/10 mx-1 hidden md:block"></div>
              <button 
                onClick={startListening}
                className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 flex-shrink-0 ${
                  isListening ? 'bg-[#ff3333] text-white shadow-[0_0_15px_#ff3333] animate-pulse' : 'hover:bg-white/5 text-[#00f2ff]'
                }`}
              >
                <Mic size={20} />
              </button>
            </div>

            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening..." : "Awaiting command, Boss..."}
              className="flex-1 bg-transparent border-none outline-none text-base md:text-sm text-white placeholder-white/20 min-w-0 font-mono tracking-wide"
            />
            <button 
              onClick={handleSend}
              disabled={(!input.trim() && !filePreview) || isProcessing}
              className={`p-2 rounded-full transition-all flex-shrink-0 ${
                (!input.trim() && !filePreview) || isProcessing
                ? 'opacity-20 cursor-not-allowed'
                : 'hover:bg-[#00f2ff20] text-[#00f2ff] hover:scale-110 active:scale-95'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}

const DiagnosticBar = ({ label, value, unit, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] opacity-60">
      <span>{label}</span>
      <span>{value}{unit}</span>
    </div>
    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }} 
        className="h-full" 
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

const FridayCore = ({ isProcessing }) => {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute w-full h-full border-2 border-dashed border-[#00f2ff30] rounded-full"
      />
      <motion.div 
        animate={{ 
          scale: isProcessing ? [1, 1.1, 1] : [1, 1.05, 1],
          opacity: isProcessing ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2]
        }}
        transition={{ duration: isProcessing ? 1 : 3, repeat: Infinity }}
        className="absolute w-4/5 h-4/5 border border-[#00f2ff50] rounded-full bg-[#00f2ff05]"
      />
      <motion.div 
        animate={{ 
          scale: isProcessing ? [1.1, 1.3, 1.1] : [1, 1.1, 1],
          boxShadow: isProcessing 
            ? ["0 0 20px #00f2ff", "0 0 40px #00f2ff", "0 0 20px #00f2ff"]
            : ["0 0 10px #00f2ff", "0 0 20px #00f2ff", "0 0 10px #00f2ff"]
        }}
        transition={{ duration: isProcessing ? 0.5 : 2, repeat: Infinity }}
        className="w-16 h-16 bg-[#00f2ff] rounded-full shadow-[0_0_20px_#00f2ff] flex items-center justify-center"
      >
        <Cpu size={32} className="text-[#050a0f]" />
      </motion.div>
      
      {[0, 120, 240].map((deg, i) => (
        <motion.div
           key={i}
           animate={{ rotate: 360 }}
           transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }}
           className="absolute w-full h-full"
           style={{ transform: `rotate(${deg}deg)` }}
        >
          <div className="w-3 h-3 bg-[#00f2ff] rounded-full blur-[1px] absolute -top-1.5 left-1/2 -ml-1.5 shadow-[0_0_10px_#00f2ff]" />
        </motion.div>
      ))}
    </div>
  );
};

export default App;
