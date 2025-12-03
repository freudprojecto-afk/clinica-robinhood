'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
     import Header from '../components/Header'
     import StatsCard from '../components/StatsCard'
     import ChartCard from '../components/ChartCard'
     import ListCard from '../components/ListCard'
import { TrendingUp, Users, Activity, DollarSign } from 'lucide-react'

export default function Home() {
  const [supabase] = useState(() => createClientComponentClient())
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revenue: 0,
    growth: 0,
  })

  useEffect(() => {
    // Aqui você pode buscar dados do Supabase
    // Exemplo de dados mockados por enquanto
    setStats({
      total: 1248,
      active: 892,
      revenue: 45678,
      growth: 12.5,
    })
  }, [])

  return (
    <div className="min-h-screen bg-robinhood-dark">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total"
            value={stats.total.toLocaleString()}
            change={stats.growth}
            icon={<Users className="w-6 h-6" />}
            trend="up"
          />
          <StatsCard
            title="Ativos"
            value={stats.active.toLocaleString()}
            change={8.2}
            icon={<Activity className="w-6 h-6" />}
            trend="up"
          />
          <StatsCard
            title="Receita"
            value={`R$ ${stats.revenue.toLocaleString()}`}
            change={15.3}
            icon={<DollarSign className="w-6 h-6" />}
            trend="up"
          />
          <StatsCard
            title="Crescimento"
            value={`${stats.growth}%`}
            change={2.1}
            icon={<TrendingUp className="w-6 h-6" />}
            trend="up"
          />
        </div>

        {/* Charts and Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard />
          </div>
          <div>
            <ListCard />
          </div>
        </div>
      </main>
    </div>
  )
}



