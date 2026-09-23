// FILE: src/components/MusicDock.tsx
// The sound dock: a small SOUND control in a bottom corner of every view, which
// opens a panel to connect Spotify or Apple Music, or paste a link. Mounted once
// beside <App/> (main.tsx), never inside a view, so playback survives every
// navigation. The panel is hidden rather than unmounted when closed, because
// the embed player inside it is what is making the sound.
// House grammar: paper panel, ink type, JetBrains Mono labels, 1px hair rules,
// gold for the active state. No Sacred Red here — screens spend theirs.

import { useEffect, useRef, useState } from 'react'
import { embedHeight, parseMusicLink, type MusicLink, type MusicProvider } from '../music/links'
import { useMusic } from '../music/MusicContext'
import type { PlaylistRow, SessionStatus } from '../music/types'

const PROVIDER_NAME: Record<MusicProvider, string> = { spotify: 'Spotify', apple: 'Apple Music' }

const HOUSE_MIX: Record<MusicProvider, MusicLink | null> = {
  spotify: parseMusicLink(import.meta.env.VITE_SPOTIFY_HOUSE_PLAYLIST ?? ''),
  apple: parseMusicLink(import.meta.env.VITE_APPLE_MUSIC_HOUSE_PLAYLIST ?? ''),
}

function linkLabel(link: MusicLink): string {
  return `${PROVIDER_NAME[link.provider]} ${link.kind}`
}

const label = 'font-mono uppercase text-[0.62rem] tracking-[0.14em]'
const inkButton = `h-10 w-full bg-ink text-paper ${label} hover:bg-gold hover:text-ink transition-colors focus-visible:outline-gold`
const textButton = `${label} text-mute hover:text-ink transition-colors focus-visible:outline-gold`

export function MusicDock() {
  const m = useMusic()
  const panelRef = useRef<HTMLElement>(null)
  const pillRef = useRef<HTMLButtonElement>(null)
  const immersive = m.placement === 'immersive'
  const np = m.nowPlaying

  // Closed ≠ unmounted: keep it out of the tab order and the a11y tree instead.
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    panel.toggleAttribute('inert', !m.open)
    if (m.open) panel.focus({ preventScroll: true })
  }, [m.open])

  useEffect(() => {
    if (!m.open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      m.setOpen(false)
      pillRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [m.open, m.setOpen])

  const pillText = np ? `${np.title} — ${np.artist}` : m.embed ? linkLabel(m.embed) : null
  const playing = np ? np.playing : Boolean(m.embed)

  return (
    <div
      className={`fixed z-[55] flex flex-col gap-2 pointer-events-none ${
        immersive
          ? 'left-3 sm:left-5 items-start bottom-[calc(9rem+env(safe-area-inset-bottom))] sm:bottom-[9.5rem]'
          : 'right-3 sm:right-5 items-end bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6'
      }`}
    >
      <section
        ref={panelRef}
        id="sound-panel"
        tabIndex={-1}
        aria-label="Sound"
        aria-hidden={!m.open}
        className={`w-[min(92vw,360px)] flex flex-col bg-paper text-ink border border-hair shadow-2xl outline-none transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          immersive ? 'max-h-[min(34rem,calc(100dvh-13rem))]' : 'max-h-[min(34rem,calc(100dvh-6rem))]'
        } ${m.open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2'}`}
      >
        <header className="flex items-center justify-between px-5 h-12 border-b border-hair shrink-0">
          <span className={`${label} text-ink`}>
            SOUND <span className="text-mute">· A41</span>
          </span>
          <button
            onClick={() => {
              m.setOpen(false)
              pillRef.current?.focus()
            }}
            aria-label="Close sound"
            className="font-mono text-base leading-none text-mute hover:text-ink transition-colors focus-visible:outline-gold"
          >
            ✕
          </button>
        </header>

        <div className="flex gap-6 px-5 pt-3 border-b border-hair shrink-0">
          {(['spotify', 'apple'] as const).map((t) => (
            <button
              key={t}
              onClick={() => m.setTab(t)}
              aria-pressed={m.tab === t}
              className={`pb-2 -mb-px ${label} border-b transition-colors focus-visible:outline-gold ${
                m.tab === t ? 'text-ink border-gold' : 'text-mute border-transparent hover:text-ink'
              }`}
            >
              {PROVIDER_NAME[t].toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* First and stably keyed: switching tabs must never remount the
              player that is making the sound. */}
          {m.embed && <EmbedPlayer key={m.embed.embedUrl} link={m.embed} onStop={m.stopEmbed} />}
          {np && <NowPlayingRow />}
          {m.tab === 'spotify' ? <SpotifyAccount /> : <AppleAccount />}
          <HouseMix provider={m.tab} />
          <PasteLink />
          <Recent />
          <DevHint />
        </div>
      </section>

      <div className="pointer-events-auto flex items-stretch gap-1">
        <button
          ref={pillRef}
          onClick={() => m.setOpen(!m.open)}
          aria-expanded={m.open}
          aria-controls="sound-panel"
          className={`h-9 px-3 flex items-center gap-2 max-w-[min(70vw,22rem)] ${label} rounded-sm border transition-colors focus-visible:outline-gold ${
            immersive
              ? 'bg-black/40 backdrop-blur-md border-white/10 text-gray-300 hover:text-gold hover:border-gold'
              : 'bg-paper/95 backdrop-blur-sm border-hair text-ink hover:border-gold'
          }`}
        >
          <SoundBars active={playing} />
          <span className="shrink-0">SOUND</span>
          {pillText && (
            <span className="truncate normal-case tracking-normal font-serif text-[0.85rem]">· {pillText}</span>
          )}
        </button>
        {np && (
          <>
            <PillButton dark={immersive} onClick={m.togglePlayback} label={np.playing ? 'Pause' : 'Play'}>
              {np.playing ? '❚❚' : '▶'}
            </PillButton>
            <PillButton dark={immersive} onClick={m.nextTrack} label="Next track">
              ››
            </PillButton>
          </>
        )}
      </div>
    </div>
  )
}

function PillButton({
  dark,
  onClick,
  label: aria,
  children,
}: {
  dark: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className={`h-9 w-9 flex items-center justify-center font-mono text-[0.7rem] rounded-sm border transition-colors focus-visible:outline-gold ${
        dark
          ? 'bg-black/40 backdrop-blur-md border-white/10 text-gray-300 hover:text-gold hover:border-gold'
          : 'bg-paper/95 backdrop-blur-sm border-hair text-ink hover:border-gold'
      }`}
    >
      {children}
    </button>
  )
}

/** Three hairline bars; they move only while something is playing. */
function SoundBars({ active }: { active: boolean }) {
  return (
    <span aria-hidden className={`sound-bars ${active ? 'is-playing' : ''}`}>
      <i />
      <i />
      <i />
    </span>
  )
}

// ── panel sections ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className={`${label} text-gold mb-2`}>{children}</p>
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-mute text-[0.66rem] leading-relaxed">{children}</p>
}

function EmbedPlayer({ link, onStop }: { link: MusicLink; onStop: () => void }) {
  const spotify = link.provider === 'spotify'
  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionLabel>NOW PLAYING · {linkLabel(link).toUpperCase()}</SectionLabel>
        <button onClick={onStop} className={`${textButton} mb-2`}>
          STOP
        </button>
      </div>
      <iframe
        title={`${PROVIDER_NAME[link.provider]} player`}
        src={link.embedUrl}
        height={embedHeight(link)}
        className="w-full border-0 rounded-sm bg-paper-2"
        // Permission and sandbox values from each provider's own embed snippet.
        allow={
          spotify
            ? 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
            : 'autoplay *; encrypted-media *; fullscreen *; clipboard-write'
        }
        sandbox={
          spotify
            ? undefined
            : 'allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation'
        }
      />
      <div className="flex items-center justify-between mt-2 gap-3">
        <Note>Playing in {PROVIDER_NAME[link.provider]}’s own player — what you hear depends on your account there.</Note>
        <a
          href={link.openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${textButton} shrink-0`}
        >
          OPEN ↗
        </a>
      </div>
    </div>
  )
}

function NowPlayingRow() {
  const { nowPlaying: np } = useMusic()
  if (!np) return null
  return (
    <div>
      <SectionLabel>NOW PLAYING · {PROVIDER_NAME[np.provider].toUpperCase()}</SectionLabel>
      <div className="flex items-center gap-3">
        <Artwork src={np.image} />
        <div className="min-w-0">
          <p className="font-serif text-ink leading-tight truncate" style={{ fontSize: '1.05rem' }}>
            {np.title}
          </p>
          <p className="font-mono text-mute text-[0.7rem] truncate">{np.artist}</p>
        </div>
      </div>
    </div>
  )
}

function Artwork({ src }: { src?: string }) {
  return src ? (
    <img src={src} alt="" className="w-10 h-10 shrink-0 object-cover bg-paper-2" loading="lazy" />
  ) : (
    <span aria-hidden className="w-10 h-10 shrink-0 bg-paper-2 border border-hair" />
  )
}

function PlaylistList<T extends PlaylistRow>({
  rows,
  onPick,
  empty,
}: {
  rows: T[]
  onPick: (row: T) => void
  empty: string
}) {
  if (!rows.length) return <Note>{empty}</Note>
  return (
    <ul className="flex flex-col border-t border-hair">
      {rows.map((row) => (
        <li key={row.id} className="border-b border-hair">
          <button
            onClick={() => onPick(row)}
            className="w-full flex items-center gap-3 py-2 text-left group focus-visible:outline-gold"
          >
            <Artwork src={row.image} />
            <span className="font-serif text-ink truncate group-hover:text-gold transition-colors" style={{ fontSize: '0.98rem' }}>
              {row.name}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function AccountBlock({
  provider,
  status,
  message,
  onConnect,
  onDisconnect,
  signedInWhenBroken,
  intro,
  children,
}: {
  provider: MusicProvider
  status: SessionStatus
  message: string | null
  onConnect: () => void
  onDisconnect: () => void
  /** Whether an `error` still leaves an account signed in (so offer sign-out). */
  signedInWhenBroken: boolean
  intro: string
  children?: React.ReactNode
}) {
  // Not configured on this store: offer nothing that cannot work.
  if (status === 'off') return null
  const name = PROVIDER_NAME[provider]
  return (
    <div className="flex flex-col gap-3">
      {status === 'signed-out' && (
        <>
          <p className="font-serif text-ink leading-snug" style={{ fontSize: '1.1rem' }}>
            Play your own {name} while you browse.
          </p>
          <button onClick={onConnect} className={inkButton}>
            CONNECT {name.toUpperCase()}
          </button>
          <Note>{intro}</Note>
        </>
      )}
      {status === 'starting' && <p className={`${label} text-mute`}>CONNECTING TO {name.toUpperCase()}…</p>}
      {(status === 'ready' || status === 'error') && (
        <>
          <div className="flex items-center justify-between">
            <SectionLabel>{status === 'ready' ? 'YOUR PLAYLISTS' : `${name.toUpperCase()} · UNAVAILABLE`}</SectionLabel>
            {(status === 'ready' || signedInWhenBroken) && (
              <button onClick={onDisconnect} className={`${textButton} mb-2`}>
                DISCONNECT
              </button>
            )}
          </div>
          {children}
        </>
      )}
      {message && (
        <p role="status" className="font-mono text-ink text-[0.68rem] leading-relaxed border-l-2 border-gold pl-3">
          {message}
        </p>
      )}
    </div>
  )
}

function SpotifyAccount() {
  const { spotify, playSpotify } = useMusic()
  return (
    <AccountBlock
      provider="spotify"
      status={spotify.status}
      message={spotify.message}
      onConnect={spotify.connect}
      onDisconnect={spotify.disconnect}
      signedInWhenBroken
      intro="Plays here with Spotify Premium. On a free account, paste a link below to use Spotify’s own player."
    >
      {spotify.status === 'ready' && (
        <PlaylistList
          rows={spotify.playlists}
          empty="No playlists on this account yet."
          onPick={(playlist) => playSpotify(playlist.uri)}
        />
      )}
    </AccountBlock>
  )
}

function AppleAccount() {
  const { apple, playApple } = useMusic()
  return (
    <AccountBlock
      provider="apple"
      status={apple.status}
      message={apple.message}
      onConnect={apple.connect}
      onDisconnect={apple.disconnect}
      signedInWhenBroken={false}
      intro="Plays here with an Apple Music subscription. Without one, paste a link below to use Apple’s own player."
    >
      {apple.status === 'ready' && (
        <>
          {apple.previewOnly && (
            <Note>This account has no Apple Music subscription, so tracks play as previews.</Note>
          )}
          <PlaylistList
            rows={apple.playlists}
            empty="No playlists in this library yet."
            onPick={(row) => playApple({ playlist: row.id })}
          />
        </>
      )}
    </AccountBlock>
  )
}

function HouseMix({ provider }: { provider: MusicProvider }) {
  const { playLink } = useMusic()
  const link = HOUSE_MIX[provider]
  if (!link || link.provider !== provider) return null
  return (
    <button
      onClick={() => playLink(link)}
      className="flex items-center justify-between border border-hair hover:border-gold px-4 h-12 transition-colors group focus-visible:outline-gold"
    >
      <span className={`${label} text-ink group-hover:text-gold transition-colors`}>BUDDINGTON HOUSE MIX</span>
      <span className="font-jp text-mute text-[0.8rem]">バディントン</span>
    </button>
  )
}

function PasteLink() {
  const { tab, setTab, playLink } = useMusic()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const link = parseMusicLink(value)
        if (!link) {
          setError('That isn’t a Spotify or Apple Music link.')
          return
        }
        setError(null)
        setValue('')
        setTab(link.provider)
        playLink(link)
      }}
      className="flex flex-col gap-1"
    >
      <label htmlFor="sound-link" className={`${label} text-mute`}>
        PASTE A PLAYLIST, ALBUM OR TRACK LINK
      </label>
      <div className="flex">
        <input
          id="sound-link"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(null)
          }}
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder={tab === 'spotify' ? 'open.spotify.com/playlist/…' : 'music.apple.com/…/playlist/…'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'sound-link-error' : undefined}
          className="min-w-0 flex-1 h-10 px-3 bg-transparent border border-hair border-r-0 text-ink font-mono text-[0.72rem] placeholder:text-mute/60 focus:border-gold focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className={`h-10 px-4 bg-ink text-paper ${label} hover:bg-gold hover:text-ink transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-gold`}
        >
          PLAY
        </button>
      </div>
      {error && (
        <p id="sound-link-error" role="alert" className="font-mono text-ink text-[0.66rem] mt-1">
          {error}
        </p>
      )}
    </form>
  )
}

function Recent() {
  const { recent, embed, playLink } = useMusic()
  if (!recent || recent.embedUrl === embed?.embedUrl) return null
  return (
    <button onClick={() => playLink(recent)} className={`${textButton} text-left`}>
      ↻ PLAY AGAIN · {linkLabel(recent).toUpperCase()}
    </button>
  )
}

/** Owner-facing setup hint. Never shown in a production build. */
function DevHint() {
  const { tab, spotify, apple } = useMusic()
  if (!import.meta.env.DEV) return null
  const off = tab === 'spotify' ? spotify.status === 'off' : apple.status === 'off'
  if (!off) return null
  return (
    <p className="font-mono text-mute text-[0.6rem] leading-relaxed border border-dashed border-hair p-2">
      DEV · {tab === 'spotify'
        ? 'Connect is hidden: set VITE_SPOTIFY_CLIENT_ID (see .env.example).'
        : 'Connect is hidden: run `netlify dev` with the APPLE_MUSIC_* variables (see .env.example).'}{' '}
      Pasted links work without either.
    </p>
  )
}
