import './App.css'
import PlayOrPauseButton from './components/playOrPauseButton';
import TimeSeeker from './components/timeSeeker';
import VolumeSlider from './components/volumeSlider';

function App() {
  const song = new Audio('Dont_Go_Way_Nobody.mp3');

  return (
    <>
      <PlayOrPauseButton song={song} />
      <TimeSeeker song={song} />
      <VolumeSlider song={song} />
    </>
  )
}

export default App
