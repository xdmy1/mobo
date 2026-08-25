import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Corpul comun al paginilor legale (termeni, confidențialitate, GDPR) și al
 * altor pagini de text lung: o coloană îngustă pe banda ivorie, cu stilurile
 * de titlu/paragraf/listă aplicate prin selectori — conținutul paginilor
 * rămâne HTML semantic simplu, fără clase pe fiecare element.
 *
 * Nota din subsol este cerută de proiect: textele au fost redactate ca punct
 * de pornire și vor fi validate de un consilier juridic înainte de varianta
 * finală — pagina o spune discret, în loc să pretindă altceva.
 */

const PROSE = cn(
  "[&_h2]:text-h3 [&_h2]:mt-10 [&_h2]:text-fg-invert first:[&_h2]:mt-0",
  "[&_p]:mt-3 [&_p]:text-[0.9375rem] [&_p]:leading-[1.75] [&_p]:text-fg-invert-dim [&_p]:text-pretty",
  "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
  "[&_li]:text-[0.9375rem] [&_li]:leading-[1.7] [&_li]:text-fg-invert-dim",
  "[&_strong]:font-medium [&_strong]:text-fg-invert",
  "[&_a]:font-medium [&_a]:text-fg-invert [&_a]:underline [&_a]:decoration-ink-850/30 [&_a]:underline-offset-4",
);

export default function LegalArticle({
  updated,
  reviewNote = true,
  children,
}: {
  /** Data ultimei actualizări, deja formatată („25 august 2026"). */
  updated: string;
  /** Ascunde nota de validare juridică unde nu are sens (ex. Info clienți). */
  reviewNote?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="relative bg-bone-50 text-fg-invert">
      <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-16 lg:py-20">
        <article className={PROSE}>{children}</article>
        <footer className="mt-12 border-t border-ink-850/15 pt-5 text-[0.8125rem] leading-relaxed text-fg-invert-dim">
          <p>Ultima actualizare: {updated}.</p>
          {reviewNote ? (
            <p className="mt-1">
              Document cu caracter informativ; versiunea finală urmează să fie validată de un
              consilier juridic.
            </p>
          ) : null}
        </footer>
      </div>
    </section>
  );
}
