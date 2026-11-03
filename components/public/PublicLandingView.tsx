import React from 'react';
import { LandingHero } from './landing/LandingHero';
import { LandingMarquee } from './landing/LandingMarquee';
import { CapabilitiesGrid } from './landing/CapabilitiesGrid';
import { HowItWorks } from './landing/HowItWorks';
import { ModulesShowcase } from './landing/ModulesShowcase';
import { TrustSection } from './landing/TrustSection';
import { LandingFaq } from './landing/LandingFaq';
import { FinalCta } from './landing/FinalCta';

/**
 * Vitrine publique d'accueil Gest Tracker (v2.17.0 - Refonte complète animée et captivante)
 * Server Component d'assemblage modulaire haute performance (VIT-01, VIT-02, VIT-03)
 */
export function PublicLandingView() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* 1. Hero captivant avec mot rotatif mécanique et carte vivante interactif */}
      <LandingHero />

      {/* 2. Marquee défilant des capacités clés */}
      <LandingMarquee />

      {/* 3. Ce que vous pouvez faire (Grille de 8 tuiles orientées verbes d'action avec liens profonds) */}
      <CapabilitiesGrid />

      {/* 4. Comment ça marche en 3 étapes */}
      <HowItWorks />

      {/* 5. Démonstrateur interactif des 4 modules experts */}
      <ModulesShowcase />

      {/* 6. Engagements de sécurité & souveraineté */}
      <TrustSection />

      {/* 7. Questions fréquentes en accordéon natif */}
      <LandingFaq />

      {/* 8. Call to Action final */}
      <FinalCta />
    </div>
  );
}
