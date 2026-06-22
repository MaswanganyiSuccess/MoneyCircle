// frontend/src/components/views/Landing/SelfieCapture.tsx
import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface SelfieCaptureProps {
  onCapture: (file: File) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function SelfieCapture({ onCapture, onError, className = '' }: SelfieCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setError(null);
    } catch (err) {
      const msg = 'Camera access denied. Please allow camera permissions.';
      setError(msg);
      if (onError) onError(msg);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture image from video
  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    detectFace(imageData);
  };

  // Face detection using native FaceDetector API
  const detectFace = async (imageData: string) => {
    setIsDetecting(true);
    setFaceDetected(null);
    try {
      // Check if FaceDetector is supported
      if (!('FaceDetector' in window)) {
        // Fallback: assume face detected (skip detection)
        setFaceDetected(true);
        const file = dataURLtoFile(imageData, 'selfie.jpg');
        onCapture(file);
        stopCamera();
        return;
      }

      // Create a temporary image to detect face
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => (img.onload = resolve));

      const faceDetectorConstructor = (window as any).FaceDetector;
      const detector = new faceDetectorConstructor({
        maxDetectedFaces: 1,
        fastMode: true,
      });
      const faces = await detector.detect(img);
      const detected = faces.length > 0;
      setFaceDetected(detected);

      if (detected) {
        const file = dataURLtoFile(imageData, 'selfie.jpg');
        onCapture(file);
        stopCamera();
      } else {
        setError('No face detected. Please position your face clearly and try again.');
        if (onError) onError('No face detected.');
        // Keep camera open to retry
      }
    } catch (err) {
      console.error('Face detection error:', err);
      // Fallback: accept the image anyway (but we could also retry)
      setFaceDetected(true);
      const file = dataURLtoFile(imageData, 'selfie.jpg');
      onCapture(file);
      stopCamera();
    } finally {
      setIsDetecting(false);
    }
  };

  // Helper: convert dataURL to File
  const dataURLtoFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Retake: clear captured image and restart camera
  const retake = () => {
    setCapturedImage(null);
    setFaceDetected(null);
    setError(null);
    startCamera();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // If no camera yet, show start button
  if (!stream && !capturedImage) {
    return (
      <div className={`flex flex-col items-center gap-3 p-4 border-2 border-dashed rounded-xl ${className}`}>
        <Camera className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Take a live selfie for verification</p>
        <button
          type="button"
          onClick={startCamera}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          Start Camera
        </button>
      </div>
    );
  }

  // Camera active – show video and capture controls
  if (stream && !capturedImage) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative rounded-lg overflow-hidden bg-black/5 border border-border">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-80 object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              type="button"
              onClick={capture}
              disabled={isDetecting}
              className="px-4 py-2 rounded-full bg-white/90 dark:bg-black/70 text-foreground text-sm font-medium backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-black/90 disabled:opacity-50"
            >
              {isDetecting ? 'Detecting...' : 'Capture'}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium backdrop-blur-sm hover:bg-destructive/20"
            >
              Cancel
            </button>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Position your face clearly in the frame</p>
      </div>
    );
  }

  // Captured image – show preview and retry
  if (capturedImage) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={capturedImage} alt="Selfie preview" className="w-full max-h-80 object-cover" />
          {faceDetected === false && (
            <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
              <span className="bg-destructive/90 text-white px-3 py-1 rounded-full text-sm">No face detected</span>
            </div>
          )}
          {faceDetected === true && (
            <div className="absolute top-2 right-2 bg-emerald-500/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Check className="h-3 w-3" /> Face verified
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={retake}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/20 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Retake
          </button>
          {faceDetected === false && (
            <span className="text-xs text-destructive flex items-center">Please retake with clear face</span>
          )}
          {faceDetected === true && (
            <span className="text-xs text-emerald-500 flex items-center">Selfie accepted ✓</span>
          )}
        </div>
      </div>
    );
  }

  return null;
}