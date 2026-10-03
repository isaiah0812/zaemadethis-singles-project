import { mdiTrayArrowDown } from "@mdi/js";
import Icon from "@mdi/react";
import './styles/shared.css';

type DownloadButtonProps = {
  onClick: () => any
}

export default function DownloadButton({ onClick }: DownloadButtonProps) {
  return (
    <button id="download-button" className="player-controls" onClick={onClick}>
      <Icon path={mdiTrayArrowDown} size="2rem" color="#ffffff" />
    </button>
  )
}