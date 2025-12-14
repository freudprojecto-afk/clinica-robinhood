import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not found. Some features may not work.')
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'))
    }
  },
})

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Clínica Backend API',
    status: 'running',
    endpoints: {
      health: '/health',
      professionals: '/api/professionals',
      appointments: '/api/appointments'
    }
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ============================================
// PROFESSIONALS API
// ============================================

// Get all professionals (ordered by order field)
app.get('/api/professionals', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' })
    }

    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .order('order', { ascending: true })

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    console.error('Error fetching professionals:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get single professional
app.get('/api/professionals/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' })
    }

    const { id } = req.params

    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Error fetching professional:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create professional
app.post('/api/professionals', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' })
    }

    const { name, title, specialty, cv, order } = req.body

    // Get max order if not provided
    let finalOrder = order
    if (finalOrder === undefined || finalOrder === null) {
      const { data: maxData } = await supabase
        .from('professionals')
        .select('order')
        .order('order', { ascending: false })
        .limit(1)
        .single()

      finalOrder = maxData ? maxData.order + 1 : 0
    }

    const { data, error } = await supabase
      .from('professionals')
      .insert([
        {
          name,
          title,
          specialty,
          cv: cv || null,
          order: finalOrder,
          photo_url: null,
        },
      ])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error('Error creating professional:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update professional
app.put('/api/professionals/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' })
    }

    const { id } = req.params
    const { name, title, specialty, cv, order, photo_url } = req.body

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (title !== undefined) updateData.title = title
    if (specialty !== undefined) updateData.specialty = specialty
    if (cv !== undefined) updateData.cv = cv
    if (order !== undefined) updateData.order = order
    if (photo_url !== undefined) updateData.photo_url = photo_url

    const { data, error } = await supabase
      .from('professionals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Error updating professional:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete professional
app.delete('/api/professionals/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' })
    }

    const { id } = req.params

    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Professional deleted successfully' })
  } catch (error) {
    console.error('Error deleting professional:', error)
    res.status(500).json({ error: error.message })
  }
})

// Upload photo for professional
app.post('/api/professionals/:id/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { id } = req.params
    const file = req.file

    // Generate unique filename
    const fileExt = path.extname(file.originalname)
    const fileName = `${id}-${Date.now()}${fileExt}`
    const filePath = `professionals/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath)

    const photoUrl = urlData.publicUrl

    // Update professional with photo URL
    const { data, error } = await supabase
      .from('professionals')
      .update({ photo_url: photoUrl })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ photo_url: photoUrl, professional: data })
  } catch (error) {
    console.error('Error uploading photo:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update order of professionals (bulk update)
app.put('/api/professionals/order', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' })
    }

    const { orders } = req.body // Array of { id, order }

    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'orders must be an array' })
    }

    // Update each professional's order
    const updates = orders.map(({ id, order }) =>
      supabase
        .from('professionals')
        .update({ order })
        .eq('id', id)
    )

    await Promise.all(updates)

    res.json({ message: 'Orders updated successfully' })
  } catch (error) {
    console.error('Error updating orders:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// APPOINTMENTS API
// ============================================

// Create appointment request
app.post('/api/appointments', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' })
    }

    const { nome, email, telefone, tipoConsulta, preferenciaData, preferenciaHora, mensagem } = req.body

    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          nome,
          email,
          telefone,
          tipo_consulta: tipoConsulta,
          preferencia_data: preferenciaData || null,
          preferencia_hora: preferenciaHora || null,
          mensagem: mensagem || null,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error('Error creating appointment:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all appointments (for admin)
app.get('/api/appointments', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' })
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    console.error('Error fetching appointments:', error)
    res.status(500).json({ error: error.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  if (!supabase) {
    console.warn('⚠️  Supabase not configured. Some features will not work.')
  }
})
