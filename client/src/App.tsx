import { useEffect, useState } from 'react';
import './App.css'
import DownloadButton from './components/downloadButton';
import TimeSeeker from './components/timeSeeker';
import VolumeSlider from './components/volumeSlider';
import PaymentSelection from './components/payment';

function App() {
  const [ song, setSong ] = useState<HTMLAudioElement | null>(null);
  const [ payment, togglePayment ] = useState<boolean>(false);

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

  const openPayment = () => togglePayment(true);
  const closePayment = () => togglePayment(false);
  
  return (
    <>
      {song ? 
        <div id="player">
          <TimeSeeker song={song} />
          <div id="second-row">
            <VolumeSlider song={song} />
            <DownloadButton onClick={openPayment} />
          </div>
        </div>
      : 'No Audio'}
      {payment && <PaymentSelection close={closePayment} />}
    </>
  )
}

export default App
