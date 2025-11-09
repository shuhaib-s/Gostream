'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface HLSPlayerProps {
  streamKey: string;
  isLive?: boolean; // Stream status from parent
}

export default function HLSPlayer({ streamKey, isLive }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hlsRef = useRef<Hls | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);

  // Track when stream status changes to live
  const prevIsLiveRef = useRef<boolean | undefined>(isLive);
  const reloadDelayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If stream just went live, wait a bit before reloading
    // This gives time for RTMP → HLS conversion to complete
    if (isLive && !prevIsLiveRef.current) {
      console.log('🎥 Stream went live! Waiting for HLS to be ready...');
      
      // Clear any existing delay
      if (reloadDelayRef.current) {
        clearTimeout(reloadDelayRef.current);
      }
      
      // Wait 3 seconds for HLS to be ready, then reload
      reloadDelayRef.current = setTimeout(() => {
        console.log('🔄 Reloading HLS player...');
        retryCountRef.current = 0;
        setError(null); // Trigger re-initialization
      }, 3000); // 3 second delay
    }
    prevIsLiveRef.current = isLive;

    return () => {
      if (reloadDelayRef.current) {
        clearTimeout(reloadDelayRef.current);
      }
    };
  }, [isLive]);

  useEffect(() => {
    if (!videoRef.current) return;

    const HLS_URL = process.env.NEXT_PUBLIC_HLS_URL || 'http://localhost:8080/hls';
    const streamUrl = `${HLS_URL}/${streamKey}.m3u8`;
    const video = videoRef.current;

    // ✅ Don't try to load if stream is not live
    if (!isLive) {
      setError('Stream is offline. Start streaming to see preview.');
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const initializePlayer = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          // ✅ Limit retries to prevent infinite 404 requests
          manifestLoadingMaxRetry: 3,
          manifestLoadingRetryDelay: 3000,
          manifestLoadingMaxRetryTimeout: 15000,
          levelLoadingMaxRetry: 2,
          fragLoadingMaxRetry: 2,
        });
        hlsRef.current = hls;

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS stream loaded successfully');
          setIsLoading(false);
          setError(null);
          retryCountRef.current = 0; // Reset retry count on success
          video.play().catch((e) => {
            console.error('Autoplay error:', e);
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            if (isLive && retryCountRef.current < 5) {
              // If stream should be live but player failed, retry
              retryCountRef.current++;
              console.log(`⚠️ HLS not ready yet, retrying in 5s... (${retryCountRef.current}/5)`);
              setIsLoading(true);
              
              retryTimeoutRef.current = setTimeout(() => {
                hls.destroy();
                initializePlayer();
              }, 5000); // 5 second retry delay
            } else {
              // ✅ Stop HLS completely after max retries
              console.error('❌ HLS error after retries:', data);
              hls.destroy();
              hlsRef.current = null;
              setError(isLive 
                ? 'Stream preview not available yet. Please wait a moment and refresh.'
                : 'Waiting for stream to start...');
              setIsLoading(false);
            }
          }
        });

        return hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          console.log('✅ HLS stream loaded successfully (native)');
          setIsLoading(false);
          setError(null);
          video.play().catch((e) => {
            console.error('Autoplay error:', e);
          });
        });
        video.addEventListener('error', () => {
          if (isLive && retryCountRef.current < 5) {
            retryCountRef.current++;
            console.log(`⚠️ HLS not ready yet, retrying in 5s... (${retryCountRef.current}/5)`);
            retryTimeoutRef.current = setTimeout(() => {
              video.src = streamUrl;
              video.load();
            }, 5000); // 5 second retry delay
          } else {
            // ✅ Clear video source to stop further requests
            video.src = '';
            setError(isLive 
              ? 'Stream preview not available yet. Please wait a moment and refresh.'
              : 'Waiting for stream to start...');
            setIsLoading(false);
          }
        });
      } else {
        setError('HLS is not supported in this browser');
        setIsLoading(false);
      }
    };

    const hls = initializePlayer();

    return () => {
      if (hls) {
        hls.destroy();
      }
      hlsRef.current = null;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [streamKey, isLive]); // Re-run when streamKey or isLive changes (removed error to prevent loops)

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        controls
        className="w-full aspect-video"
        playsInline
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading stream...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-white text-center p-4">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}


