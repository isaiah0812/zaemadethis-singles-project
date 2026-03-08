import { mdiTrayArrowDown } from "@mdi/js";
import Icon from "@mdi/react";

export default function DownloadButton() {
  const downloadSong = () => window.location.assign('http://localhost:8080/audio/download')
  return (
    <button id="download-button" onClick={downloadSong}>
      <Icon path={mdiTrayArrowDown} size="2rem" />
    </button>
  )
}