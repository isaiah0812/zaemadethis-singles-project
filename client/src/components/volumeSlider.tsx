import { useState } from "react"
import './styles/sliders.css';
import { mdiVolumeHigh, mdiVolumeLow, mdiVolumeMedium, mdiVolumeMute } from "@mdi/js";
import Icon from "@mdi/react";
import './styles/shared.css';

interface VolumeSliderProps {
  song: HTMLMediaElement
}

export default function VolumeSlider({ song }: VolumeSliderProps) {
  const [ volume, setVolume ] = useState(50);
  const [ volumeIcon, setVolumeIcon ] = useState(mdiVolumeMedium);

  const selectVolumeIcon = (incomingVolume: number) => {
    if (incomingVolume === 0) {
      setVolumeIcon(mdiVolumeMute);
    } else if (incomingVolume < (1/3) * 100) {
      setVolumeIcon(mdiVolumeLow);
    } else if (incomingVolume < (2/3) * 100) {
      setVolumeIcon(mdiVolumeMedium);
    } else {
      setVolumeIcon(mdiVolumeHigh);
    }
  }
  
  return (
    <div id="volume-container">
      <button onClick={() => {
        if (song.volume !== 0) {
          song.volume = 0;

          selectVolumeIcon(0);
        } else {
          song.volume = volume / 100;
          selectVolumeIcon(volume);
        }
      }}>
        <Icon path={volumeIcon} size="2rem" color="#FFFFFF" />
      </button>
      <input
        className="slider"
        type="range"
        name="volume"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          setVolume(v)
          song.volume = v / 100;

          selectVolumeIcon(v);
        }} />
    </div>
  )
}