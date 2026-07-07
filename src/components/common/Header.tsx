/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, User, Globe, Activity, RefreshCw } from 'lucide-react';
import { UserRole, Language } from '../../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
}

const TRANSLATIONS = {
  en: {
    title: 'AYUSHMAN-AI',
    tagline: 'District Health Command Center',
    adminRole: 'District Administrator',
    workerRole: 'Frontline Health Worker',
    roleLabel: 'Test Role Switcher',
    sync: 'Sync Complete'
  },
  hi: {
    title: 'आयुष्मान-AI',
    tagline: 'जिला स्वास्थ्य कमांड केंद्र',
    adminRole: 'जिला प्रशासक',
    workerRole: 'अग्रिम पंक्ति स्वास्थ्य कार्यकर्ता',
    roleLabel: 'रोल स्विच करें',
    sync: 'सिंक पूर्ण'
  },
  ta: {
    title: 'ஆயுஷ்மான்-AI',
    tagline: 'மாவட்ட சுகாதார கட்டுப்பாட்டு மையம்',
    adminRole: 'மாவட்ட நிர்வாகி',
    workerRole: 'முன்னணி சுகாதார பணியாளர்',
    roleLabel: 'பங்கு மாற்றி',
    sync: 'ஒத்திசைவு முடிந்தது'
  }
};

export default function Header({
  currentRole,
  onRoleChange,
  currentLang,
  onLangChange,
  isSyncing,
  onTriggerSync
}: HeaderProps) {
  const t = TRANSLATIONS[currentLang];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left Side: Brand & Live Heartbeat */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-wider text-slate-50 font-sans">
                {t.title}
              </h1>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Side: Language, Role Switcher, Sync Indicator */}
        <div className="flex items-center space-x-4">
          {/* Synchronizer */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="group flex items-center space-x-1.5 rounded-full bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:border-slate-700 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span className="font-mono text-[11px]">{isSyncing ? 'Syncing...' : t.sync}</span>
          </button>

          {/* Language Picker */}
          <div className="flex items-center space-x-1 rounded-full bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => onLangChange('en')}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                currentLang === 'en' ? 'bg-slate-800 text-slate-50 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLangChange('hi')}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                currentLang === 'hi' ? 'bg-slate-800 text-slate-50 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => onLangChange('ta')}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                currentLang === 'ta' ? 'bg-slate-800 text-slate-50 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Role Switcher Selector */}
          <div className="flex items-center space-x-1 rounded-full bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => onRoleChange('ADMIN')}
              className={`flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                currentRole === 'ADMIN'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>{t.adminRole}</span>
            </button>
            <button
              onClick={() => onRoleChange('WORKER')}
              className={`flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                currentRole === 'WORKER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>{t.workerRole}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
