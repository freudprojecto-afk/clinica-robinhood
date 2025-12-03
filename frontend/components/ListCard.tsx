'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const recentItems = [
  { id: 1, name: 'Item A', value: 1250, change: 5.2, trend: 'up' },
  { id: 2, name: 'Item B', value: 890, change: -2.1, trend: 'down' },
  { id: 3, name: 'Item C', value: 2100, change: 8.5, trend: 'up' },
  { id: 4, name: 'Item D', value: 750, change: 3.7, trend: 'up' },
  { id: 5, name: 'Item E', value: 1450, change: -1.2, trend: 'down' },
]

export default function ListCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-robinhood-card border border-robinhood-border rounded-xl p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Recentes</h2>
        <p className="text-sm text-gray-400">Últimas atualizações</p>
      </div>
      
      <div className="space-y-4">
        {recentItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            className="flex items-center justify-between p-4 bg-robinhood-border rounded-lg hover:bg-opacity-80 transition-colors cursor-pointer group"
          >
            <div>
              <p className="font-semibold text-white">{item.name}</p>
              <p className="text-sm text-gray-400">R$ {item.value.toLocaleString()}</p>
            </div>
            <div className={`flex items-center space-x-1 ${item.trend === 'up' ? 'text-robinhood-green' : 'text-red-500'}`}>
              {item.trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{Math.abs(item.change)}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}


