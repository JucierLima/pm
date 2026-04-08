import React from 'react';
import { Download } from 'lucide-react';
import './InstallButton.css';

export default function InstallButton({ prompt, onInstalled }) {
  if (!prompt) return null;

  const handleInstall = async () => {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted' && onInstalled) onInstalled();
  };

  return (
    <div className="install-banner">
      <div className="install-text">
        <strong>Estude Offline!</strong>
        <p>Instale o app da PM-PE na sua tela inicial.</p>
      </div>
      <button className="install-btn" onClick={handleInstall}>
        <Download size={18} />
        Instalar
      </button>
    </div>
  );
}
