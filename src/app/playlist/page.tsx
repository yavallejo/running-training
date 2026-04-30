"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";

const PLAYLISTS = [
  {
    tempo: "130-140 BPM",
    label: "Ritmo ~11 min/km",
    color: "from-green-500/10 to-emerald-500/5",
    border: "border-green-500/20",
    description: "Ideal para tus entrenamientos cómodos. Canciones con ritmo constante que no agobian.",
    songs: [
      { title: "Blinding Lights", artist: "The Weeknd", bpm: 136 },
      { title: "Levitating", artist: "Dua Lipa", bpm: 135 },
      { title: "Can't Stop the Feeling", artist: "Justin Timberlake", bpm: 133 },
      { title: "Shut Up and Dance", artist: "Walk the Moon", bpm: 128 },
      { title: "Happy", artist: "Pharrell Williams", bpm: 132 },
      { title: "Count on Me", artist: "Bruno Mars", bpm: 130 },
      { title: "Perfect", artist: "Ed Sheeran", bpm: 132 },
      { title: "Shape of You", artist: "Ed Sheeran", bpm: 135 }
    ]
  },
  {
    tempo: "140-150 BPM",
    label: "Ritmo más rápido",
    color: "from-orange-500/10 to-amber-500/5",
    border: "border-orange-500/20",
    description: "Para cuando te sientas con energía y quieras correr un poco más rápido (últimos km).",
    songs: [
      { title: "Run the World (Girls)", artist: "Beyoncé", bpm: 145 },
      { title: "Stronger", artist: "Kelly Clarkson", bpm: 148 },
      { title: "Poker Face", artist: "Lady Gaga", bpm: 143 },
      { title: "Titanium", artist: "David Guetta ft. Sia", bpm: 146 },
      { title: "Don't Start Now", artist: "Dua Lipa", bpm: 142 },
      { title: "Good 4 U", artist: "Olivia Rodrigo", bpm: 144 },
      { title: "Physical", artist: "Dua Lipa", bpm: 147 },
      { title: "S&M", artist: "Rihanna", bpm: 150 }
    ]
  },
  {
    tempo: "120-130 BPM",
    label: "Calentamiento / Enfriamiento",
    color: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-500/20",
    description: "Ritmo más lento para caminata de calentamiento y enfriamiento después de correr.",
    songs: [
      { title: "Here Comes the Sun", artist: "The Beatles", bpm: 128 },
      { title: "Three Little Birds", artist: "Bob Marley", bpm: 125 },
      { title: "What a Wonderful World", artist: "Louis Armstrong", bpm: 123 },
      { title: "Landslide", artist: "Fleetwood Mac", bpm: 122 },
      { title: "Bubbly", artist: "Colbie Caillat", bpm: 124 },
      { title: "Sunday Morning", artist: "Maroon 5", bpm: 126 }
    ]
  }
];

const SPOTIFY_PLAYLIST = "https://open.spotify.com/playlist/37i9dQZF1DX70RnRXqJl8S";

export default function PlaylistPage() {
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <button
              onClick={() => router.back()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              🎵 Playlist para Correr
            </h1>
            <p className="text-base text-muted-foreground">
              Música con el ritmo ideal para tus ~11 min/km
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            Salir
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-surface p-5 text-center">
          <p className="text-sm text-muted-foreground mb-1">¿Qué es BPM?</p>
          <p className="text-base font-semibold text-foreground">
            BPM = Beats Per Minute (pulsaciones por minuto)
          </p>
          <p className="mt-2 text-base text-muted-foreground">
            Para ~11 min/km, busca canciones de 130-140 BPM. ¡La música ayuda a mantener el ritmo!
          </p>
        </div>

        <div className="space-y-5">
          {PLAYLISTS.map((playlist, index) => (
            <motion.div
              key={playlist.tempo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className={`rounded-2xl border ${playlist.border} bg-gradient-to-br ${playlist.color} overflow-hidden`}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎵</span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {playlist.tempo}
                    </h3>
                    <span className="text-sm px-2 py-0.5 rounded-full bg-foreground/10 text-muted-foreground">
                      {playlist.label}
                    </span>
                  </div>
                </div>
                <p className="text-base text-muted-foreground mb-4 ml-9">
                  {playlist.description}
                </p>

                <div className="space-y-1 ml-9">
                  {playlist.songs.map((song, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-foreground/5 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground/40 w-6 text-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-base font-medium text-foreground">
                            {song.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {song.artist}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        {song.bpm} BPM
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/5 p-5 text-center"
        >
          <p className="text-base font-semibold text-green-500 mb-2">
            🎧 ¿Usas Spotify?
          </p>
          <p className="text-base text-muted-foreground mb-4">
            Busca: "Running Hits 130 BPM" o "Workout Pop Rising"
          </p>
          <a
            href={SPOTIFY_PLAYLIST}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-white text-base font-semibold hover:bg-green-600 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Abrir Spotify
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 rounded-2xl border border-border bg-surface p-4 text-center"
        >
          <p className="text-sm text-muted-foreground">
            💡 Tip: Usa solo UN oído si corres en la calle, para escuchar el tráfico
          </p>
        </motion.div>
      </div>
    </main>
  );
}