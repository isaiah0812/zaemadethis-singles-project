import './App.css'
import PlayOrPauseButton from './components/playOrPauseButton';
import TimeSeeker from './components/timeSeeker';
import VolumeSlider from './components/volumeSlider';

function App() {
  const song = new Audio('Dont_Go_Way_Nobody.mp3');

  return (
    <>
      <TimeSeeker song={song} />
      <PlayOrPauseButton song={song} />
      <VolumeSlider song={song} />
    </>
  )
}

export default App
