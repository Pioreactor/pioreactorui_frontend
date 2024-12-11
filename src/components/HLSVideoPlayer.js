import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const HLSVideoPlayer = ({ streamUrl }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (!streamUrl) {
            console.error('Stream URL is not provided');
            return;
        }

        const video = videoRef.current;
        let hls;

        if (Hls.isSupported()) {
            hls = new Hls({
                 startLevel: -1,
                 maxBufferLength: 10,  // Lower max buffer length
                 maxBufferSize: 60 * 1000 * 1000,  // 60 MB
                 maxBufferHole: 0.2,  // Allow smaller buffer holes
                 fragLoadingTimeOut: 5000,  // Timeout for fragment loading
                 liveSyncDurationCount: 2,  // Reduce live sync duration to lower latency
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // For Safari
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [streamUrl]);

    return (
        <div>
            {streamUrl ? (
                <video ref={videoRef} controls style={{ width: '50%', height: 'auto' }} />
            ) : (
                <p>Error: Stream URL is missing.</p>
            )}
        </div>
    );
};

export default HLSVideoPlayer;
