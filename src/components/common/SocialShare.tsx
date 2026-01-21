import React, { useEffect, useMemo, useState } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon
} from 'react-share';

const FacebookShareButtonAny = FacebookShareButton as any;
const TwitterShareButtonAny = TwitterShareButton as any;
const WhatsappShareButtonAny = WhatsappShareButton as any;
const TelegramShareButtonAny = TelegramShareButton as any;

type Platform = 'facebook' | 'twitter' | 'x' | 'instagram' | 'tiktok' | 'whatsapp' | 'telegram';

type Labels = {
  facebook: string;
  twitter: string;
  x?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp: string;
  telegram: string;
};

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.8-3.9 1.1 0 2.25.2 2.25.2v2.46h-1.27c-1.25 0-1.64.78-1.64 1.58V12h2.79l-.45 2.88h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.77 7.73L23 22h-6.46l-5.06-6.53L5.8 22H2.7l7.24-8.27L1 2h6.62l4.57 5.98L18.9 2Zm-1.13 18h1.72L6.67 3.9H4.82L17.77 20Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4Zm-4.5 4a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm5.25-.9a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M16.7 2h-2.6v12.1a3.3 3.3 0 1 1-2.3-3.1V8.2a6 6 0 1 0 4.9 5.9V7.3c1.1.8 2.4 1.3 3.8 1.4V6.2c-1.8-.2-3.3-1.6-3.8-3.4Z" />
    </svg>
  );
}

async function fallbackShareOrCopy({ url, title, text }: { url: string; title: string; text: string }) {
  try {
    if ((navigator as any).share) {
      await (navigator as any).share({ url, title, text });
      return true;
    }
  } catch (e) {
    // ignore
  }

  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (e) {
    return false;
  }
}

export type SocialShareProps = {
  shareId?: string;
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  iconSize?: number;
  round?: boolean;
  className?: string;
  buttonClassName?: string;
  platforms?: Platform[];
  labels?: Labels;
  showLabels?: boolean;
};

export default function SocialShare({
  shareId,
  url,
  title,
  description = '',
  hashtags = [],
  iconSize = 32,
  round = true,
  className = '',
  buttonClassName = '',
  platforms = ['facebook', 'twitter', 'whatsapp', 'telegram'],
  labels = {
    facebook: 'Facebook',
    twitter: 'Twitter',
    x: 'X',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram'
  },
  showLabels = false
}: SocialShareProps) {
  const [shareUrl, setShareUrl] = useState(url);
  const [shareTitle, setShareTitle] = useState(title);
  const [shareDescription, setShareDescription] = useState(description);

  useEffect(() => setShareUrl(url), [url]);
  useEffect(() => setShareTitle(title), [title]);
  useEffect(() => setShareDescription(description), [description]);

  useEffect(() => {
    if (!shareId) return;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail;
      if (!detail) return;
      if (detail.shareId !== shareId) return;

      if (typeof detail.url === 'string') setShareUrl(detail.url);
      if (typeof detail.title === 'string') setShareTitle(detail.title);
      if (typeof detail.description === 'string') setShareDescription(detail.description);
    };

    window.addEventListener('quiz:share-update', handler as EventListener);
    return () => window.removeEventListener('quiz:share-update', handler as EventListener);
  }, [shareId]);

  const [copied, setCopied] = useState('');

  const shareText = useMemo(() => {
    const parts = [shareTitle, shareDescription].filter(Boolean);
    return parts.join('\n');
  }, [shareTitle, shareDescription]);

  const setCopiedFlash = (key: string) => {
    setCopied(key);
    window.setTimeout(() => setCopied(''), 1200);
  };

  const pillBase = 'w-full h-11 inline-flex items-center justify-center gap-2.5 px-5 rounded-2xl font-bold text-sm transition focus:outline-none';

  const hasModern = platforms.some((p) => p === 'x' || p === 'instagram' || p === 'tiktok');
  const topPlatforms = hasModern
    ? platforms.filter((p) => p === 'facebook' || p === 'x' || p === 'instagram')
    : platforms;
  const bottomPlatforms = hasModern ? platforms.filter((p) => p === 'tiktok') : [];

  const renderPill = (platform: Platform) => {
    if (platform === 'facebook') {
      return (
        <FacebookShareButtonAny
          url={shareUrl}
          quote={shareText}
          hashtag={hashtags.length > 0 ? `#${hashtags[0]}` : undefined}
          className={`${pillBase} h-14 text-lg rounded-2xl bg-[#1877F2] text-white ${buttonClassName}`}
        >
          <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1877F2]">
            <IconFacebook />
          </span>
          {showLabels && <span className="leading-none font-bold">{labels.facebook}</span>}
        </FacebookShareButtonAny>
      );
    }

    if (platform === 'twitter' || platform === 'x') {
      const label = platform === 'x' ? (labels.x || 'X') : labels.twitter;
      return (
        <TwitterShareButtonAny
          url={shareUrl}
          title={shareTitle}
          hashtags={hashtags}
          className={`${pillBase} h-14 text-lg rounded-2xl bg-black text-white ${buttonClassName}`}
        >
          <IconX />
          {showLabels && <span className="leading-none font-bold">{label}</span>}
        </TwitterShareButtonAny>
      );
    }

    if (platform === 'instagram') {
      return (
        <button
          type="button"
          onClick={async () => {
            const ok = await fallbackShareOrCopy({ url: shareUrl, title: shareTitle, text: shareText });
            if (ok) setCopiedFlash('instagram');
          }}
          className={`${pillBase} text-white ${buttonClassName}`}
          style={{ background: 'linear-gradient(90deg, #F58529 0%, #DD2A7B 45%, #8134AF 100%)' }}
        >
          <IconInstagram />
          {showLabels && <span className="leading-none">{copied === 'instagram' ? 'Copiado' : (labels.instagram || 'Instagram')}</span>}
        </button>
      );
    }

    if (platform === 'tiktok') {
      return (
        <button
          type="button"
          onClick={async () => {
            const ok = await fallbackShareOrCopy({ url: shareUrl, title: shareTitle, text: shareText });
            if (ok) setCopiedFlash('tiktok');
          }}
          className={`${pillBase} bg-black text-white w-full ${buttonClassName}`}
        >
          <IconTikTok />
          {showLabels && <span className="leading-none">{copied === 'tiktok' ? 'Copiado' : (labels.tiktok || 'TikTok')}</span>}
        </button>
      );
    }

    if (platform === 'whatsapp') {
      return (
        <WhatsappShareButtonAny
          url={shareUrl}
          title={shareText}
          className={`${pillBase} bg-[#25D366] text-white ${buttonClassName}`}
        >
          <WhatsappIcon size={16} round={false} />
          {showLabels && <span>{labels.whatsapp}</span>}
        </WhatsappShareButtonAny>
      );
    }

    if (platform === 'telegram') {
      return (
        <TelegramShareButtonAny
          url={shareUrl}
          title={shareText}
          className={`${pillBase} bg-[#229ED9] text-white ${buttonClassName}`}
        >
          <TelegramIcon size={16} round={false} />
          {showLabels && <span>{labels.telegram}</span>}
        </TelegramShareButtonAny>
      );
    }

    return null;
  };

  return (
    <div className={`social-share w-full ${className}`}>
      {hasModern ? (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topPlatforms.map((p) => (
              <div key={p} className="w-full">
                {renderPill(p as Platform)}
              </div>
            ))}
          </div>
          {bottomPlatforms.length > 0 && (
            <div className="mt-3">
              {renderPill('tiktok')}
            </div>
          )}
        </div>
      ) : (
        <div className={`flex gap-2 items-center ${className}`}>
          {platforms.map((p) => (
            <div key={p} className="inline-block">
              {renderPill(p)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
