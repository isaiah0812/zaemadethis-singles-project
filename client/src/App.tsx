import './App.css'
import DownloadButton from './components/downloadButton';
import TimeSeeker from './components/timeSeeker';
import VolumeSlider from './components/volumeSlider';

function App() {
  const song = new Audio('Dont_Go_Way_Nobody.mp3');
  
  return (
    <>
      <div id="player">
        <TimeSeeker song={song} />
        <div id="second-row">
          <VolumeSlider song={song} />
          <DownloadButton />
        </div>
      </div>
    </>
  )
}

export default App
