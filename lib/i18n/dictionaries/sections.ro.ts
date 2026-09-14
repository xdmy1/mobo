/**
 * Textul din components/sections/* — titluri de secțiune, alt-uri, CTA-uri.
 *
 * Perechea: sections.ru.ts — aceleași chei, obligatoriu.
 *
 * Aici stă DOAR textul scris în componente. Copy-ul editorial (hero, despre,
 * etapele procesului, recenziile, categoriile, istoria) trăiește în
 * content.ro.ts și se citește de acolo — nu se duplică niciodată aici.
 */

export const sectRo = {
  "sections.about.imageAlt":
    "Proiect 3D al unei bucătării la comandă deschise spre zona de dining, realizat de MOBO Kitchens & Home",
  "sections.about.renderNote": "Randare 3D — proiectul, înainte de execuție",

  "sections.categories.cardCta": "— solicită o ofertă",
  "sections.categories.eyebrow": "Ce producem",
  "sections.categories.imageAlt":
    "{label} — mobilier la comandă realizat de MOBO Kitchens & Home",
  "sections.categories.imageAltGeneric":
    "Mobilier la comandă realizat de MOBO Kitchens & Home",
  "sections.categories.title": "Mobilier la comandă pentru fiecare încăpere a casei.",

  "sections.footer.clientInfo": "Info Clienți",
  "sections.footer.contact": "Contact",
  "sections.footer.info": "Informații",
  "sections.footer.offers": "Oferte",
  "sections.footer.projects": "Proiecte",
  "sections.footer.social": "Social",
  "sections.footer.title": "Contacte și navigare MOBO Kitchens & Home",

  "sections.hero.subline": "Realizăm mobilier de orice tip, creat pentru casa ta.",

  "sections.legal.reviewNote":
    "Document cu caracter informativ; versiunea finală urmează să fie validată de un consilier juridic.",
  "sections.legal.updated": "Ultima actualizare: {date}.",

  "sections.process.chapter.1.blurb":
    "Patru întâlniri în care planul prinde contur — nimic nu pleacă spre atelier până nu-l aprobi.",
  "sections.process.chapter.1.imageAlt":
    "Antreu cu pereți frezați, consolă suspendată și oglindă, dintr-un proiect MOBO",
  "sections.process.chapter.1.title": "Proiectăm împreună",
  "sections.process.chapter.2.blurb":
    "Contractul fixează totul, apoi mobilierul se fabrică sub controlul nostru, nu al furnizorilor.",
  "sections.process.chapter.2.imageAlt":
    "Fronturi frezate vopsite alb și corp din lemn, detaliu dintr-un proiect MOBO",
  "sections.process.chapter.2.title": "Construim în atelier",
  "sections.process.chapter.3.blurb":
    "Livrare, montaj cu reglaj fin și predare doar după verificarea împreună — apoi 5 ani de liniște.",
  "sections.process.chapter.3.imageAlt":
    "Bucătărie albă cu insulă neagră, montată într-o casă din Chișinău",
  "sections.process.chapter.3.title": "Montăm și garantăm",
  "sections.process.credit": "Din proiectul „{project}”.",
  "sections.process.eyebrow": "Cum lucrăm",
  "sections.process.lead":
    "Fiecare proiect trece prin același traseu, fără improvizații. Știi tot timpul la ce etapă ești — iar la capăt rămâne garanția de 5 ani.",
  "sections.process.title.accent": "de la prima discuție",
  "sections.process.title.lead": "Nouă etape clare,",
  "sections.process.title.tail": "până la montajul final.",

  "sections.projects.ariaLabel": "Proiecte realizate",
  "sections.projects.coverAlt": "{title} — {blurb}",
  "sections.projects.lead":
    "Fiecare proiect e o adresă reală din Chișinău: tot mobilierul unei locuințe, măsurat, fabricat și montat de aceeași echipă.",
  "sections.projects.photoCount": "{count} foto",
  "sections.projects.title": "Proiecte realizate, casă cu casă.",
  "sections.projects.viewAll": "Vezi toate proiectele",

  "sections.reviews.eyebrow": "Ce spun clienții",
  "sections.reviews.googleCount": "{count} recenzii reale pe Google",
  "sections.reviews.photoAlt": "Fotografie atașată recenziei de {name}",
  "sections.reviews.stars": "Evaluare 5 din 5 stele",
  "sections.reviews.title": "Cel mai bun argument sunt clienții noștri.",

  "sections.timeline.eyebrow": "Drumul nostru",
  "sections.timeline.title":
    "Din 2005 până azi, același meșteșug — doar casele s-au înmulțit.",

  "sections.why.eyebrow": "De ce MOBO",
  "sections.why.lead":
    "De la primul proiect 3D până la verificarea finală făcută împreună cu tine, fiecare etapă are un termen clar și un contract transparent în spate.",
  "sections.why.materials": "Trei categorii de materiale",
  "sections.why.title": "Fiecare detaliu este gândit, nu improvizat.",
} as const;

export type SectDict = Record<keyof typeof sectRo, string>;
