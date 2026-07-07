/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, HelpCircle, Volume2 } from 'lucide-react';
import Card from './Card';
import { Language } from '../../types';

interface VoiceHandlerProps {
  currentLang: Language;
  onVoiceCommand: (command: { field: string; value: string | number }) => void;
}

const HINTS = {
  en: [
    'Say "Set Paracetamol stock to 500"',
    'Say "Beds occupied 12"',
    'Say "Doctors present 4"'
  ],
  hi: [
    'बोलें "पैरासिटामोल स्टॉक पांच सौ करो"',
    'बोलें "बेड ऑक्यूपेंसी बारह करो"',
    'बोलें "डॉक्टर उपस्थित चार"'
  ],
  ta: [
    'சொல்லுங்கள் "பாராசிட்டமால் 500 ஆக மாற்று"',
    'சொல்லுங்கள் "படுக்கை எண்ணிக்கை 12"',
    'சொல்லுங்கள் "மருத்துவர் எண்ணிக்கை 4"'
  ]
};

export default function VoiceHandler({ currentLang, onVoiceCommand }: VoiceHandlerProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [matchedCommand, setMatchedCommand] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameId = useRef<number | null>(null);

  // Parse voice text for fields
  const parseCommandText = (text: string) => {
    const cleanText = text.toLowerCase().trim();
    
    // English parsers
    if (currentLang === 'en') {
      if (cleanText.includes('paracetamol')) {
        const match = cleanText.match(/\d+/);
        if (match) {
          onVoiceCommand({ field: 'paracetamol', value: parseInt(match[0], 10) });
          setMatchedCommand(`Set Paracetamol stock to ${match[0]}`);
          return;
        }
      }
      if (cleanText.includes('amoxicillin')) {
        const match = cleanText.match(/\d+/);
        if (match) {
          onVoiceCommand({ field: 'amoxicillin', value: parseInt(match[0], 10) });
          setMatchedCommand(`Set Amoxicillin stock to ${match[0]}`);
          return;
        }
      }
      if (cleanText.includes('bed') || cleanText.includes('beds')) {
        const match = cleanText.match(/\d+/);
        if (match) {
          onVoiceCommand({ field: 'bedsOccupied', value: parseInt(match[0], 10) });
          setMatchedCommand(`Set Beds Occupied to ${match[0]}`);
          return;
        }
      }
      if (cleanText.includes('doctor') || cleanText.includes('doctors')) {
        const match = cleanText.match(/\d+/);
        if (match) {
          onVoiceCommand({ field: 'doctorAttendance', value: parseInt(match[0], 10) });
          setMatchedCommand(`Set Doctor Attendance to ${match[0]}`);
          return;
        }
      }
    }

    // Hindi parsers
    if (currentLang === 'hi') {
      if (cleanText.includes('पैरासिटामोल') || cleanText.includes('paracetamol')) {
        const match = cleanText.match(/\d+/) || cleanText.match(/पांच सौ|सौ|दस|पचास/);
        let val: number = 500;
        if (match) {
          if (match[0] === 'पांच सौ') val = 500;
          else if (match[0] === 'सौ') val = 100;
          else val = parseInt(match[0], 10) || 500;
          onVoiceCommand({ field: 'paracetamol', value: val });
          setMatchedCommand(`पैरासिटामोल स्टॉक ${val} किया गया`);
          return;
        }
      }
      if (cleanText.includes('बेड') || cleanText.includes('bed')) {
        const match = cleanText.match(/\d+/) || cleanText.match(/बारह|दस/);
        let val = 12;
        if (match) {
          if (match[0] === 'बारह') val = 12;
          else if (match[0] === 'दस') val = 10;
          else val = parseInt(match[0], 10) || 12;
          onVoiceCommand({ field: 'bedsOccupied', value: val });
          setMatchedCommand(`भरे हुए बेड ${val} सेट किया`);
          return;
        }
      }
      if (cleanText.includes('डॉक्टर') || cleanText.includes('doctor')) {
        const match = cleanText.match(/\d+/);
        if (match) {
          onVoiceCommand({ field: 'doctorAttendance', value: parseInt(match[0], 10) });
          setMatchedCommand(`डॉक्टर उपस्थिति ${match[0]} सेट किया`);
          return;
        }
      }
    }

    // Tamil parsers
    if (currentLang === 'ta') {
      if (cleanText.includes('பாராசிட்டமால்') || cleanText.includes('paracetamol')) {
        const match = cleanText.match(/\d+/);
        if (match) {
          onVoiceCommand({ field: 'paracetamol', value: parseInt(match[0], 10) });
          setMatchedCommand(`பாராசிட்டமால் இருப்பு ${match[0]} ஆக மாற்றப்பட்டது`);
          return;
        }
      }
      if (cleanText.includes('படுக்கை') || cleanText.includes('beds') || cleanText.includes('bed')) {
        const match = cleanText.match(/\d+/);
        if (match) {
          onVoiceCommand({ field: 'bedsOccupied', value: parseInt(match[0], 10) });
          setMatchedCommand(`படுக்கை எண்ணிக்கை ${match[0]} ஆக மாற்றப்பட்டது`);
          return;
        }
      }
      if (cleanText.includes('மருத்துவர்') || cleanText.includes('doctor')) {
        const match = cleanText.match(/\d+/);
        if (match) {
          onVoiceCommand({ field: 'doctorAttendance', value: parseInt(match[0], 10) });
          setMatchedCommand(`மருத்துவர் எண்ணிக்கை ${match[0]} ஆக மாற்றப்பட்டது`);
          return;
        }
      }
    }

    setMatchedCommand(null);
  };

  // Canvas visualizer logic for premium feel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;
    let step = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = isListening ? 'rgb(16, 185, 129)' : 'rgb(100, 116, 139)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const waveCount = 3;
      for (let i = 0; i < waveCount; i++) {
        const offset = (i * Math.PI) / 2;
        ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x++) {
          const amplitude = isListening ? (20 / (i + 1)) * Math.sin(step * 0.15) : 2 * Math.sin(step * 0.05);
          const y = height / 2 + Math.sin(x * 0.05 + step * 0.1 + offset) * amplitude;
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      step += isListening ? 1.5 : 0.3;
      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isListening]);

  // Web Speech API lifecycle
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      if (currentLang === 'en') rec.lang = 'en-IN';
      else if (currentLang === 'hi') rec.lang = 'hi-IN';
      else if (currentLang === 'ta') rec.lang = 'ta-IN';

      rec.onstart = () => {
        setIsListening(true);
        setMatchedCommand(null);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        parseCommandText(text);
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currentLang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  const simulateSpeech = (simulatedText: string) => {
    setTranscript(simulatedText);
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      parseCommandText(simulatedText);
    }, 1200);
  };

  return (
    <Card className="border border-slate-800/70 shadow-lg relative overflow-hidden bg-slate-950/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4.5 w-4.5 text-emerald-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-100 font-sans">
            {currentLang === 'en' ? 'AI Voice Assistant' : currentLang === 'hi' ? 'एआई वॉयस असिस्टेंट' : 'AI குரல் உதவி'}
          </h3>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-full">
          Speech API
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Wave Animation Area & Mic Trigger */}
        <div className="relative flex items-center justify-center h-20 w-full md:w-48 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden px-4">
          <canvas ref={canvasRef} width="160" height="70" className="absolute inset-0 w-full h-full pointer-events-none" />
          
          <button
            onClick={toggleListening}
            className={`z-10 flex h-11 w-11 items-center justify-center rounded-full border shadow-md transition-all duration-300 ${
              isListening
                ? 'bg-red-500 border-red-400 text-white hover:bg-red-600 scale-105'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {isListening ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
          </button>
        </div>

        {/* Action Panel & Simulated Prompts */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-mono mb-2">
            {currentLang === 'en' ? 'Quick simulated mic tests:' : currentLang === 'hi' ? 'त्वरित सिम्युलेटेड माइक परीक्षण:' : 'விரைவு உருவகப்படுத்தப்பட்ட மைக் சோதனைகள்:'}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {HINTS[currentLang].map((hint, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const queryText = hint.replace('Say "', '').replace('बोलें "', '').replace('சொல்லுங்கள் "', '').replace('"', '');
                  simulateSpeech(queryText);
                }}
                className="flex items-center space-x-1 rounded bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-[10px] text-slate-300 px-2 py-1 transition text-left"
              >
                <Play className="h-2 w-2 text-emerald-400 shrink-0" />
                <span className="truncate">{hint}</span>
              </button>
            ))}
          </div>

          <div className="rounded bg-slate-900/70 border border-slate-800 p-2.5 min-h-[50px] flex flex-col justify-center">
            {transcript ? (
              <div>
                <p className="text-[10px] text-slate-500 font-mono">Captured Voice:</p>
                <p className="text-xs text-slate-100 font-medium italic">"{transcript}"</p>
                {matchedCommand && (
                  <div className="mt-1 flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <p className="text-[10px] text-emerald-400 font-mono font-medium">Applied: {matchedCommand}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-sans italic">
                {currentLang === 'en' ? 'Click Mic or trigger quick simulated tests above.' : currentLang === 'hi' ? 'माइक पर क्लिक करें या ऊपर त्वरित सिम्युलेटेड परीक्षण चलाएं।' : 'மைக் கிளிக் செய்யவும் அல்லது விரைவு உருவகப்படுத்தப்பட்ட சோதனைகளை இயக்கவும்.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
