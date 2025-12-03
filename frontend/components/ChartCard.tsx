'use client'

import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Fev', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Abr', value: 4800 },
  { name: 'Mai', value: 6000 },
  { name: 'Jun', value: 5500 },
  { name: 'Jul', value: 7000 },
]

export default function ChartCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-robinhood-card border border-robinhood-border rounded-xl p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Visão Geral</h2>
        <p className="text-sm text-gray-400">Performance ao longo do tempo</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2330" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#131829',
              border: '1px solid #1E2330',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#00D9A5"
            strokeWidth={2}
            dot={{ fill: '#00D9A5', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}


