import { useState } from 'react';
import './App.css';

interface Song {
  id: number;
  title: string;
  artists: string[];
  cover: string;
}

const songs = [
  { id: 1, title: 'Song 1', artists: [ 'Isaiah Bullard' ], cover: 'src/assets/Zaes_Room.png' },
  { id: 2, title: 'Song 2', artists: [ 'Isaiah Bullard', 'We$ Clinton' ], cover: 'src/assets/Zaes_Room.png' },
  { id: 3, title: 'Song 3', artists: [ 'Isaiah Bullard' ], cover: 'src/assets/Zaes_Room.png' }
];

const newSong: Song = {
  id: 0,
  title: '',
  artists: [],
  cover: ''
}

type SongState = {
  song: Song,
  setSong: React.Dispatch<React.SetStateAction<Song | undefined>>
}

function SongForm({song, setSong}: SongState) {
  // song.id === 0 means this is creating a new song

  const [ title, setTitle ] = useState<string>(song.title);
  const [ artists, setArtists ] = useState<string>(song.artists.join(','))

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      fetch('http://localhost:8080/audio/save', {
        method: 'POST',
        body: JSON.stringify({
          title,
          artist: artists.split(',')[0],
          id: song.id || undefined
        })
      })
      .then((response) => response.text())
      .then((text) => {
        console.log(text)
      })
      .catch((error) => {
        console.error(error)
        alert('Error!');
      })
      .finally(() => setSong(undefined))
    }}>
      <input
        name="title"
        type="text"
        style={{ fontSize: '2rem', color: 'rgba(255, 255, 255, 0.87)', background: 'transparent', border: 'none' }}
        defaultValue={title}
        placeholder="Enter Song Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <img src={song.cover} height="100rem" width="auto" alt={`${song.title} cover art.`} />
      <label>ID</label>
      <input name="id" type="text" disabled value={song.id || 'New Song'} />
      <label>Artists</label>
      <input name="artists" type="text" disabled={song.id !== 0} defaultValue={artists} value={artists} onChange={(e) => setArtists(e.target.value)} />
      <label>Audio</label>
      <input name="audio" type="file" accept="audio/mpeg" onChange={(e) => console.log(`New Audio: ${e.target.value}`)} />
      <input type="submit" value={song.id === 0 ? `Create ${title === "" ? 'New Song' : `"${title}"`}` : `Edit "${title}"`} />
    </form>
  )
}

function App() {

  const [ song, setSong ] = useState<Song|undefined>(undefined);
  
  return (
    <div>
      {song ? (
        <div>
          <button onClick={() => setSong(undefined)}>Back</button>
          <br />
          <SongForm song={song} setSong={setSong} />
        </div>
      ) : (
        <div>
          <div id="songs">
            {songs.map(s =>
              <div className="song-card" onClick={() => setSong(s)}>
                <span>{s.title}</span>
              </div>)}
          </div>
          <button onClick={() => setSong(newSong)}>Create New Song</button>
        </div>
      )}
    </div>
  )
}

export default App
