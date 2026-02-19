export async function fetchSongs() {
  const res = await fetch('/api/songs')
  if (!res.ok) throw new Error('Failed to fetch songs')
  return res.json()
}

export async function saveSongs(songs) {
  const res = await fetch('/api/songs', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ songs })
  })
  if (!res.ok) throw new Error('Failed to save songs')
  return res.json()
}
