'use client';

import { useState } from 'react';

export const useCopyToClipboard = (resetDelay: number = 2000) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      
      setTimeout(() => {
        setIsCopied(false);
      }, resetDelay);
      
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setIsCopied(false);
      return false;
    }
  };

  return { isCopied, copyToClipboard };
};

