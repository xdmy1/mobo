import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import TimelineTrack from "@/components/sections/TimelineTrack";
import { HISTORY } from "@/lib/data";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

/**
 * „Drumul nostru" — cronologia de pe /despre-noi: istoria reală MOBO, un reper
 * pe an, din 2022 până azi (vezi HISTORY în lib/data.ts).
 *
 * Continuă banda întunecată a PageHeader-ului, ca istoria să se citească drept
 * a doua jumătate a introducerii, nu ca o secțiune separată. Un singur fir
 * vertical leagă reperele; fiecare an e un numeral mare de display — pe
 * desktop anii atârnă la stânga firului, conținutul curge la dreapta lui.
 *
 * Firul se umple pe măsură ce derulezi (TimelineTrack): anii pe lângă care a
 * trecut se aprind din gri în fildeș, iar ultimul — singurul accentuat — în
 * lime, pentru că el e concluzia drumului. Anii cu mai multe realizări le
 * arată ca o grilă de puncte sub text, nu ca o frază lungă cu „+".
 *
 * Geometria pe desktop: coloana anilor are 11rem, golful dintre coloane 3rem,
 * deci firul stă la 12.5rem (mijlocul golfului) și punctele la 12.5rem − 5px.
 * Cele trei valori arbitrare de mai jos derivă una din alta — se schimbă
 * împreună (și în TimelineTrack).
 */

/** Mărimea anului. Punctul de pe fir o moștenește, ca să se centreze pe cifre în `em`. */
const YEAR_SIZE = "text-[clamp(2.2rem,4vw,3.6rem)]";

function key(year: string, part: string): TranslationKey {
  return `history.${year}.${part}` as TranslationKey;
}

export default async function Timeline() {
  const { t } = await getI18n();
  const last = HISTORY.length - 1;

  return (
    <section aria-labelledby="istorie-titlu" className="grain relative bg-ink-900">
      <div className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <Reveal>
          <p className="text-eyebrow text-fg-dim">{t("sections.timeline.eyebrow")}</p>
          <h2 id="istorie-titlu" className="text-h2 text-balance mt-5 max-w-[24ch] text-fg">
            {t("sections.timeline.title")}
          </h2>
        </Reveal>

        <TimelineTrack className="mt-12 lg:mt-16">
          <ol className="list-none space-y-14 lg:space-y-20">
            {HISTORY.map((m, i) => {
              const isLast = i === last;
              const cells = m.points + (m.stat ? 1 : 0);

              return (
                <Reveal as="li" key={m.year}>
                  <div
                    data-milestone=""
                    className="group relative pl-8 lg:grid lg:grid-cols-[11rem_1fr] lg:gap-x-12 lg:pl-0"
                  >
                    {/* Punctul de pe fir, centrat pe cifrele anului (aceeași
                        mărime de font → 0.475em = jumătatea rândului de 0.95). */}
                    <span
                      data-dot=""
                      aria-hidden="true"
                      className={cn(
                        YEAR_SIZE,
                        "absolute left-0 top-[calc(0.475em-5.5px)] size-[11px] rounded-full border",
                        "transition-[background-color,border-color,box-shadow] duration-500 lg:left-[calc(12.5rem-5px)]",
                        isLast
                          ? "border-lime-brand/60 bg-ink-900 group-data-[reached]:border-lime-brand group-data-[reached]:bg-lime-brand group-data-[reached]:shadow-[0_0_18px_0_rgba(204,223,16,0.45)]"
                          : "border-white/30 bg-ink-900 group-data-[reached]:border-fg group-data-[reached]:bg-fg",
                      )}
                    >
                      {/* Anul curent „respiră": un inel care pornește din punct
                          și se stinge. Sub reduced-motion animația e anulată
                          global, iar inelul rămâne invizibil. */}
                      {isLast ? (
                        <span className="absolute inset-[-1px] rounded-full bg-lime-brand opacity-0 group-data-[reached]:animate-[timeline-pulse_2.8s_cubic-bezier(0.23,1,0.32,1)_infinite]" />
                      ) : null}
                    </span>

                    <p
                      className={cn(
                        YEAR_SIZE,
                        "font-medium leading-[0.95] tracking-[-0.03em] tabular-nums text-fg-faint transition-colors duration-700 lg:text-right",
                        isLast ? "group-data-[reached]:text-lime-brand" : "group-data-[reached]:text-fg",
                      )}
                    >
                      {m.year}
                    </p>

                    <div className="mt-3 lg:mt-[0.4em]">
                      <h3 className="text-h3 text-fg">{t(key(m.year, "title"))}</h3>
                      <p className="text-pretty mt-2 max-w-[58ch] text-[0.9375rem] leading-[1.7] text-fg-dim">
                        {t(key(m.year, "text"))}
                      </p>

                      {cells > 0 ? (
                        <ul
                          className={cn(
                            "mt-7 grid list-none gap-x-8 sm:grid-cols-2",
                            cells >= 3 && "lg:grid-cols-3",
                            "max-w-[60rem]",
                          )}
                        >
                          {m.stat ? (
                            <li className="flex flex-col justify-between gap-2 border-t border-white/12 py-4">
                              <Counter
                                value={m.stat.value}
                                suffix={m.stat.suffix}
                                className="text-[clamp(1.9rem,3vw,2.5rem)] font-medium leading-none tracking-[-0.03em] tabular-nums text-fg"
                              />
                              <span className="text-[0.875rem] leading-[1.5] text-fg-dim">{t(key(m.year, "stat"))}</span>
                            </li>
                          ) : null}
                          {Array.from({ length: m.points }, (_, p) => (
                            <li key={p} className="border-t border-white/12 py-4 text-[0.9375rem] leading-[1.55] text-fg">
                              {t(key(m.year, `point.${p}`))}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </TimelineTrack>
      </div>
      {/* Aceeași linie de bază ca a PageHeader-ului — banda se închide la fel
          cum s-a deschis. */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
    </section>
  );
}
