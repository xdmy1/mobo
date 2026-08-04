import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Categories from "@/components/sections/Categories";
import Projects from "@/components/sections/Projects";
import Process from "@/components/sections/Process";
import WhyMobo from "@/components/sections/WhyMobo";
import Testimonials from "@/components/sections/Testimonials";
import About from "@/components/sections/About";
import LeadForm from "@/components/sections/LeadForm";
import OutroReal from "@/components/sections/OutroReal";
import Footer from "@/components/sections/Footer";

/**
 * Homepage.
 *
 * Band rhythm is deliberate. navarro.ro runs near-black end to end; the brief
 * was "not too black", so dark and warm-ivory bands alternate:
 *
 *   Hero          dark    ink-900
 *   Categories    dark    ink-850
 *   Projects      LIGHT   bone-50     <- the page opens up
 *   Process       LIGHT   bone-100
 *   WhyMobo       dark    ink-900
 *   Testimonials  dark    ink-850
 *   About         LIGHT   bone-50
 *   LeadForm      dark    ink-900     <- the CTA lands on dark, so lime carries
 *   Footer        dark    ink-950
 *
 * The two light bands sit where the content is most photographic and most
 * information-dense, which is also where a long dark stretch would start to
 * feel oppressive.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Categories />
        <Projects />
        <Process />
        <WhyMobo />
        <Testimonials />
        <About />
        <LeadForm />
      </main>
      {/* The brand moment sits between the last content section and the
          practical footer: the film ends, then the credits roll.

          OutroReal replaces the earlier SVG-mask version. Filling letterforms
          with a photograph is a graphic-design trick — flat, no space, no light.
          Here the wordmark is real extruded geometry standing in the kitchen,
          lit by that room as an environment map, with contact shadows. The
          3D bundle is dynamically imported and never blocks first paint. */}
      <OutroReal />
      <Footer />
    </>
  );
}
