import { useState } from "react"

interface TimeSeekerProps {
  song: HTMLMediaElement
}

export default function TimeSeeker({ song }: TimeSeekerProps) {
  const getStringTime = (time: number): string => {
    const totalSeconds = Math.floor(time);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`
  }
  
  const [ duration, setDuration ] = useState(song.duration);
  const [ currentTime, setCurrentTime ] = useState(song.currentTime);

  song.onloadeddata = () => setDuration(song.duration)
  song.ontimeupdate = () => setCurrentTime(song.currentTime);
  
  return (
    <>
      {getStringTime(currentTime)}/{getStringTime(duration)}
      <input type="range" name="timeSeeker" min="0" max={duration.toString()} value={currentTime} onChange={(e) => {
        const newTime = parseFloat(e.target.value)
        song.fastSeek(newTime);
        setCurrentTime(newTime)
      }} />
    </>
  )
}