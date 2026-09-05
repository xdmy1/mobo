import { Reveal } from "@/components/ui/Reveal";
import { HISTORY } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * „Drumul nostru" — cronologia de pe /despre-noi, după referința parke.md.
 *
 * Continuă banda întunecată a PageHeader-ului, ca istoria să se citească drept
 * a doua jumătate a introducerii, nu ca o secțiune separată. Un singur fir
 * vertical leagă reperele; fiecare an e un numeral mare de display — pe
 * desktop anii atârnă la stânga firului, conținutul curge la dreapta lui.
 *
 * Ultimul reper („Azi") e singurul accentuat: punct și an în lime, pentru că
 * el e concluzia comercială a drumului — restul anilor rămân în tonuri de fg,
 * altfel cronologia ar licări ca o ghirlandă.
 *
 * Geometria pe desktop: coloana anilor are 11rem, golful dintre coloane 3rem,
 * deci firul stă la 12.5rem (mijlocul golfului) și punctele la 12.5rem − 5px.
 * Cele trei valori arbitrare de mai jos derivă una din alta — se schimbă
 * împreună.
 */
export default function Timeline() {
  const last = HISTORY.length - 1;

  return (
    <section aria-labelledby="istorie-titlu" className="grain relative bg-ink-900">
      <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <Reveal>
          <p className="text-eyebrow text-fg-dim">Drumul nostru</p>
          <h2 id="istorie-titlu" className="text-h2 text-balance mt-5 max-w-[24ch] text-fg">
            Din 2005 până azi, același meșteșug — doar casele s-au înmulțit.
          </h2>
        </Reveal>

        <div className="relative mt-12 lg:mt-16">
          {/* Firul cronologiei. Se stinge printr-un gradient pe ultima treime,
              ca drumul să se termine în „Azi", nu să curgă în gol. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-1 left-[5px] w-px bg-gradient-to-b from-white/15 via-white/15 via-[65%] to-transparent lg:left-[12.5rem]"
          />

          <ol className="list-none space-y-12 lg:space-y-16">
            {HISTORY.map((milestone, i) => (
              <Reveal
                as="li"
                key={milestone.year}
                index={i}
                className="relative pl-8 lg:grid lg:grid-cols-[11rem_1fr] lg:gap-x-12 lg:pl-0"
              >
                {/* Punctul de pe fir — pe prima linie a reperului. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-0 top-[0.35em] size-[11px] rounded-full border",
                    "lg:left-[calc(12.5rem-5px)]",
                    i === last
                      ? "border-lime-brand bg-lime-brand shadow-[0_0_18px_0_rgba(204,223,16,0.45)]"
                      : "border-white/30 bg-ink-900",
                  )}
                />

                <p
                  className={cn(
                    "text-[clamp(2.2rem,4vw,3.6rem)] font-medium leading-[0.95] tracking-[-0.03em] lg:text-right",
                    i === last ? "text-lime-brand" : "text-fg",
                  )}
                >
                  {milestone.year}
                </p>

                <div className="mt-3 lg:mt-[0.4em]">
                  <h3 className="text-h3 text-fg">{milestone.title}</h3>
                  <p className="text-pretty mt-2 max-w-[54ch] text-[0.9375rem] leading-[1.7] text-fg-dim">
                    {milestone.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
      {/* Aceeași linie de bază ca a PageHeader-ului — banda se închide la fel
          cum s-a deschis. */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
    </section>
  );
}
