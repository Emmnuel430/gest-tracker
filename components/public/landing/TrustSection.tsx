import React from 'react';
import { ShieldCheck, EyeOff, FileText } from 'lucide-react';

export function TrustSection() {
  const commitments = [
    {
      title: 'Zéro Publicité & Zéro Revente',
      description: 'Vos données personnelles et habitudes de dépenses ne sont ni partagées, ni monétisées, ni exploitées.',
      icon: EyeOff,
      color: '#16A34A',
    },
    {
      title: 'Cloisonnement Hermétique RLS',
      description: 'Chaque ligne en base de données est protégée par Row Level Security au niveau du moteur PostgreSQL.',
      icon: ShieldCheck,
      color: '#2563EB',
    },
    {
      title: 'Souveraineté des Données',
      description: 'Vous pouvez exporter l’intégralité de vos opérations, comptes, budgets et dettes en JSON ou CSV à tout moment.',
      icon: FileText,
      color: '#FFE600',
    },
  ];

  return (
    <section id="securite" className="space-y-8 max-w-4xl mx-auto scroll-mt-20">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-neutral-200 dark:bg-neutral-700 text-[#111827] dark:text-[#F8FAFC] border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[2px_2px_0px_0px_#111827]">
          Transparence
        </span>
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Confidentialité & Sécurité
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {commitments.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="p-5 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3 text-left"
            >
              <div
                className="w-10 h-10 rounded-xl border-2 border-[#111827] flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]"
                style={{ backgroundColor: c.color }}
              >
                <Icon className="w-5 h-5 text-[#111827] stroke-2.5" />
              </div>
              <h3 className="text-sm font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                {c.title}
              </h3>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {c.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

