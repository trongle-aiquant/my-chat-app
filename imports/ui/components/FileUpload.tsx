import React, { useRef } from 'react';
import { Attachment } from '../../api/messages';
import { Button } from 'flowbite-react';

interface FileUploadProps {
  onFileSelect: (attachment: Attachment) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB for demo)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;

        const attachment: Attachment = {
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url: base64,
          name: file.name,
          size: file.size,
        };

        onFileSelect(attachment);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file:', err);
      alert('Error reading file');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-gray-300 hover:border-blue-400"
        title="Attach file"
      >
        📎
      </button>
    </div>
  );
};
