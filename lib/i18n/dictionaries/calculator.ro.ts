/**
 * Calculatorul: etichete de pas, opțiuni, rezumat, erori.
 *
 * Perechea: calculator.ru.ts — aceleași chei, obligatoriu.
 *
 * Atenție: textele de aici sunt ce VEDE vizitatorul. Rândurile care pleacă în
 * CRM (`summarize()` din lib/calculator.ts) rămân românești indiferent de
 * limba paginii — echipa MOBO citește CRM-ul în română.
 */

export const calcRo = {
  /* -------------------------------------------------------------- cadrul -- */
  "calc.aria.section": "Calculator de preț",
  "calc.progress": "Pasul {current} din {total}",

  /* --------------------------------------------------------------- pașii -- */
  "calc.step.mod.title": "Alege nivelul",
  "calc.step.tip.title": "Ce mobilăm?",
  "calc.step.forma.title": "Forma bucătăriei",
  "calc.step.dims.title": "Dimensiunile spațiului",
  "calc.step.corp.title": "Corpul mobilierului",
  "calc.step.fatada.title": "Fațada",
  "calc.step.sertare.title": "Sertare",
  "calc.step.mecanisme.title": "Mecanisme",
  "calc.step.organizatoare.title": "Organizatoare",
  "calc.step.blat.title": "Suprafața de lucru",
  "calc.step.rezultat.title": "Estimarea ta",

  "calc.step.mod.hint":
    "Nivelul stabilește gama de materiale și feronerie din care pornim. Fotografiile sunt din proiectele noastre.",
  "calc.step.tip.hint":
    "Fiecare card e un proiect MOBO real — apasă pe cel care seamănă cu planul tău.",
  "calc.step.forma.hint":
    "Fiecare schiță e planul camerei văzut de sus: banda verde e mobilierul, cu chiuveta și plita marcate pe traseu.",
  "calc.step.dims.hint":
    "Lungimea desfășurată a mobilierului, în metri. Înălțimea implicită e tavanul standard de 2,6 m.",
  "calc.step.corp.hint": "Placa din care sunt construite corpurile — scheletul mobilierului.",
  "calc.step.fatada.hint":
    "Fața mobilierului — materialul pe care îl vezi și îl atingi zilnic. Toate cadrele sunt din casele clienților noștri.",
  "calc.step.sertare.hint":
    "Adaugă numărul aproximativ de sertare. Poți lăsa zero — le stabilim la proiectare.",
  "calc.step.mecanisme.hint": "Sisteme de ridicare, glisare și colț. Opționale.",
  "calc.step.organizatoare.hint": "Accesorii interioare pentru haine și încălțăminte. Opționale.",
  "calc.step.blat.hint":
    "Doar dacă vrei blat în calcul — alege materialul și introdu suprafața aproximativă.",

  /* --------------------------------------------------------------- nivel -- */
  "calc.mode.standart": "Standart",
  "calc.mode.standart.blurb":
    "Materiale verificate și feronerie de bază — cel mai accesibil punct de pornire.",
  "calc.mode.premium": "Premium",
  "calc.mode.premium.blurb":
    "Plăci și mecanisme din gamele înalte, finisaje speciale, execuție de vitrină.",

  /* ----------------------------------------------------------------- tip -- */
  "calc.type.bucatarie": "Bucătărie",
  "calc.type.bucatarie.blurb": "Corpuri jos și sus, pe forma spațiului tău.",
  "calc.type.bucatarie.lower": "bucătărie",
  "calc.type.garderoba": "Garderobă",
  "calc.type.garderoba.blurb": "Cameră de haine organizată la centimetru, cu uși sau deschisă.",
  "calc.type.garderoba.lower": "garderobă",
  "calc.type.dulap": "Dulap",
  "calc.type.dulap.blurb": "Dulap închis, până în tavan, cu uși batante sau glisante.",
  "calc.type.dulap.lower": "dulap",
  "calc.type.pieseMici": "Piese mici",
  "calc.type.pieseMici.blurb": "Comodă, noptiere, masă de machiaj, corpuri singulare.",
  "calc.type.pieseMici.lower": "piese mici",

  /* --------------------------------------------------------------- formă -- */
  "calc.shape.dreapta": "În linie dreaptă",
  "calc.shape.colt": "Pe colț",
  "calc.shape.u": "În formă de U",
  "calc.shape.bar": "Cu masă de bar",
  "calc.shape.insula": "Cu insulă",

  /* ---------------------------------------------------------------- corp -- */
  "calc.corp.egger_alb": "Egger — placă albă standard",
  "calc.corp.egger_alb.blurb": "Plăci austriece Egger, interior alb clasic.",
  "calc.corp.egger_color": "Egger — placă în culoare premium",
  "calc.corp.egger_color.blurb": "Aceleași plăci Egger, în decorurile colorate din gama premium.",

  /* -------------------------------------------------------------- fațadă -- */
  "calc.front.pal": "PAL",
  "calc.front.pal.blurb": "Fronturi din plăci decorate — soluția accesibilă.",
  "calc.front.agt_1": "AGT — fronturi drepte",
  "calc.front.agt_1.blurb": "Panouri MDF cu suprafață netedă, plăcate pe o parte.",
  "calc.front.agt_2": "AGT — plăcat pe ambele părți",
  "calc.front.agt_2.blurb": "Aceleași panouri MDF netede, plăcate față-verso.",
  "calc.front.mdf_1": "MDF vopsit",
  "calc.front.mdf_1.blurb": "Vopsit în orice culoare, față netedă.",
  "calc.front.mdf_2": "MDF vopsit cu freză",
  "calc.front.mdf_2.blurb": "Vopsit, cu frezări și orice formă la comandă.",
  "calc.front.front_sticla": "Sticlă",
  "calc.front.front_sticla.blurb": "Fronturi cu sticlă fumurie, în ramă de aluminiu.",
  "calc.front.front_oglinda": "Oglindă",
  "calc.front.front_oglinda.blurb": "Uși cu oglindă în ramă de aluminiu.",
  "calc.front.furnir": "Furnir",
  "calc.front.furnir.blurb": "Lemn adevărat, placat pe fiecare front.",
  "calc.front.furnir_riflat": "Furnir frezat",
  "calc.front.furnir_riflat.blurb": "Lemn adevărat, placat sub orice formă.",

  /* ------------------------------------------------------------- sertare -- */
  "calc.drawer.blum_lemn": "Blum — laterale din lemn",
  "calc.drawer.blum_metal": "Blum — laterale metalice",
  "calc.drawer.hettich_lemn": "Hettich — laterale din lemn",
  "calc.drawer.hettich_metal": "Hettich — laterale metalice",

  /* ----------------------------------------------------------- mecanisme -- */
  "calc.mech.blum_aventos_hk_xs": "Blum Aventos HK-XS",
  "calc.mech.blum_aventos_hk_xs.blurb": "Ridicare pentru fronturi mici.",
  "calc.mech.blum_piston_gaz": "Blum Aventos HF",
  "calc.mech.blum_piston_gaz.blurb": "Front pliant pentru corpurile de sus.",
  "calc.mech.hettich": "Glisare Hettich",
  "calc.mech.hettich.blurb": "TopLine / WingLine pentru uși glisante.",
  "calc.mech.kesslohmer": "Colț Kessebohmer",
  "calc.mech.kesslohmer.blurb": "Sisteme extractibile pentru corpul de colț.",

  /* ------------------------------------------------------- organizatoare -- */
  "calc.organizer.incaltaminte_8": "Suport încălțăminte",
  "calc.organizer.incaltaminte_8.blurb": "8 rafturi extractibile.",
  "calc.organizer.incaltaminte_12": "Suport încălțăminte",
  "calc.organizer.incaltaminte_12.blurb": "12 rafturi extractibile.",
  "calc.organizer.pantaloni_600": "Suport pantaloni",
  "calc.organizer.pantaloni_600.blurb": "Lățime 600 mm.",
  "calc.organizer.pantaloni_800": "Suport pantaloni",
  "calc.organizer.pantaloni_800.blurb": "Lățime 800 mm.",
  "calc.organizer.pantaloni_900": "Suport pantaloni",
  "calc.organizer.pantaloni_900.blurb": "Lățime 900 mm.",
  "calc.organizer.pantograf": "Pantograf",
  "calc.organizer.pantograf.blurb": "Bara de haine coboară la tine.",

  /* ---------------------------------------------------------------- blat -- */
  "calc.top.pal_egger": "PAL Egger",
  "calc.top.pal_egger.blurb": "Blat stratificat, decoruri Egger.",
  "calc.top.hpl_negru": "HPL compact negru",
  "calc.top.hpl_negru.blurb": "Miez negru, muchie fină — 12 mm.",
  "calc.top.hpl_alb": "HPL compact alb",
  "calc.top.hpl_alb.blurb": "Miez alb, aspect de piatră — 12 mm.",

  /* --------------------------------------------------------- dimensiuni -- */
  "calc.dims.length.label": "Lungime, metri",
  "calc.dims.length.placeholder": "ex. 5",
  "calc.dims.height.label": "Înălțime, metri",
  "calc.dims.depth.legend": "Adâncimea corpurilor",
  "calc.dims.depth.600": "600 mm",
  "calc.dims.depth.900": "900 mm — corpuri adânci",
  "calc.dims.error.length": "Introdu lungimea în metri — între 0,5 și 30.",
  "calc.dims.error.height": "Înălțimea trebuie să fie între 1 și 3,5 metri.",

  /* ------------------------------------------------------- pasul „blat" -- */
  "calc.blat.area.label": "Suprafață blat, m² (opțional)",
  "calc.blat.area.placeholder": "ex. 3,5",

  /* ------------------------------------------------------------ numărare -- */
  "calc.counter.decrease": "Scade {item}",
  "calc.counter.increase": "Adaugă {item}",

  /* ------------------------------------------------------------ rezultat -- */
  "calc.result.banner": "Fotografie dintr-un proiect MOBO — {type} la comandă.",
  "calc.result.eyebrow": "Estimare orientativă",
  "calc.result.mdl": "≈ {value} MDL",
  "calc.result.note":
    "Estimarea e orientativă — depinde de configurația exactă, decoruri și accesorii. Prețul final îl primești după măsurători, împreună cu proiectul, fără nicio obligație din partea ta.",

  /* ---------------------------------------------------------------- lead -- */
  "calc.lead.title": "Vrei calculul exact? Ți-l face un consultant.",
  "calc.lead.name.label": "Nume",
  "calc.lead.name.placeholder": "Numele tău",
  "calc.lead.phone.label": "Telefon",
  "calc.lead.consent": "Sunt de acord cu prelucrarea datelor personale conform {link}.",
  "calc.lead.consent.link": "Politicii de confidențialitate",
  "calc.lead.error.fields": "Completează numele, telefonul și bifează acordul.",
  "calc.lead.error.send": "Nu am putut trimite cererea. Sună-ne direct la {phone}.",
  "calc.lead.submit": "Trimite configurația",
  "calc.lead.submitting": "Se trimite…",
  "calc.lead.restart": "Reia de la zero",
  "calc.lead.success.title": "Am primit configurația ta.",
  "calc.lead.success.body":
    "Te contactăm la {phone} în aceeași zi lucrătoare, cu un calcul verificat de un consultant.",
  "calc.lead.success.again": "Calculează altă configurație",

  /* ------------------------------------------------------------- panoul -- */
  "calc.aside.title": "Configurația ta",
  "calc.aside.empty": "Alegerile tale se adună aici, pas cu pas — ca un bon de configurare.",
  "calc.aside.estimate": "Estimare orientativă",
  "calc.aside.mdl": "≈ {value} MDL · prețul final, după măsurători",
  "calc.aside.pending": "Apare după ce introduci dimensiunile.",

  /* ---------------------------------------------------------------- bara -- */
  "calc.bar.current": "Estimare curentă:",
  "calc.bar.back": "Înapoi",
  "calc.bar.next": "Continuă",

  /* ------------------------------------------------ etichetele rândurilor -- */
  "calc.row.mode": "Mod",
  "calc.row.type": "Tip",
  "calc.row.shape": "Formă",
  "calc.row.dims": "Dimensiuni",
  "calc.row.corp": "Corp",
  "calc.row.front": "Fațadă",
  "calc.row.drawers": "Sertare",
  "calc.row.mechanisms": "Mecanisme",
  "calc.row.organizers": "Organizatoare",
  "calc.row.countertop": "Blat",

  /* ---------------------------------------------------- valorile rândurilor */
  "calc.value.count": "{n} buc",
  "calc.value.dims": "{length} × {height} m",
  "calc.value.dims.depth": "{length} × {height} m, {depth} mm",
  "calc.value.dims.full": "{length} m lungime × {height} m înălțime",
  "calc.value.dims.full.depth": "{length} m lungime × {height} m înălțime, adâncime {depth} mm",
  "calc.value.qty": "{label} ×{n}",
  "calc.value.qty.detail": "{label} ({detail}) ×{n}",
  "calc.value.countertop": "{label}, {area} m²",
} as const;

export type CalcDict = Record<keyof typeof calcRo, string>;
