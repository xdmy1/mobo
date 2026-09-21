import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import About from "@/components/sections/About";
import LeadForm from "@/components/sections/LeadForm";
import OutroE from "@/components/sections/OutroE";
import Footer from "@/components/sections/Footer";

/**
 * Homepage.
 *
 * Band rhythm is deliberate. navarro.ro runs near-black end to end; the brief
 * was "not too black", so dark and warm-ivory bands alternate:
 *
 *   Hero          dark    ink-900
 *   Projects      LIGHT   bone-50     <- the page opens up
 *   Process       LIGHT   bone-100
 *   Testimonials  dark    ink-850
 *   About         LIGHT   bone-50
 *   LeadForm      dark    ink-900     <- the CTA lands on dark, so lime carries
 *   Footer        dark    ink-950
 *
 * The Categories band (rooms of the house) was cut at the client's request:
 * the site is organised BY PROJECT — one card per home — so the projects
 * showcase now follows the hero directly. components/sections/Categories.tsx
 * is kept for reference, like the unused outros.
 *
 * WhyMobo (the "De ce MOBO" numbered list) was also cut from the homepage at
 * the client's request — they want its content folded into Despre noi or
 * Servicii instead. The component is kept until that call is made.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Projects />
        <Process />
        <Testimonials />
        <About />
        <LeadForm />
      </main>
      {/* The brand moment sits between the last content section and the
          practical footer: the film ends, then the credits roll.

          Outro under review (2026-09-21): the client found the soft-close wall
          (OutroD) too long — a 200svh sticky track — and too black, since the
          ink wall was the first thing on screen. Three timed, photograph-first
          replacements are being shown one at a time; OutroE is the first.
          OutroD, the earlier A–C and the WebGL OutroReal are kept for
          reference. */}
      <OutroE />
      <Footer />
    </>
  );
}
