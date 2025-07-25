import React from 'react';
import { Download } from 'lucide-react';

const FileAttachment = ({ file }) => {
  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('text')) return '📄';
    if (type.includes('zip') || type.includes('rar')) return '🗜️';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-base-200 p-3 rounded-lg mb-2 max-w-xs">
      <div className="flex items-center gap-3">
        <div className="text-2xl">
          {getFileIcon(file.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-zinc-400">{formatFileSize(file.size)}</p>
        </div>
        <a
          href={file.url}
          download={file.name}
          className="btn btn-sm btn-circle btn-ghost"
          title="Download file"
        >
          <Download size={16} />
        </a>
      </div>
    </div>
  );
};

export default FileAttachment;