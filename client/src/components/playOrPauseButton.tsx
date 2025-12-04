import { useState } from "react";

interface PlayOrPauseButtonProps {
  song: HTMLAudioElement
}

type ControlButton = 'pause' | 'play';

export default function PlayOrPauseButton({ song }: PlayOrPauseButtonProps) {
  const [ controlButton, setControlButton ] = useState<ControlButton>('play');

  return (
    <button onClick={() => {
        if (song.paused === true) {
          song.play();
          setControlButton('pause');
        } else {
          song.pause();
          setControlButton('play');
        }
      }}>{controlButton}</button>
  )
}