'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  trend: 'up' | 'down'
}

export default function StatsCard({ title, value, change, icon, trend }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 hover:border-robinhood-green/50 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-robinhood-border rounded-lg group-hover:bg-robinhood-green/10 transition-colors">
          {icon}
        </div>
        <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-robinhood-green' : 'text-red-500'}`}>
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
      <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  )
}


