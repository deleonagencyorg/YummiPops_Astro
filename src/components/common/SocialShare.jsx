 import React, { useEffect, useMemo, useState } from 'react';
import {
  FacebookShareButton,
  WhatsappShareButton,
  TelegramShareButton
} from 'react-share';

function IconFacebook({ size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.8-3.9 1.1 0 2.25.2 2.25.2v2.46h-1.27c-1.25 0-1.64.78-1.64 1.58V12h2.79l-.45 2.88h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function IconInstagram({ size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="currentColor" aria-hidden="true">
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4Zm-4.5 4a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm5.25-.9a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z" />
    </svg>
  );
}

function IconTikTok({ size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="currentColor" aria-hidden="true">
      <path d="M16.7 2h-2.6v12.1a3.3 3.3 0 1 1-2.3-3.1V8.2a6 6 0 1 0 4.9 5.9V7.3c1.1.8 2.4 1.3 3.8 1.4V6.2c-1.8-.2-3.3-1.6-3.8-3.4Z" />
    </svg>
  );
}

async function fallbackShareOrCopy({ url, title, text }) {
  try {
    if (navigator.share) {
      await navigator.share({ url, title, text });
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

const SocialShare = ({
  shareId,
  url,
  title,
  description = '',
  hashtags = [],
  iconSize = 32,
  round = true,
  className = '',
  buttonClassName = '',
  platforms = ['facebook', 'whatsapp', 'telegram'],
  labels = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    x: 'X',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram'
  },
  showLabels = false
}) => {
  const [shareUrl, setShareUrl] = useState(url);
  const [shareTitle, setShareTitle] = useState(title);
  const [shareDescription, setShareDescription] = useState(description);

  useEffect(() => {
    setShareUrl(url);
  }, [url]);

  useEffect(() => {
    setShareTitle(title);
  }, [title]);

  useEffect(() => {
    setShareDescription(description);
  }, [description]);

  useEffect(() => {
    if (!shareId) return;

    const handler = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      if (detail.shareId !== shareId) return;

      if (typeof detail.url === 'string') setShareUrl(detail.url);
      if (typeof detail.title === 'string') setShareTitle(detail.title);
      if (typeof detail.description === 'string') setShareDescription(detail.description);
    };

    window.addEventListener('quiz:share-update', handler);
    return () => window.removeEventListener('quiz:share-update', handler);
  }, [shareId]);

  const [copied, setCopied] = useState('');

  const shareText = useMemo(() => {
    const parts = [shareTitle, shareDescription].filter(Boolean);
    return parts.join('\n');
  }, [shareTitle, shareDescription]);

  const setCopiedFlash = (key) => {
    setCopied(key);
    window.setTimeout(() => setCopied(''), 1200);
  };

  const pillBase = 'w-full h-14 inline-flex items-center justify-center gap-2.5 px-5 rounded-2xl font-bold text-sm transition focus:outline-none';

  const hasModern = platforms.some((p) => p === 'instagram' || p === 'tiktok');

  const topPlatforms = hasModern
    ? platforms.filter((p) => p === 'facebook' || p === 'instagram')
    : platforms;
  const bottomPlatforms = hasModern ? platforms.filter((p) => p === 'tiktok') : [];

  const renderPill = (platform) => {
    if (platform === 'facebook') {
      return (
        <FacebookShareButton
          url={shareUrl}
          quote={shareText}
          hashtag={hashtags.length > 0 ? `#${hashtags[0]}` : undefined}
          className={`${pillBase} text-lg rounded-2xl !bg-blue text-white  ${buttonClassName}`}
        >
          <span style={{ width: iconSize, height: iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="text-white">
            <IconFacebook size={iconSize} />
          </span>
          {showLabels && <span className="leading-none font-bold text-white">{labels.facebook}</span>}
        </FacebookShareButton>
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
          <span style={{ width: iconSize, height: iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconInstagram size={iconSize} />
          </span>
          {showLabels && <span className="leading-none">{copied === 'instagram' ? 'Copiado' : labels.instagram}</span>}
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
          className={`${pillBase} bg-black text-white ${buttonClassName}`}
        >
          <span style={{ width: iconSize, height: iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconTikTok size={iconSize} />
          </span>
          {showLabels && <span className="leading-none">{copied === 'tiktok' ? 'Copiado' : labels.tiktok}</span>}
        </button>
      );
    }

    if (platform === 'whatsapp') {
      const src = 'https://snack.yummiespromociones.com/SnacksyummiesAssets/whatsapp.png';
      return (
        <WhatsappShareButton
          url={shareUrl}
          title={shareText}
          className={`${pillBase} bg-[#25D366] text-white ${buttonClassName}`}
        >
          <span style={{ width: iconSize, height: iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={src} alt="WhatsApp" style={{ width: iconSize, height: iconSize, objectFit: 'contain' }} />
          </span>
          {showLabels && <span>{labels.whatsapp}</span>}
        </WhatsappShareButton>
      );
    }

    if (platform === 'x') {
      const src = 'https://snack.yummiespromociones.com/SnacksyummiesAssets/x2.webp';
      const intentBase = 'https://x.com/intent/tweet';
      const hashtagsParam = hashtags && hashtags.length ? `&hashtags=${encodeURIComponent(hashtags.map(h => h.replace(/^#/, '')).join(','))}` : '';
      const intentUrl = `${intentBase}?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}${hashtagsParam}`;

      return (
        <button
          type="button"
          onClick={() => window.open(intentUrl, '_blank', 'noopener')}
          className={`${pillBase} text-white ${buttonClassName}`}
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        >
          <span style={{ width: iconSize * 1.5, height: iconSize * 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={src}
              alt="X"
              style={{
                width: iconSize * 1.5,
                height: iconSize * 1.5,
                objectFit: 'contain',
                display: 'block',
                verticalAlign: 'middle',
                transform: 'translateY(6%)'
              }}
            />
          </span>
          {showLabels && <span className="ml-2 leading-none">{labels.x}</span>}
        </button>
      );
    }

    if (platform === 'telegram') {
      const src = 'https://snack.yummiespromociones.com/SnacksyummiesAssets/telegram.png';
      return (
        <TelegramShareButton
          url={shareUrl}
          title={shareText}
          className={`${pillBase} bg-[#229ED9] text-white ${buttonClassName}`}
        >
          <span style={{ width: iconSize, height: iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={src} alt="Telegram" style={{ width: iconSize, height: iconSize, objectFit: 'contain' }} />
          </span>
          {showLabels && <span>{labels.telegram}</span>}
        </TelegramShareButton>
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
                {renderPill(p)}
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
};

export default SocialShare;
