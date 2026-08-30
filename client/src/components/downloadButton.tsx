import { mdiTrayArrowDown } from "@mdi/js";
import Icon from "@mdi/react";

type DownloadButtonProps = {
  onClick: () => any
}

export default function DownloadButton({ onClick }: DownloadButtonProps) {
  const downloadSong = () => window.location.assign('http://localhost:8080/audio/download')
  return (
    <button id="download-button" onClick={onClick}>
      <Icon path={mdiTrayArrowDown} size="2rem" />
    </button>
  )
}