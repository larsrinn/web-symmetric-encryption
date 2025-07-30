import { useState } from 'react';
import { encryptText, type EncryptedData } from '../utils/crypto';

interface EncryptSectionProps {
  onEncrypted: (data: EncryptedData) => void;
}

export function EncryptSection({ onEncrypted }: EncryptSectionProps) {
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [plaintext, setPlaintext] = useState('');
  const [error, setError] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  const handleEncrypt = async () => {
    // Clear previous errors
    setError('');

    // Validate password match
    if (password1 !== password2) {
      setError('Die Passwörter sind nicht identisch!');
      return;
    }

    // Validate inputs
    if (!password1.trim()) {
      setError('Bitte geben Sie ein Passwort ein.');
      return;
    }

    if (!plaintext.trim()) {
      setError('Bitte geben Sie einen Text zum Verschlüsseln ein.');
      return;
    }

    try {
      setIsEncrypting(true);
      const encryptedData = await encryptText(password1, plaintext);
      onEncrypted(encryptedData);
      
      // Clear form after successful encryption
      setPassword1('');
      setPassword2('');
      setPlaintext('');
    } catch (err) {
      setError('Fehler bei der Verschlüsselung!');
      console.error('Encryption error:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Text verschlüsseln
      </h2>
      
      <p className="text-gray-600 mb-6">
        Geben Sie ein starkes Passwort ein und den Text, den Sie verschlüsseln möchten. 
        Ihre Daten verlassen niemals Ihren Browser - die Verschlüsselung erfolgt vollständig lokal.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="password1" className="block text-sm font-medium text-gray-700 mb-2">
            Passwort:
          </label>
          <input
            type="password"
            id="password1"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Starkes Passwort eingeben"
          />
        </div>

        <div>
          <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">
            Passwort wiederholen:
          </label>
          <input
            type="password"
            id="password2"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Passwort erneut eingeben"
          />
        </div>

        <div>
          <label htmlFor="plaintext" className="block text-sm font-medium text-gray-700 mb-2">
            Text zum Verschlüsseln:
          </label>
          <textarea
            id="plaintext"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Hier den zu verschlüsselnden Text eingeben..."
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleEncrypt}
          disabled={isEncrypting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          {isEncrypting ? 'Verschlüssele...' : 'Text verschlüsseln'}
        </button>
      </div>
    </div>
  );
}