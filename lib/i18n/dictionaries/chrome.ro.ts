/**
 * Nav, formularul de lead, consimțământul de cookie-uri, galeria, contactele rapide.
 *
 * Perechea: chrome.ru.ts — aceleași chei, obligatoriu.
 *
 * Cheile `chrome.form.error.*` sunt speciale: ele NU sunt scrise în componente,
 * ci în `leadSchema` (lib/crm/types.ts), ca mesaje ale regulilor Zod. Serverul
 * validează fără context React, deci nu poate traduce — trimite cheia înapoi în
 * `fieldErrors`, iar LeadForm o trece prin `t()` înainte de afișare. De aceea
 * textul unei asemenea chei trebuie să rămână o propoziție gata de citit.
 */

export const chromeRo = {
  "chrome.cookies.accept": "De acord",
  "chrome.cookies.body":
    "Folosim cookie-uri și tehnologii similare ca site-ul să funcționeze, iar cu acordul tău — ca să înțelegem cum e folosit și să ne promovăm mai eficient. Detalii în",
  "chrome.cookies.customize": "Personalizează",
  "chrome.cookies.hideOptions": "Ascunde opțiunile",
  "chrome.cookies.marketing": "Marketing",
  "chrome.cookies.marketingHint":
    "Ne ajută să-ți arătăm oferte relevante, nu reclame la nimereală.",
  "chrome.cookies.necessary": "Strict necesare",
  "chrome.cookies.necessaryHint": "Funcționarea și securitatea site-ului. Mereu active.",
  "chrome.cookies.necessaryOnly": "Doar necesare",
  "chrome.cookies.policyLink": "Politica de confidențialitate",
  "chrome.cookies.save": "Salvează alegerea",
  "chrome.cookies.statistics": "Statistică",
  "chrome.cookies.statisticsHint":
    "Ne arată anonim cum e folosit site-ul, ca să-l îmbunătățim.",
  "chrome.cookies.title": "Respectăm datele tale.",

  "chrome.form.checkFields": "Verifică câmpurile marcate mai jos.",
  "chrome.form.consentAfter": "Datele nu sunt transmise terților.",
  "chrome.form.consentBefore":
    "Sunt de acord cu prelucrarea datelor personale pentru a fi contactat în legătură cu această solicitare, conform",
  "chrome.form.consentLink": "Politicii de confidențialitate",
  "chrome.form.email": "Email",
  "chrome.form.error.consentRequired": "Este necesar acordul pentru a trimite cererea.",
  "chrome.form.error.emailInvalid": "Adresa de email nu pare validă.",
  "chrome.form.error.messageLong": "Mesajul este prea lung.",
  "chrome.form.error.nameLong": "Numele este prea lung.",
  "chrome.form.error.nameShort": "Numele trebuie să aibă cel puțin 2 caractere.",
  "chrome.form.error.phoneInvalid": "Introdu un număr de telefon valid.",
  "chrome.form.error.phoneLong": "Numărul de telefon este prea lung.",
  "chrome.form.fixFields": "Câteva câmpuri trebuie corectate.",
  "chrome.form.honeypot": "Lasă acest câmp gol",
  "chrome.form.lede":
    "Trei câmpuri, jumătate de minut. Un consultant MOBO te sună în aceeași zi lucrătoare, ca să discutați proiectul și să programați măsurătorile.",
  "chrome.form.meanwhileCalculator": "Între timp, calculator online",
  "chrome.form.name": "Nume",
  "chrome.form.namePlaceholder": "Numele tău",
  "chrome.form.networkError":
    "Conexiunea a eșuat. Verifică internetul și încearcă din nou, sau sună-ne la {phone}.",
  "chrome.form.orCall": "Sau sună direct:",
  "chrome.form.phone": "Telefon",
  "chrome.form.roomLegend": "Ce mobilăm?",
  "chrome.form.sendFailed": "Nu am putut trimite cererea. Sună-ne direct la {phone}.",
  "chrome.form.showroom": "Showroom",
  "chrome.form.submit": "Trimite cererea",
  "chrome.form.submitting": "Se trimite…",
  "chrome.form.successLive": "Am primit cererea ta. Te contactăm în aceeași zi lucrătoare.",
  "chrome.form.successTail":
    "în aceeași zi lucrătoare, ca să stabilim consultația și măsurătorile.",
  "chrome.form.successTitle": "Am primit cererea ta.",
  "chrome.form.successToPhone": "Te contactăm la",
  "chrome.form.title":
    "Spune-ne ce vrei să mobilezi și primești un calcul estimativ, fără obligații.",
  "chrome.form.tooMany": "Ai trimis prea multe cereri. Încearcă din nou peste câteva minute.",
  "chrome.form.writeUs": "Scrie-ne pe",

  "chrome.gallery.alt": "{title} — fotografia {n} din {total}",
  "chrome.gallery.altSpace": "{title} — {space}, fotografia {n} din {total}",
  "chrome.gallery.figure": "Galerie foto — {title}",
  "chrome.gallery.next": "Fotografia următoare",
  "chrome.gallery.prev": "Fotografia precedentă",
  "chrome.gallery.spaces": "Spațiile casei, în ordinea galeriei",
  "chrome.gallery.track":
    "Fotografiile proiectului {title}, spațiu după spațiu. Folosește săgețile pentru a naviga.",

  "chrome.nav.call": "Sună la {phone}",
  "chrome.nav.closeMenu": "Închide meniul",
  "chrome.nav.cta": "Solicit Calcul",
  "chrome.nav.home": "MOBO Kitchens & Home — pagina principală",
  "chrome.nav.language": "Limbă",
  "chrome.nav.menu": "Meniu",
  "chrome.nav.mobile": "Navigare mobilă",
  "chrome.nav.openMenu": "Deschide meniul",
  "chrome.nav.primary": "Navigare principală",

  "chrome.quick.call": "Sună-ne",
  "chrome.quick.close": "Închide contactele rapide",
  "chrome.quick.open": "Deschide contactele rapide",
  "chrome.quick.title": "Contactează-ne rapid",
} as const;

export type ChromeDict = Record<keyof typeof chromeRo, string>;
