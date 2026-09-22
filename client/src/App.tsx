import { useEffect, useState } from 'react';
import './App.css'
import DownloadButton from './components/downloadButton';
import TimeSeeker from './components/timeSeeker';
import VolumeSlider from './components/volumeSlider';
import PaymentModal from './components/payment';

function App() {
  const [ song, setSong ] = useState<HTMLAudioElement | null>(null);
  const [ payment, togglePayment ] = useState<boolean>(false);
  const [ download, toggleDownloadPrompt ] = useState<boolean>(false);
  const [ instructions, toggleInstructions ] = useState<boolean>(false);

  const openPayment = () => togglePayment(true);
  const closePayment = () => togglePayment(false);
  const downloadSong = () => fetch('http://localhost:8080/audio/download')
    .then(res => res.blob())
    .then(blob => {
      toggleDownloadPrompt(false);
      const file = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = file;
      link.download = 'audio';
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(file);
      toggleInstructions(true);
    })
    .catch(e => console.error(e));

  const handleCloseDownloadModal = (event: any) => {
    event.preventDefault();
    if (event.target === event.currentTarget) {

      toggleDownloadPrompt(false);
    }
  };

  const handleCloseInstructionModal = (event: any) => {
    event.preventDefault();
    if (event.target === event.currentTarget) {

      toggleInstructions(false);
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
        if (params.has('session_id')) {
          fetch(`http://localhost:8080/payments/verify-payment/${params.get('session_id')}`)
            .then((res) => res.text())
            .then((text) => {
              if (text === 'OK!') {
                toggleDownloadPrompt(true);
              } else {
                // TODO do better on the error handling and pop up the modal with a message
                console.error('Error on verification:', text);
              }
            });
            
            // TODO change this to the title of the streamer
            history.replaceState({ page: 1 }, document.getElementsByName('title')[0].innerHTML, window.location.pathname);
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
        <div className="modal-overlay" onClick={handleCloseDownloadModal}>
          <div className="modal">
            <h3>Do you want to download this song?</h3>
            <button onClick={downloadSong} style={{backgroundColor: 'blue'}}>Yes</button>
            <button onClick={() => toggleDownloadPrompt(false)} style={{backgroundColor: 'red'}}>No</button>
          </div>
        </div>
      )}
      {instructions && (
        <div className="modal-overlay" onClick={handleCloseInstructionModal}>
          <div className="modal">
            Instructions will go here! Click outside of the modal to close.
          </div>
        </div>
      )}
    </>
  )
}

export default App
