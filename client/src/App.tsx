import './App.css'
import TimeSeeker from './components/timeSeeker';
import VolumeSlider from './components/volumeSlider';

function App() {
  const song = new Audio('Dont_Go_Way_Nobody.mp3');

  return (
    <>
      <div id="player">
        <TimeSeeker song={song} />
        <VolumeSlider song={song} />
      </div>
    </>
  )
}

export default App
