'use client'

import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-robinhood-card border-t border-robinhood-border py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Clínica Freud</h3>
            <p className="text-gray-300">
              Ajudamos adultos, jovens e casais a recuperar o equilíbrio emocional 
              com psicólogos e psiquiatras experientes.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-robinhood-green" />
                <a href="tel:+351916649284" className="hover:text-robinhood-green transition-colors">
                  +351 916 649 284
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-robinhood-green" />
                <a href="mailto:consulta@clinicafreud.pt" className="hover:text-robinhood-green transition-colors">
                  consulta@clinicafreud.pt
                </a>
              </div>
              <div className="flex items-start gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-robinhood-green mt-1" />
                <span>
                  Avenida 5 de Outubro, 122, 8º Esq.<br />
                  1050-061 Lisboa
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Horário</h4>
            <p className="text-gray-300">
              De segunda a sábado<br />
              Entre as 08h - 21h<br />
              <span className="text-sm text-gray-400">(contacte-nos para saber os horários vagos)</span>
            </p>
          </div>
        </div>

        <div className="border-t border-robinhood-border pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Clínica Freud. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
