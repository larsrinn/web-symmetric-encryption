import { useState, useEffect } from 'react';
import { decryptText, isValidEncryptedData, encryptedDataToBase64, base64ToEncryptedData, type EncryptedData } from '../utils/crypto';

interface DecryptSectionProps {
  encryptedData?: EncryptedData | null;
  onDataChange: (data: string) => void;
}

export function DecryptSection({ encryptedData, onDataChange }: DecryptSectionProps) {
  const [password, setPassword] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [error, setError] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Update ciphertext when encrypted data is provided from QR scanner
  useEffect(() => {
    if (encryptedData) {
      const base64String = encryptedDataToBase64(encryptedData);
      setCiphertext(base64String);
      onDataChange(base64String);
    }
  }, [encryptedData, onDataChange]);

  const handleDecrypt = async () => {
    setError('');
    setDecryptedText('');

    if (!password.trim()) {
      setError('Bitte geben Sie das Passwort ein.');
      return;
    }

    if (!ciphertext.trim()) {
      setError('Bitte geben Sie die verschlüsselten Daten ein.');
      return;
    }

    try {
      setIsDecrypting(true);
      
      // Try to parse as base64 first, then fall back to JSON for backwards compatibility
      let parsedData: EncryptedData;
      
      try {
        // Try to decode as base64
        parsedData = base64ToEncryptedData(ciphertext.trim());
      } catch {
        // Fall back to JSON parsing for backwards compatibility
        try {
          parsedData = JSON.parse(ciphertext);
          if (!isValidEncryptedData(parsedData)) {
            setError('Ungültiges Format der verschlüsselten Daten.');
            return;
          }
        } catch {
          setError('Ungültiges Format der verschlüsselten Daten. Erwarte Base64 oder JSON.');
          return;
        }
      }

      // Attempt decryption
      const decrypted = await decryptText(password, parsedData);
      setDecryptedText(decrypted);
      
    } catch (err) {
      setError('Entschlüsselung fehlgeschlagen. Prüfen Sie Ihr Passwort und die Daten.');
      console.error('Decryption error:', err);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCiphertextChange = (value: string) => {
    setCiphertext(value);
    onDataChange(value);
    // Clear decrypted text when ciphertext changes
    if (decryptedText) {
      setDecryptedText('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Text entschlüsseln
      </h2>
      
      <p className="text-gray-600 mb-6">
        Geben Sie das Passwort und die verschlüsselten Daten ein, um den ursprünglichen Text zu erhalten.
        Sie können auch einen QR-Code mit der Kamera scannen.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="decryptPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Passwort:
          </label>
          <input
            type="password"
            id="decryptPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Passwort für die Entschlüsselung"
          />
        </div>

        <div>
          <label htmlFor="ciphertext" className="block text-sm font-medium text-gray-700 mb-2">
            Verschlüsselte Daten:
          </label>
          <textarea
            id="ciphertext"
            value={ciphertext}
            onChange={(e) => handleCiphertextChange(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical font-mono text-sm break-all"
            placeholder="Hier die verschlüsselten Daten einfügen oder QR-Code scannen..."
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleDecrypt}
          disabled={isDecrypting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          {isDecrypting ? 'Entschlüssele...' : 'Text entschlüsseln'}
        </button>

        {decryptedText && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Entschlüsselter Text:
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm">
                {decryptedText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}