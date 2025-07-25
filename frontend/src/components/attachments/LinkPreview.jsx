import React from 'react';
import { ExternalLink } from 'lucide-react';

const LinkPreview = ({ text }) => {
  const urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/g;
  const urls = text.match(urlRegex);

  const renderTextWithLinks = (text) => {
    if (!urls || urls.length === 0) {
      return text;
    }
    
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 break-all"
          >
            {part.length > 50 ? part.substring(0, 50) + '...' : part}
            <ExternalLink size={12} />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div>
      <p className="break-words">{renderTextWithLinks(text)}</p>
      {urls && urls.length > 0 && (
        <div className="mt-2 space-y-2">
          {urls.slice(0, 2).map((url, index) => (
            <LinkCard key={index} url={url} />
          ))}
        </div>
      )}
    </div>
  );
};

// Simple Link Card Component
const LinkCard = ({ url }) => {
  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-base-200 p-2 rounded border-l-4 border-primary max-w-xs hover:bg-base-300 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <ExternalLink size={14} className="text-zinc-400" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-400 truncate">{getDomain(url)}</p>
          <p className="text-sm truncate">{url.length > 40 ? url.substring(0, 40) + '...' : url}</p>
        </div>
      </div>
    </a>
  );
};

export default LinkPreview;