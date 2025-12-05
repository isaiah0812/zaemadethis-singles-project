import { useEffect, useState } from "react"

interface VolumeSliderProps {
  song: HTMLMediaElement
}

export default function VolumeSlider({ song }: VolumeSliderProps) {
  const [ volume, setVolume ] = useState(50);
  useEffect(() => {
    song.volume = volume / 100
  }, [volume])
  return (
    <input type="range" name="volume" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} />
  )
}