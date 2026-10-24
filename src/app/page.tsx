import { AboutSection } from "@/components/sections/about-section";
import { ContactSection } from "@/components/sections/contact-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ProcessSection } from "@/components/sections/process-section";
import { ServicesSection } from "@/components/sections/services-section";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { WorkSection } from "@/components/sections/work-section";
import { FaqSection } from "@/components/sections/faq-section";
import { ExperienceEnhancements } from "@/components/ui/experience-enhancements";
import { ToolkitSection } from "@/components/sections/toolkit-section";
import { DeliverySection } from "@/components/sections/delivery-section";
import { getContactDeliveryStatus } from "@/lib/contact-delivery";
import { getSiteConfiguration } from "@/lib/site";
import { portfolio } from "@/data/portfolio";

export default function HomePage() {
  const site = getSiteConfiguration();
  const profile = { "@context": "https://schema.org", "@type": "Person", name: portfolio.name, jobTitle: portfolio.role, ...(site.url ? { url: site.url.href } : {}) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profile).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
      <HeroSection />
      <WorkSection />
      <ServicesSection />
      <DeliverySection />
      <ToolkitSection />
      <AboutSection />
      <ProcessSection />
      <FaqSection />
      <ContactSection {...getContactDeliveryStatus()} />
      </main>
      <SiteFooter />
      <ExperienceEnhancements />
    </>
  );
}
