import { mdiTrayArrowDown } from "@mdi/js";
import Icon from "@mdi/react";

type DownloadButtonProps = {
  onClick: () => any
}

export default function DownloadButton({ onClick }: DownloadButtonProps) {
  return (
    <button id="download-button" onClick={onClick}>
      <Icon path={mdiTrayArrowDown} size="2rem" />
    </button>
  )
}