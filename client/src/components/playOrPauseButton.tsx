import { useState } from "react";
import './styles/shared.css';
import { Pause, Play } from "./icons";

interface PlayOrPauseButtonProps {
  song: HTMLAudioElement
}

type ControlButton = 'play' | 'pause';

export default function PlayOrPauseButton({ song }: PlayOrPauseButtonProps) {
  const [ controlButton, setControlButton ] = useState<ControlButton>('play');

  song.onended = () => setControlButton('play');

  return (
    <button className="player-controls" onClick={() => {
        if (song.paused === true) {
          song.play();
          setControlButton('pause');
        } else {
          song.pause();
          setControlButton('play');
        }
      }}>
        { controlButton === 'play' && <Play size="2rem" />}
        { controlButton === 'pause' && <Pause size="2rem" />}
      </button>
  );
}