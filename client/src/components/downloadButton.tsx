import { Download } from './icons';
import './styles/shared.css';

type DownloadButtonProps = {
  onClick: () => any
}

export default function DownloadButton({ onClick }: DownloadButtonProps) {
  return (
    <button id="download-button" className="player-controls" onClick={onClick}>
      <Download size="2rem" />
    </button>
  )
}