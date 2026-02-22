import { useEffect, useState } from 'react';
import './App.css'
import DownloadButton from './components/downloadButton';
import TimeSeeker from './components/timeSeeker';
import VolumeSlider from './components/volumeSlider';

function App() {
  const [ song, setSong ] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('http://localhost:8080/audio/stream')
      .then((response) => response.blob())
      .then(b => {
        const audio = new Audio();
        audio.src = URL.createObjectURL(b)
        audio.load()

        setSong(audio);
      })
      .catch(err => console.error(err));
  }, [])
  
  return (
    <>
      {song ? 
        <div id="player">
          <TimeSeeker song={song} />
          <div id="second-row">
            <VolumeSlider song={song} />
            <DownloadButton />
          </div>
        </div>
      : 'No Audio'}
    </>
  )
}

export default App
