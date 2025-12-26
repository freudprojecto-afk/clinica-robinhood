/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nova paleta de cores - Clínica Freud
        'clinica-bg': '#f2f2f0',        // Fundo neutro (não branco)
        'clinica-primary': '#355a6c',    // Cabeçalho, títulos, menus, rodapé
        'clinica-text': '#1f2a30',      // Texto corrido, subtítulos (quase preto)
        'clinica-accent': '#e6ded3',    // Submenu, blocos empáticos, testemunhos
        'clinica-menu': '#a68a62',      // Menus (dourado acastanhado)
        'clinica-cta': '#f5b746',       // CTAs (amarelo dourado)
        // Cores de compatibilidade (mantidas para transição suave)
        'robinhood-green': '#f5b746',   // Mapeado para CTA
        'robinhood-dark': '#1f2a30',    // Mapeado para texto escuro
        'robinhood-card': '#e6ded3',    // Mapeado para accent
        'robinhood-border': '#355a6c',  // Mapeado para primary
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
