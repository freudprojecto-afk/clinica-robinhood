'use client'

import { Menu, Bell, User } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-robinhood-card border-b border-robinhood-border backdrop-blur-sm bg-opacity-90">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-robinhood-border rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Clínica</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-robinhood-border rounded-lg transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-robinhood-green rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-robinhood-border rounded-lg transition-colors">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}


