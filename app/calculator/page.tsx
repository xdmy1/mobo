import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import PageHeader from "@/components/sections/PageHeader";
import Calculator from "@/components/sections/Calculator";
import Footer from "@/components/sections/Footer";
import { CRM_SETTINGS_URL, SETTINGS_SNAPSHOT, type CalcSettings } from "@/lib/calculator";

export const metadata: Metadata = {
  title: "Calculator de preț",
  description:
    "Calculează orientativ prețul mobilierului tău la comandă: bucătărie, garderobă, dulap sau piese mici. Alegi materialele și dimensiunile, vezi estimarea pe loc — în MDL.",
  alternates: { canonical: "/calculator" },
};

/**
 * Prețurile vin din același CRM (crm.mobo.md) pe care îl folosește și vechiul
 * calculator.mobo.md — Iurii le editează într-un singur loc și ambele rămân
 * sincronizate. Fetch-ul e server-side (fără CORS), cu cache de o oră; dacă
 * CRM-ul nu răspunde, folosim snapshot-ul din lib/calculator.ts, deci pagina
 * nu are cum să rămână fără prețuri.
 */
async function getSettings(): Promise<CalcSettings> {
  try {
    const res = await fetch(CRM_SETTINGS_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return SETTINGS_SNAPSHOT;
    const live = (await res.json()) as CalcSettings;
    /* Snapshot-ul dedesubt: o cheie lipsă din CRM nu lasă un preț pe zero. */
    return { ...SETTINGS_SNAPSHOT, ...live };
  } catch {
    return SETTINGS_SNAPSHOT;
  }
}

export default async function CalculatorPage() {
  const settings = await getSettings();

  return (
    <>
      <Nav />
      <main id="main">
        <PageHeader
          eyebrow="Calculator"
          title="Cât costă mobilierul tău?"
          intro="Alege tipul, dimensiunile și materialele — vezi pe loc o estimare orientativă, cu prețurile noastre reale. Durează un minut, iar calculul exact ți-l face gratuit un consultant, după măsurători."
        />
        <Calculator settings={settings} />
      </main>
      <Footer />
    </>
  );
}
