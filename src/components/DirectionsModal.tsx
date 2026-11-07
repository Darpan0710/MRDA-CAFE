import React, { useState } from 'react';
import { X, MapPin, Clock, Phone, Mail, Copy, Check, ExternalLink } from 'lucide-react';
import { CAFE_DETAILS } from '../data/cafeData';
import { useCafeSettings } from '../services/cafeSettings';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
}) => {
  const [copied, setCopied] = useState(false);
  const settings = useCafeSettings();
  const address = settings.address || CAFE_DETAILS.address;
  const hours = settings.hours || CAFE_DETAILS.hours;
  const phone = settings.phone || CAFE_DETAILS.phone;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#F1E9DC] rounded-xs shadow-2xl border border-[#DCCBB4] overflow-hidden flex flex-col animate-modal-enter">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DCCBB4] flex items-center justify-between bg-[#F1E9DC]">
          <div className="flex items-center gap-3">
            <span className="font-editorial-sans text-xl font-bold tracking-[0.18em] uppercase text-[#292723]">
              MRDĀ <span className="text-[#873A35] text-xs">✦</span>
            </span>
            <div className="h-4 w-[1px] bg-[#DCCBB4]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#70452D]">
              Visitor Information
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#70452D] hover:text-[#873A35] transition-colors rounded-full hover:bg-[#DCCBB4]/40 cursor-pointer"
            aria-label="Close Directions Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-mono tracking-widest uppercase text-[#873A35] block mb-1">
              Thaltej, Ahmedabad
            </span>
            <h3 className="text-2xl font-editorial-sans uppercase tracking-[0.04em] text-[#292723]">
              The Claywalls
            </h3>
            <p className="text-xs sm:text-sm text-[#70452D] mt-1 font-light leading-relaxed">
              Located in Thaltej, designed as a slow-paced brick and stone enclave where the city noise fades away.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-white p-6 border border-[#DCCBB4] rounded-xs space-y-4">
            
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-[#873A35] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="block text-xs font-mono uppercase tracking-wider text-[#70452D]/80 mb-0.5">
                  Address
                </span>
                <p className="text-sm font-medium text-[#292723]">
                  {address}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="p-1.5 border border-[#DCCBB4] rounded text-[#70452D] hover:text-[#873A35] hover:bg-[#FFF3DF] transition-colors text-xs inline-flex items-center gap-1"
                title="Copy Address"
              >
                {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                <span className="text-[10px] uppercase font-mono">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-3 pt-3 border-t border-[#DCCBB4]/40">
              <Clock size={18} className="text-[#873A35] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-mono uppercase tracking-wider text-[#70452D]/80 mb-0.5">
                  Opening Hours
                </span>
                <p className="text-sm font-medium text-[#292723]">
                  {hours}
                </p>
                <p className="text-xs text-[#70452D] font-light mt-0.5">
                  Kitchen closes at 9:30 PM. Pour-over and batch brews served all day.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-start gap-3 pt-3 border-t border-[#DCCBB4]/40">
              <Phone size={18} className="text-[#873A35] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-mono uppercase tracking-wider text-[#70452D]/80 mb-0.5">
                  Telephone & Enquiries
                </span>
                <p className="text-sm font-mono text-[#292723] flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                    className="hover:text-[#873A35] underline decoration-[#DCCBB4] hover:decoration-[#873A35] transition-colors"
                  >
                    {phone}
                  </a>
                  <span className="text-[#70452D]/60">/</span>
                  <a
                    href="mailto:hello@atmrda.com"
                    className="hover:text-[#873A35] underline decoration-[#DCCBB4] hover:decoration-[#873A35] transition-colors"
                  >
                    hello@atmrda.com
                  </a>
                </p>
              </div>
            </div>

          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={settings.googleMapsUrl || CAFE_DETAILS.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-medium tracking-widest uppercase py-3 rounded-full transition-colors shadow-xs"
            >
              <span>Open in Google Maps</span>
              <ExternalLink size={14} />
            </a>

            <button
              onClick={() => {
                onClose();
                onOpenBooking();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-[#873A35] text-[#873A35] hover:bg-[#873A35] hover:text-[#FFF3DF] text-xs font-medium tracking-widest uppercase py-3 rounded-full transition-colors cursor-pointer"
            >
              <span>Book Table</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#DCCBB4]/30 border-t border-[#DCCBB4] text-[11px] font-mono text-[#70452D] text-center">
          MRDĀ · Ahmedabad · 6th Floor, Claywalls, Zydus Hospital Road
        </div>

      </div>
    </div>
  );
};
