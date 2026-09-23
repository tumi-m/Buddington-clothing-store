// FILE: src/music/MusicContext.tsx
// Global sound state, so music keeps playing while the shopper moves around the
// store. It sits above <App/> (like CartProvider), and main.tsx mounts the dock
// beside App rather than inside it: App swaps whole trees between the editorial
// shell and the 3D experience, and anything mounted inside those trees would be
// torn down — and fall silent — on every view change.
//
// Three ways to play, one at a time:
//   • a connected Spotify account (Web Playback SDK; Premium),
//   • a connected Apple Music account (MusicKit),
//   • a pasted link in the provider's official embed player (no account needed).

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { appleQueueFor, parseMusicLink, type MusicLink, type MusicProvider } from './links'
import type { NowPlaying } from './types'
import { useAppleMusicSession, type AppleSession } from './useAppleMusicSession'
import { useSpotifySession, type SpotifySession } from './useSpotifySession'

/**
 * editorial — bottom-right: the editorial screens set text and CTAs flush left.
 * immersive — bottom-left, lifted over the 3D view's carousel; that view keeps
 *             its own controls on the right.
 */
export type DockPlacement = 'editorial' | 'immersive'
type Active = MusicProvider | 'embed' | null

export interface MusicContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  tab: MusicProvider
  setTab: (tab: MusicProvider) => void
  placement: DockPlacement
  setPlacement: (p: DockPlacement) => void
  /** Link currently in the embed player, if that is what is playing. */
  embed: MusicLink | null
  /** Last link played, offered again after a reload. */
  recent: MusicLink | null
  spotify: SpotifySession
  apple: AppleSession
  /** Track info from whichever connected account is the active source. */
  nowPlaying: (NowPlaying & { provider: MusicProvider }) | null
  playLink: (link: MusicLink) => void
  playSpotify: (uri: string) => void
  playApple: (queue: MusicKitWeb.QueueOptions) => void
  stopEmbed: () => void
  togglePlayback: () => void
  nextTrack: () => void
}

const MusicContext = createContext<MusicContextValue | null>(null)
/**
 * Separate from MusicContext on purpose: App needs only this setter, and it is
 * stable, so App (and the 3D scene under it) never re-renders on a track change.
 */
const PlacementContext = createContext<((p: DockPlacement) => void) | null>(null)

const STORAGE_KEY = 'buddington-sound'

function loadPrefs(): { tab: MusicProvider; recent: MusicLink | null } {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as { tab?: unknown; recent?: unknown }
    const tab = raw.tab === 'apple' ? 'apple' : 'spotify'
    // Re-validate rather than trust stored data: it becomes an iframe src.
    const recent = typeof raw.recent === 'string' ? parseMusicLink(raw.recent) : null
    return { tab, recent }
  } catch {
    return { tab: 'spotify', recent: null }
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadPrefs)
  const [open, setOpenState] = useState(false)
  const [everOpened, setEverOpened] = useState(false)
  const [tab, setTab] = useState<MusicProvider>(initial.tab)
  const [placement, setPlacement] = useState<DockPlacement>('editorial')
  const [embed, setEmbed] = useState<MusicLink | null>(null)
  const [recent, setRecent] = useState<MusicLink | null>(initial.recent)
  const [active, setActive] = useState<Active>(null)

  const spotify = useSpotifySession(everOpened)
  const apple = useAppleMusicSession(everOpened)

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next)
    if (next) setEverOpened(true)
  }, [])

  // Back from Spotify's consent screen: reopen where the shopper left off.
  useEffect(() => {
    if (!spotify.returned) return
    setTab('spotify')
    setOpen(true)
  }, [spotify.returned, setOpen])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tab, recent: recent?.openUrl ?? null }))
    } catch {
      /* private mode */
    }
  }, [tab, recent])

  const { pause: pauseSpotify, play: spotifyPlay } = spotify
  const { pause: pauseApple, play: applePlay } = apple

  const playSpotify = useCallback(
    (uri: string) => {
      setEmbed(null)
      pauseApple()
      setActive('spotify')
      spotifyPlay(uri)
    },
    [pauseApple, spotifyPlay],
  )

  const playApple = useCallback(
    (queue: MusicKitWeb.QueueOptions) => {
      setEmbed(null)
      pauseSpotify()
      setActive('apple')
      applePlay(queue)
    },
    [pauseSpotify, applePlay],
  )

  const playLink = useCallback(
    (link: MusicLink) => {
      setRecent(link)
      // A connected account plays the link itself — full tracks, real controls.
      if (link.provider === 'spotify' && spotify.status === 'ready' && link.uri) {
        playSpotify(link.uri)
        return
      }
      const queue = appleQueueFor(link)
      if (link.provider === 'apple' && apple.status === 'ready' && queue) {
        playApple(queue)
        return
      }
      pauseSpotify()
      pauseApple()
      setActive('embed')
      setEmbed(link)
    },
    [spotify.status, apple.status, playSpotify, playApple, pauseSpotify, pauseApple],
  )

  const stopEmbed = useCallback(() => {
    setEmbed(null)
    setActive((a) => (a === 'embed' ? null : a))
  }, [])

  const nowPlaying = useMemo<MusicContextValue['nowPlaying']>(() => {
    if (active === 'spotify' && spotify.nowPlaying) return { ...spotify.nowPlaying, provider: 'spotify' }
    if (active === 'apple' && apple.nowPlaying) return { ...apple.nowPlaying, provider: 'apple' }
    return null
  }, [active, spotify.nowPlaying, apple.nowPlaying])

  const { toggle: toggleSpotify, next: nextSpotify } = spotify
  const { toggle: toggleApple, next: nextApple } = apple
  const togglePlayback = useCallback(() => {
    if (active === 'spotify') toggleSpotify()
    else if (active === 'apple') toggleApple()
  }, [active, toggleSpotify, toggleApple])
  const nextTrack = useCallback(() => {
    if (active === 'spotify') nextSpotify()
    else if (active === 'apple') nextApple()
  }, [active, nextSpotify, nextApple])

  const value = useMemo<MusicContextValue>(
    () => ({
      open, setOpen, tab, setTab, placement, setPlacement, embed, recent, spotify, apple,
      nowPlaying, playLink, playSpotify, playApple, stopEmbed, togglePlayback, nextTrack,
    }),
    [open, setOpen, tab, placement, embed, recent, spotify, apple, nowPlaying, playLink,
      playSpotify, playApple, stopEmbed, togglePlayback, nextTrack],
  )

  return (
    <PlacementContext.Provider value={setPlacement}>
      <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
    </PlacementContext.Provider>
  )
}

export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used within a MusicProvider')
  return ctx
}

/** Lets a view move the dock clear of its own chrome. */
export function useMusicDockPlacement(placement: DockPlacement): void {
  const set = useContext(PlacementContext)
  useEffect(() => {
    set?.(placement)
  }, [set, placement])
}
