// src/components/portfolio/ContactSection.tsx
'use client';

import { ContactChannel } from '@/lib/portfolio-types';
import { FaGithub, FaLinkedin, FaEnvelope, FaYoutube, FaFileAlt } from 'react-icons/fa';

export function ContactSection({ contacts }: { contacts: ContactChannel[] }) {
  const getIcon = (platform: string) => {
    switch (platform) {
      case 'Email': return <FaEnvelope />;
      case 'LinkedIn': return <FaLinkedin />;
      case 'GitHub': return <FaGithub />;
      case 'YouTube': return <FaYoutube />;
      case 'Resume': return <FaFileAlt />;
      default: return null;
    }
  };

  const getHoverStyles = (platform: string) => {
    switch (platform) {
      case 'Email': return 'hover:text-slate-800 hover:border-slate-800 hover:bg-slate-100';
      case 'LinkedIn': return 'hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50';
      case 'GitHub': return 'hover:text-slate-900 hover:border-slate-900 hover:bg-slate-100';
      case 'YouTube': return 'hover:text-rose-600 hover:border-rose-400 hover:bg-rose-50/50';
      case 'Resume': return 'hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50';
      default: return 'hover:text-indigo-600 hover:border-indigo-500 hover:bg-indigo-500/10';
    }
  };

  return (
    <div className="card-blueprint p-8 bg-white/80 backdrop-blur-md relative overflow-hidden">
      <div className="relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono mb-4">
            Sector_06: Secure_Contact
          </h3>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter font-mono">
            Direct Connection Channels
          </h3>
          <p className="text-slate-400 text-[10px] font-mono uppercase tracking-[0.2em]">
            Available for technical inquiries and collaborations
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {contacts.map((contact, idx) => (
            <a
              key={idx}
              href={contact.platform === 'Email' ? `mailto:${contact.value}` : contact.value}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-5 py-2.5 rounded-sm border border-slate-200 bg-white text-slate-500 transition-all group ${getHoverStyles(contact.platform)}`}
            >
              <span className="text-lg group-hover:scale-110 transition-transform">
                {getIcon(contact.platform)}
              </span>
              <span className="text-xs font-black font-mono uppercase tracking-widest">
                {contact.platform}
              </span>
            </a>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black font-mono text-slate-300 uppercase tracking-[0.3em]">
              System Core: Operational
            </span>
          </div>
          <p className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-widest">
            © {new Date().getFullYear()} PORTFOLIO_V2 // PARINYA SAWATDEE
          </p>
        </div>
      </div>
    </div>
  );
}
