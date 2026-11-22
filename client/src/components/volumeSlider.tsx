import { useEffect, useState } from "react"
import './styles/sliders.css';
import './styles/shared.css';
import { VolumeHigh, VolumeLow, VolumeMax, VolumeMedium, VolumeMuted } from "./icons";

interface VolumeSliderProps {
  song: HTMLMediaElement
}

type VolumeIcon = 'muted' | 'low' | 'medium' | 'high' | 'max';

export default function VolumeSlider({ song }: VolumeSliderProps) {
  const [ volume, setVolume ] = useState(50);
  const [ volumeIcon, setVolumeIcon ] = useState<VolumeIcon>('medium');

  useEffect(() => {
    song.volume = 0.5
  }, [])

  const selectVolumeIcon = (incomingVolume: number) => {
    if (incomingVolume === 0) {
      setVolumeIcon('muted');
    } else if (incomingVolume < (1/4) * 100) {
      setVolumeIcon('low');
    } else if (incomingVolume < (2/4) * 100) {
      setVolumeIcon('medium');
    } else if (incomingVolume < (3/4) * 100) {
      setVolumeIcon('high');
    } else {
      setVolumeIcon('max');
    }
  }
  
  return (
    <div id="volume-container">
      <button className="player-controls" onClick={() => {
        if (song.volume !== 0) {
          song.volume = 0;

          selectVolumeIcon(0);
        } else if (song.volume === 0 && volume !== 0) {
          song.volume = volume / 100;
          selectVolumeIcon(volume);
        } else {
          const v = 20;
          song.volume = v / 100;
          setVolume(v);
          selectVolumeIcon(v);
        }
      }}>
        { volumeIcon === 'muted' && <VolumeMuted size="2rem" /> }
        { volumeIcon === 'low' && <VolumeLow size="2rem" /> }
        { volumeIcon === 'medium' && <VolumeMedium size="2rem" /> }
        { volumeIcon === 'high' && <VolumeHigh size="2rem" /> }
        { volumeIcon === 'max' && <VolumeMax size="2rem" /> }
      </button>
      <input
        id="volume-slider"
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