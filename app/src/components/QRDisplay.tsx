import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { type EncryptedData, encryptedDataToBase64 } from '../utils/crypto';

interface QRDisplayProps {
  encryptedData: EncryptedData | null;
}

export function QRDisplay({ encryptedData }: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [base64Data, setBase64Data] = useState<string>('');

  useEffect(() => {
    if (!encryptedData || !canvasRef.current) return;

    const generateQR = async () => {
      try {
        const base64String = encryptedDataToBase64(encryptedData);
        setBase64Data(base64String);
        await QRCode.toCanvas(canvasRef.current!, base64String, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
        });
      } catch (error) {
        console.error('QR Code generation failed:', error);
      }
    };

    generateQR();
  }, [encryptedData]);

  const handleCopyQRImage = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    } catch (error) {
      console.error('Failed to copy QR code to clipboard:', error);
    }
  };

  const handleCopyBase64 = async () => {
    if (!base64Data) return;
    
    try {
      await navigator.clipboard.writeText(base64Data);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!encryptedData) {
    return (
      <div className="bg-gray-50 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          QR-Code
        </h3>
        <p className="text-gray-500 text-center py-8">
          Verschlüsseln Sie einen Text, um den QR-Code zu sehen.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        QR-Code der verschlüsselten Daten
      </h3>
      
      <p className="text-gray-600 mb-4">
        Scannen Sie diesen QR-Code mit der Kamera, um die verschlüsselten Daten automatisch einzufügen.
      </p>

      <div className="flex flex-col items-center space-y-4">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded-lg max-w-full h-auto"
        />
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyQRImage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            QR-Code kopieren
          </button>
          
          <button
            onClick={handleCopyBase64}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Text kopieren
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">
          Verschlüsselte Daten:
        </h4>
        <pre className="bg-white border border-gray-200 rounded-md p-4 text-sm font-mono overflow-x-auto break-all">
          {base64Data}
        </pre>
      </div>
    </div>
  );
}