"use client";

// lucide-react v1 dropped brand icons — inline the 4 brand marks instead.
type IconProps = { size?: number; className?: string };

function FacebookIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5H16.4V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2 3h6.3l4.3 5.7L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.1.2-.3.2-.6.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.2 2.2-.2 3.9a12 12 0 0 0 4.6 4.3c1.7.8 2.4.9 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3z" />
    </svg>
  );
}

// Social links live in env (NEXT_PUBLIC_*_URL) so they can be updated without code changes.
const SOCIALS = [
  { label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/circuitbazaar", Icon: FacebookIcon },
  { label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/circuitbazaar", Icon: InstagramIcon },
  { label: "Twitter / X", href: process.env.NEXT_PUBLIC_TWITTER_URL || "https://x.com/circuitbazaar", Icon: XIcon },
  { label: "WhatsApp", href: process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/9779800000000", Icon: WhatsAppIcon },
];

export default function TopBar() {
  return (
    <div className="bg-slate-900">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="text-slate-400 transition-colors hover:text-white"
            >
              <Icon size={15} />
            </a>
          ))}
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
          Nepal hardware hub
        </p>
      </div>
    </div>
  );
}
