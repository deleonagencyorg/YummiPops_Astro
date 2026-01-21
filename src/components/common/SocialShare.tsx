import React, { useEffect, useState } from 'react';
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

type Platform = 'facebook' | 'twitter' | 'whatsapp' | 'telegram';

type Labels = {
  facebook: string;
  twitter: string;
  whatsapp: string;
  telegram: string;
};

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

  return (
    <div className={`social-share flex gap-2 items-center ${className}`}>
      {platforms.includes('facebook') && (
        <div className={`inline-block ${buttonClassName}`}>
          <FacebookShareButtonAny
            url={shareUrl}
            quote={`${shareTitle}\n${shareDescription}`}
            hashtag={hashtags.length > 0 ? `#${hashtags[0]}` : undefined}
          >
            <FacebookIcon size={iconSize} round={round} />
            {showLabels && <span className="block text-xs mt-1">{labels.facebook}</span>}
          </FacebookShareButtonAny>
        </div>
      )}

      {platforms.includes('twitter') && (
        <div className={`inline-block ${buttonClassName}`}>
          <TwitterShareButtonAny url={shareUrl} title={shareTitle} hashtags={hashtags}>
            <TwitterIcon size={iconSize} round={round} />
            {showLabels && <span className="block text-xs mt-1">{labels.twitter}</span>}
          </TwitterShareButtonAny>
        </div>
      )}

      {platforms.includes('whatsapp') && (
        <div className={`inline-block ${buttonClassName}`}>
          <WhatsappShareButtonAny url={shareUrl} title={`${shareTitle}\n${shareDescription}`}>
            <WhatsappIcon size={iconSize} round={round} />
            {showLabels && <span className="block text-xs mt-1">{labels.whatsapp}</span>}
          </WhatsappShareButtonAny>
        </div>
      )}

      {platforms.includes('telegram') && (
        <div className={`inline-block ${buttonClassName}`}>
          <TelegramShareButtonAny url={shareUrl} title={`${shareTitle}\n${shareDescription}`}>
            <TelegramIcon size={iconSize} round={round} />
            {showLabels && <span className="block text-xs mt-1">{labels.telegram}</span>}
          </TelegramShareButtonAny>
        </div>
      )}
    </div>
  );
}
