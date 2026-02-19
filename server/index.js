import express from 'express'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, '../data/songs.json')

const app = express()
app.use(express.json())

app.get('/api/songs', (req, res) => {
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
    res.json(data)
  } catch {
    res.json({ songs: [] })
  }
})

app.put('/api/songs', (req, res) => {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2))
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = 3001
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`))
