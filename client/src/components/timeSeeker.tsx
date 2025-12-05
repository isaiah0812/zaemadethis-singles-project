import { useState } from "react"

interface TimeSeekerProps {
  song: HTMLMediaElement
}

export default function TimeSeeker({ song }: TimeSeekerProps) {
  const [ duration, setDuration ] = useState(song.duration);
  const [ currentTime, setCurrentTime ] = useState(song.currentTime);

  song.onloadeddata = () => setDuration(song.duration);
  song.ontimeupdate = () => setCurrentTime(song.currentTime);
  
  return (
    <>
      {currentTime}/{duration}
      <input type="range" name="timeSeeker" min="0" max={duration} value={currentTime} onChange={(e) => {
        const newTime = parseFloat(e.target.value)
        song.fastSeek(newTime);
        setCurrentTime(newTime)
      }} />
    </>
  )
}