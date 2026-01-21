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
  platforms = ['facebook', 'twitter', 'whatsapp', 'telegram'],
  labels = {
    facebook: 'Facebook',
    twitter: 'Twitter',
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

  const renderButtons = () => {
    const buttons = [];

    if (platforms.includes('facebook')) {
      buttons.push(
        <div key="facebook" className={`inline-block ${buttonClassName}`}>
          <FacebookShareButton 
            url={shareUrl} 
            quote={`${shareTitle}\n${shareDescription}`}
            hashtag={hashtags.length > 0 ? `#${hashtags[0]}` : undefined}
          >
            <FacebookIcon size={iconSize} round={round} />
            {showLabels && <span className="block text-xs mt-1">{labels.facebook}</span>}
          </FacebookShareButton>
        </div>
      );
    }

    if (platforms.includes('twitter')) {
      buttons.push(
        <div key="twitter" className={`inline-block ${buttonClassName}`}>
          <TwitterShareButton url={shareUrl} title={shareTitle} hashtags={hashtags}>
            <TwitterIcon size={iconSize} round={round} />
            {showLabels && <span className="block text-xs mt-1">{labels.twitter}</span>}
          </TwitterShareButton>
        </div>
      );
    }

    if (platforms.includes('whatsapp')) {
      buttons.push(
        <div key="whatsapp" className={`inline-block ${buttonClassName}`}>
          <WhatsappShareButton url={shareUrl} title={`${shareTitle}\n${shareDescription}`}>
            <WhatsappIcon size={iconSize} round={round} />
            {showLabels && <span className="block text-xs mt-1">{labels.whatsapp}</span>}
          </WhatsappShareButton>
        </div>
      );
    }

    if (platforms.includes('telegram')) {
      buttons.push(
        <div key="telegram" className={`inline-block ${buttonClassName}`}>
          <TelegramShareButton url={shareUrl} title={`${shareTitle}\n${shareDescription}`}>
            <TelegramIcon size={iconSize} round={round} />
            {showLabels && <span className="block text-xs mt-1">{labels.telegram}</span>}
          </TelegramShareButton>
        </div>
      );
    }

    return buttons;
  };

  return (
    <div className={`social-share flex gap-2 items-center ${className}`}>
      {renderButtons()}
    </div>
  );
};

export default SocialShare;
