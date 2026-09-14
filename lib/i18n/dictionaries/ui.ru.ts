import type { UiDict } from "./ui.ro";

/**
 * Paginile, în rusă. Perechea: ui.ro.ts — aceleași chei, obligatoriu.
 *
 * Cheile de plural (`proiect.photos.*`) sunt categoriile CLDR ale limbii ruse:
 * one → 1, 21, 31…; few → 2–4, 22–24…; many → 5–20, 25–30… Româna nu folosește
 * „one"/„many", dar tabelul le are pe toate, ca tipul să rămână identic.
 */

export const uiRu: UiDict = {
  "ui.skipToContent": "Перейти к содержимому",

  /* ------------------------------------------------------------- metadate -- */
  "meta.home.title": "MOBO Kitchens & Home — мебель на заказ в Кишинёве",
  "meta.home.description":
    "Мебель на заказ для всего дома — кухни, гостиные, спальни, гардеробные. 3D-проект, гарантия 5 лет, оплата в 10 платежей. От консультации до монтажа.",
  "meta.home.ogDescription":
    "Мебель на заказ для всего дома. 3D-проект, гарантия 5 лет, оплата в 10 платежей.",
  "meta.home.keywords":
    "кухни на заказ|мебель на заказ Кишинёв|кухни Молдова|мебель для гостиной|гардеробная на заказ|MOBO",

  "meta.bucatarii.title": "Кухни на заказ",
  "meta.bucatarii.description":
    "Кухни на заказ от MOBO в Кишинёве — фотографии из домов клиентов, а не рендеры. Детальный 3D-проект, материалы Egger, AGT и Fundermax, фурнитура Blum и Hettich, гарантия 5 лет.",

  "meta.proiecte.title": "Реализованные проекты",
  "meta.proiecte.description":
    "Проекты MOBO по домам: каждый адрес в Кишинёве со всей мебелью квартиры — замеры на месте, 3D-проект, производство в собственном цеху.",

  "meta.proiect.title": "Проект {title}",
  "meta.proiect.description":
    "{blurb} Мебель на заказ для всей квартиры от MOBO Kitchens & Home в Кишинёве — {count} фотографий готового проекта.",

  "meta.servicii.title": "Услуги",
  "meta.servicii.description":
    "Девять этапов MOBO, от консультации до гарантии: замеры на месте, 3D-проект, производство в собственном цеху, монтаж и гарантия 5 лет. Три категории материалов.",

  "meta.despre.title": "О нас",
  "meta.despre.description":
    "MOBO Kitchens & Home: бренд основан в 2022 году, запущен в 2023-м, команда с 39 годами совокупного опыта в мебели на заказ. Дизайнеры, менеджеры качества и квалифицированные монтажники.",

  "meta.contacte.title": "Контакты",
  "meta.contacte.description":
    "Шоурум MOBO Kitchens & Home: {address}. Телефон {phone}, {email}. Бесплатная консультация по мебели на заказ.",

  "meta.calculator.title": "Калькулятор цены",
  "meta.calculator.description":
    "Рассчитайте ориентировочную стоимость мебели на заказ: кухня, гардеробная, шкаф или небольшие изделия. Выбираете материалы и размеры — оценка сразу, в евро и леях.",

  "meta.info.title": "Информация для клиентов",
  "meta.info.description":
    "Информация для клиентов MOBO: гарантия, оплата в рассрочку, защита прав потребителей и данные компетентного органа Республики Молдова.",

  "meta.termeni.title": "Условия и положения",
  "meta.termeni.description":
    "Условия использования сайта mobo.md и заказа мебели на заказ в MOBO Kitchens & Home.",

  "meta.confidentialitate.title": "Политика конфиденциальности",
  "meta.confidentialitate.description":
    "Как MOBO Kitchens & Home собирает, использует и защищает ваши персональные данные.",

  "meta.gdpr.title": "GDPR",
  "meta.gdpr.description":
    "Ваши права на персональные данные и как их реализовать в MOBO Kitchens & Home.",

  /* -------------------------------------------------------- antet pagină -- */
  "page.bucatarii.eyebrow": "Кухни на заказ",
  "page.bucatarii.title": "Главное место в любом доме.",
  "page.bucatarii.intro":
    "Кухни из наших недавних проектов, снятые в домах клиентов, — не рендеры. Галерея переходит из дома в дом: каждая подпись — адрес в Кишинёве, а каждая кухня спроектирована вокруг того, как вы готовите.",

  "page.proiecte.eyebrow": "Реализованные проекты",
  "page.proiecte.title": "Один адрес — весь дом.",
  "page.proiecte.intro":
    "Мы делим проекты по домам, а не по категориям: каждый адрес ниже — это вся мебель одной квартиры в Кишинёве, с замерами на месте, 3D-проектом и производством в нашем цеху. Фотографии сделаны в домах клиентов, это не рендеры.",

  "page.servicii.eyebrow": "Услуги",
  "page.servicii.title": "Услуги и этапы для мебели, которая вам понравится.",
  "page.servicii.intro":
    "От первого разговора до последней регулировки петли всё происходит в одном месте: консультанты, дизайнеры, цех и монтажники MOBO. Девять этапов и один ответственный.",

  "page.despre.eyebrow": "О нас",

  "page.contacte.eyebrow": "Контакты",
  "page.contacte.title": "Шоурум MOBO Kitchens & Home.",
  "page.contacte.intro":
    "Приходите посмотреть материалы, декоры и механизмы вживую — или напишите нам, и мы всё организуем сами. Консультация бесплатная.",

  "page.calculator.eyebrow": "Калькулятор",
  "page.calculator.title": "Сколько стоит ваша мебель?",
  "page.calculator.intro":
    "Выберите тип, размеры и материалы — и сразу увидите ориентировочную оценку по нашим реальным ценам. Это займёт минуту, а точный расчёт консультант сделает бесплатно, после замеров.",

  "page.info.eyebrow": "Информация для клиентов",
  "page.info.title": "Ваши права, чёрным по белому.",

  "page.legal.eyebrow": "Правовая информация",
  "page.termeni.title": "Условия и положения.",
  "page.termeni.intro":
    "Правила работы сайта mobo.md и коммерческих отношений между вами и MOBO Kitchens & Home — коротко и понятно.",
  "page.confidentialitate.title": "Политика конфиденциальности.",
  "page.confidentialitate.intro":
    "Мы просим только те данные, которые нужны, чтобы связаться с вами по вашему проекту, — и здесь без канцелярита рассказываем, что с ними делаем.",
  "page.gdpr.title": "GDPR — ваши права.",
  "page.gdpr.intro":
    "Данные принадлежат вам; мы используем их только для того, чтобы вам ответить. Вот что вы можете запросить в любой момент и как.",

  "bucatarii.galleryAria": "Галерея кухонь MOBO",
  "bucatarii.galleryTitle": "Кухни на заказ",
  "bucatarii.materials.title": "Те же материалы и механизмы доступны и для вашей кухни.",
  "bucatarii.materials.body":
    "Мы работаем с {partners} — три категории материалов на выбор, фурнитура с доводчиками и гарантия 5 лет на всё, что монтируем. Каждая кухня выше начиналась с 3D-проекта, утверждённого клиентом.",
  "bucatarii.cta": "Хочу такую же кухню",
  "bucatarii.backToProjects": "Посмотреть дома целиком, проект за проектом",

  /* ---------------------------------------------------- erori de la server -- */
  "api.error.rateLimited": "Слишком много запросов. Попробуйте снова через несколько минут.",
  "api.error.tooLarge": "Запрос слишком большой.",
  "api.error.invalid": "Некорректный запрос.",
  "api.error.incomplete": "Не все данные заполнены.",
  "api.error.sendFailed": "Не удалось отправить заявку. Позвоните нам напрямую: {phone}.",

  /* --------------------------------------------------- pagina Despre noi -- */
  "despre.oferim.eyebrow": "Что мы делаем",
  "despre.oferim.title": "Премиальные кухни — и всё остальное в доме.",
  "despre.image.alt": "3D-проект кухни на заказ, выполненный дизайнерами MOBO",
  "despre.image.caption": "3D-проект — так выглядит предложение до производства.",
  "despre.echipa.eyebrow": "Наша команда",
  "despre.echipa.title": "Три профессии, один стандарт приёмки.",
  "despre.mission": "Наша миссия — создавать мебель премиального качества, которая превращает дома в настоящее жильё мечты.",
  "despre.oferte.eyebrow": "Предложения MOBO",
  "despre.oferte.title": "Консультация и ориентировочный расчёт — бесплатно.",
  "despre.oferte.cta": "Запросить расчёт",

  /* ----------------------------------------------------- pagina Servicii -- */
  "servicii.stepsAria": "Этапы проекта",
  "servicii.materials.eyebrow": "Материалы",
  "servicii.materials.title": "Три категории материалов на выбор: Стандарт, Оптим и Премиум.",
  "servicii.partners.label": "Мы работаем с",
  "servicii.cta.aria": "Запросить расчёт",
  "servicii.cta.title": "Начните с бесплатной консультации и ориентировочного расчёта.",
  "servicii.cta.button": "Запросить расчёт",

  /* ----------------------------------------------------- pagina Contacte -- */
  "contacte.findUs": "Мы находимся здесь",
  "contacte.openMaps": "Открыть в Google Maps",
  "contacte.phone": "Телефон",
  "contacte.email": "Эл. почта",
  "contacte.social": "Соцсети",

  /* ------------------------------------------------- pagina unui proiect -- */
  "proiect.eyebrow": "Реализованный проект · Кишинёв",
  "proiect.intro":
    "{blurb} Вся мебель квартиры прошла девять этапов MOBO — от замеров и утверждённого 3D-проекта до монтажа и совместной приёмки.",
  "proiect.fact.photos": "Фотографий в проекте",
  "proiect.fact.measuring": "Замеры",
  "proiect.fact.measuringValue": "На месте",
  "proiect.fact.making": "Производство",
  "proiect.fact.makingValue": "Цех MOBO, Кишинёв",
  "proiect.fact.warranty": "Гарантия",
  "proiect.fact.warrantyValue": "5 лет, с обслуживанием",
  "proiect.photos.one": "{count} кадр",
  "proiect.photos.few": "{count} кадра",
  "proiect.photos.many": "{count} кадров",
  "proiect.photos.other": "{count} кадра",
  "proiect.galleryAria": "Галерея проекта {title}",
  "proiect.materials.title": "Те же материалы и механизмы доступны и для вашего дома.",
  "proiect.materials.body":
    "Мы работаем с {partners} — три категории материалов на выбор, фурнитура с доводчиками и гарантия 5 лет на всё, что монтируем.",
  "proiect.cta": "Хочу такой же проект",
  "proiect.calculator": "Онлайн-калькулятор",
  "proiect.browseAria": "Другие проекты",

  /* ------------------------------------------------------ articole legale -- */
  "legal.updated.termeni": "25 августа 2026 г.",
  "legal.updated.confidentialitate": "4 сентября 2026 г.",
  "legal.updated.gdpr": "25 августа 2026 г.",
  "legal.updated.info": "25 августа 2026 г.",
};
