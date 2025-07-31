import { useState } from 'react';
import { EncryptSection } from './components/EncryptSection';
import { DecryptSection } from './components/DecryptSection';
import { QRDisplay } from './components/QRDisplay';
import { QRScanner } from './components/QRScanner';
import { type EncryptedData, encryptedDataToBase64 } from './utils/crypto';

function App() {
  const [encryptedData, setEncryptedData] = useState<EncryptedData | null>(null);
  const [scannedData, setScannedData] = useState<EncryptedData | null>(null);

  const handleEncrypted = (data: EncryptedData) => {
    setEncryptedData(data);
  };

  const handleQRScanned = (data: EncryptedData) => {
    setScannedData(data);
  };

  const handleDecryptDataChange = (data: string) => {
    // This is called when the decrypt section's ciphertext changes
    // We can use this to clear scanned data if user manually edits
    if (!scannedData) return;
    
    try {
      // Compare with the base64 representation of scanned data
      const scannedBase64 = encryptedDataToBase64(scannedData);
      if (data.trim() !== scannedBase64) {
        setScannedData(null);
      }
    } catch {
      setScannedData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Sichere Text-Verschlüsselung
          </h1>
          <p className="mt-2 text-gray-600">
            Verschlüsseln und entschlüsseln Sie Texte sicher in Ihrem Browser - ohne Datenübertragung
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Security Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            🔒 Sicherheitshinweise
          </h2>
          <div className="space-y-2 text-blue-800">
            <p>
              <strong>Vollständig offline:</strong> Alle Verschlüsselungs- und Entschlüsselungsoperationen 
              erfolgen lokal in Ihrem Browser. Keine Daten werden an Server übertragen.
            </p>
            <p>
              <strong>AES-GCM Verschlüsselung:</strong> Wir verwenden den Industriestandard AES-GCM mit 
              256-Bit-Schlüsseln für maximale Sicherheit.
            </p>
            <p>
              <strong>PBKDF2 Schlüsselableitung:</strong> Ihr Passwort wird mit 100.000 Iterationen 
              gehärtet, um Brute-Force-Angriffe zu erschweren.
            </p>
            <p>
              <strong>Kamera nur lokal:</strong> Der QR-Code-Scanner verwendet nur lokale Verarbeitung. 
              Kamerabilder verlassen niemals Ihr Gerät.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            ⚙️ So funktioniert es
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Verschlüsselung:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Ihr Passwort wird mit PBKDF2 und einem zufälligen Salt gehärtet</li>
                <li>Ein 256-Bit AES-Schlüssel wird abgeleitet</li>
                <li>Der Text wird mit AES-GCM und einem zufälligen IV verschlüsselt</li>
                <li>Alle Parameter werden als JSON gespeichert und als QR-Code angezeigt</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Entschlüsselung:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Das gleiche Passwort wird mit den gespeicherten Parametern gehärtet</li>
                <li>Der identische AES-Schlüssel wird reproduziert</li>
                <li>Die verschlüsselten Daten werden mit dem ursprünglichen IV entschlüsselt</li>
                <li>Der Originaltext wird wiederhergestellt</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column - Encryption */}
          <div className="space-y-8">
            <EncryptSection onEncrypted={handleEncrypted} />
            
            {encryptedData && (
              <QRDisplay encryptedData={encryptedData} />
            )}
          </div>

          {/* Right Column - Decryption */}
          <div className="space-y-8">
            <DecryptSection 
              encryptedData={scannedData}
              onDataChange={handleDecryptDataChange}
            />
            
            <QRScanner onQRScanned={handleQRScanned} />
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔧 Technische Details
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Verschlüsselung</h3>
              <ul className="space-y-1">
                <li>• AES-GCM 256-Bit</li>
                <li>• Authentifizierte Verschlüsselung</li>
                <li>• Zufällige 96-Bit IVs</li>
                <li>• Tamper-Detection</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Schlüsselableitung</h3>
              <ul className="space-y-1">
                <li>• PBKDF2 mit SHA-256</li>
                <li>• 100.000 Iterationen</li>
                <li>• 128-Bit zufällige Salts</li>
                <li>• Schutz vor Rainbow Tables</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Implementation</h3>
              <ul className="space-y-1">
                <li>• Web Crypto API</li>
                <li>• Lokale Bibliotheken</li>
                <li>• Open Source Code</li>
                <li>• Auditierbar & transparent</li>
              </ul>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            Diese Anwendung ist Open Source. Überprüfen Sie den Code für vollständige Transparenz.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;