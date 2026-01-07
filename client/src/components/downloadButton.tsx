import { mdiTrayArrowDown } from "@mdi/js";
import Icon from "@mdi/react";

export default function DownloadButton() {
  return (
    <button id="download-button" onClick={() => alert('Song downloading!')}>
      <Icon path={mdiTrayArrowDown} size="2rem" />
    </button>
  )
}