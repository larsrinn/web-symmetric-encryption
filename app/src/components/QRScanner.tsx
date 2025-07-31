import { useState, useRef, useCallback, useEffect } from 'react';
import jsQR from 'jsqr';
import { isValidEncryptedData, base64ToEncryptedData, type EncryptedData } from '../utils/crypto';

interface QRScannerProps {
  onQRScanned: (data: EncryptedData) => void;
}

export function QRScanner({ onQRScanned }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setMessage('');
    
    // Stop animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Clear video
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const scanQRCode = useCallback(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    // Set canvas size to match video
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR scanning
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      try {
        // Try to decode as base64 first, then fall back to JSON for backwards compatibility
        let parsedData: EncryptedData;
        
        try {
          // Try to decode as base64
          parsedData = base64ToEncryptedData(code.data);
        } catch {
          // Fall back to JSON parsing for backwards compatibility
          parsedData = JSON.parse(code.data);
          if (!isValidEncryptedData(parsedData)) {
            setMessage('QR-Code gefunden, aber kein gültiger verschlüsselter Text.');
            return;
          }
        }
        
        setMessage('QR-Code erfolgreich gescannt!');
        onQRScanned(parsedData);
        stopScanning();
        return;
      } catch {
        setMessage('QR-Code gefunden, aber ungültiges Datenformat.');
      }
    }

    // Continue scanning
    animationRef.current = requestAnimationFrame(scanQRCode);
  }, [isScanning, onQRScanned, stopScanning]);

  // Handle video setup when component state changes
  useEffect(() => {
    if (isScanning && stream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;
      
      // Start scanning when video is ready
      const handleLoadedMetadata = () => {
        scanQRCode();
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [isScanning, stream, scanQRCode]);

  const startScanning = async () => {
    try {
      setMessage('Kamera wird gestartet...');
      
      // Request camera permission with preference for back camera
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // Set stream and scanning state - video setup will happen in useEffect
      setStream(mediaStream);
      setIsScanning(true);
      setMessage('Scanner läuft... Halten Sie den QR-Code vor die Kamera.');
    } catch (error) {
      console.error('Camera access error:', error);
      setMessage('Kamera-Zugriff fehlgeschlagen. Bitte erlauben Sie den Kamera-Zugriff.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        QR-Code Scanner
      </h3>
      
      <p className="text-gray-600 mb-4">
        Verwenden Sie die Kamera Ihres Geräts, um einen QR-Code mit verschlüsselten Daten zu scannen.
        Die Kamera-Daten verlassen niemals Ihr Gerät.
      </p>

      <div className="space-y-4">
        <div className="flex gap-2">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              QR-Scanner starten
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Scanner stoppen
            </button>
          )}
        </div>

        {message && (
          <div className={`px-4 py-3 rounded ${
            message.includes('erfolgreich') 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : message.includes('fehlgeschlagen') || message.includes('ungültig')
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-blue-100 border border-blue-400 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        {isScanning && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-md mx-auto rounded-lg border border-gray-300"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}