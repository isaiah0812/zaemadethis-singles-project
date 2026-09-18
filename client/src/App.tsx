import { useEffect, useState } from 'react';
import './App.css'
import DownloadButton from './components/downloadButton';
import TimeSeeker from './components/timeSeeker';
import VolumeSlider from './components/volumeSlider';
import PaymentModal from './components/payment';

function App() {
  const [ song, setSong ] = useState<HTMLAudioElement | null>(null);
  const [ payment, togglePayment ] = useState<boolean>(false);
  const [ download, toggleDownloadModal ] = useState<boolean>(false);

  const openPayment = () => togglePayment(true);
  const closePayment = () => togglePayment(false);
  const downloadSong = () => fetch('http://localhost:8080/audio/download')
    .then(res => res.blob())
    .then(blob => {
      const file = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = file;
      link.download = 'audio';
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(file);
    })
    .catch(e => console.error(e));

  const handleClosedDownloadModal = (event: any) => {
    event.preventDefault();
    if (event.target === event.currentTarget) {

      toggleDownloadModal(false);
    }
  };

  useEffect(() => {
    fetch('http://localhost:8080/audio/stream')
      .then((response) => response.blob())
      .then(b => {
        const audio = new Audio();
        audio.src = URL.createObjectURL(b)
        audio.load()

        setSong(audio);

        const params = new URLSearchParams(window.location.search);
        if (params.has('mode') && params.get('mode') === 'download') {
          toggleDownloadModal(true);
        }
      })
      .catch(err => console.error(err));
  }, []);
  
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
      {payment && <PaymentModal close={closePayment} onSuccess={downloadSong} />}
      {download && (
        <div className="modal-overlay" onClick={handleClosedDownloadModal}>
          <div className="modal">
            <h3>Do you want to download this song?</h3>
            <button onClick={downloadSong} style={{backgroundColor: 'blue'}}>Yes</button>
            <button onClick={() => toggleDownloadModal(false)} style={{backgroundColor: 'red'}}>No</button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
