import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not found. Some features may not work.')
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.get('/api/data', async (req, res) => {
  try {
    // Exemplo de endpoint que busca dados do Supabase
    // Substitua 'your_table' pelo nome da sua tabela
    if (!supabase) {
      return res.json({ message: 'Supabase not configured', data: [] })
    }

    // const { data, error } = await supabase
    //   .from('your_table')
    //   .select('*')
    
    // if (error) throw error
    
    res.json({ 
      message: 'Success',
      data: [] // data
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: error.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
})


