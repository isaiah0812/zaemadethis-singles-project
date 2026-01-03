import { useState } from "react";
import { Icon } from '@mdi/react';
import { mdiPause, mdiPlay } from "@mdi/js";
import './styles/shared.css';

interface PlayOrPauseButtonProps {
  song: HTMLAudioElement
}

type ControlButton = typeof mdiPlay | typeof mdiPause;

export default function PlayOrPauseButton({ song }: PlayOrPauseButtonProps) {
  const [ controlButton, setControlButton ] = useState<ControlButton>(mdiPlay);

  song.onended = () => setControlButton(mdiPlay);

  return (
    <button onClick={() => {
        if (song.paused === true) {
          song.play();
          setControlButton(mdiPause);
        } else {
          song.pause();
          setControlButton(mdiPlay);
        }
      }}><Icon path={controlButton} size="2rem" color="#FFFFFF"/></button>
  );
}