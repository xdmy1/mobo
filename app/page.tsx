import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import About from "@/components/sections/About";
import LeadForm from "@/components/sections/LeadForm";
import OutroD from "@/components/sections/OutroD";
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

          The WebGL version was built and worked, but three.js is an ~875KB
          floor for a footer flourish on a lead-generation page, and it cost a
          15s cold start in dev plus visible jank on an M3. This is pure CSS and
          SVG: zero extra JavaScript, instant, and it keeps the one idea that is
          genuinely MOBO's — a wall of cabinet fronts parting on a soft-close
          curve, which is the product feature customers remember from a
          showroom. components/sections/OutroReal.tsx is kept for reference. */}
      <OutroD />
      <Footer />
    </>
  );
}
