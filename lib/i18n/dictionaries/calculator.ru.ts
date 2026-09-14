/**
 * Calculatorul: etichete de pas, opțiuni, rezumat, erori.
 *
 * Perechea: calculator.ro.ts — aceleași chei, obligatoriu.
 *
 * Ce NU se traduce: MOBO, Blum, Hettich, Egger, AGT, HPL, codurile de produs.
 * Nivelurile de material sunt nume de produs: Standart → Стандарт,
 * Premium → Премиум.
 */

import type { CalcDict } from "./calculator.ro";

export const calcRu: CalcDict = {
  /* -------------------------------------------------------------- cadrul -- */
  "calc.aria.section": "Калькулятор цены",
  "calc.progress": "Шаг {current} из {total}",

  /* --------------------------------------------------------------- pașii -- */
  "calc.step.mod.title": "Выберите уровень",
  "calc.step.tip.title": "Что обставляем?",
  "calc.step.forma.title": "Форма кухни",
  "calc.step.dims.title": "Размеры помещения",
  "calc.step.corp.title": "Корпус мебели",
  "calc.step.fatada.title": "Фасады",
  "calc.step.sertare.title": "Ящики",
  "calc.step.mecanisme.title": "Механизмы",
  "calc.step.organizatoare.title": "Органайзеры",
  "calc.step.blat.title": "Рабочая поверхность",
  "calc.step.rezultat.title": "Ваша оценка",

  "calc.step.mod.hint":
    "Уровень задаёт гамму материалов и фурнитуры, с которой мы начинаем. Фотографии — из наших проектов.",
  "calc.step.tip.hint":
    "Каждая карточка — реальный проект MOBO. Выберите тот, что ближе к вашему замыслу.",
  "calc.step.forma.hint":
    "Каждая схема — план помещения сверху: зелёная полоса это мебель, на ней отмечены мойка и варочная панель.",
  "calc.step.dims.hint":
    "Развёрнутая длина мебели, в метрах. Высота по умолчанию — стандартный потолок 2,6 м.",
  "calc.step.corp.hint": "Плита, из которой собраны корпуса, — каркас мебели.",
  "calc.step.fatada.hint":
    "Лицо мебели — материал, который вы видите и трогаете каждый день. Все кадры — из домов наших клиентов.",
  "calc.step.sertare.hint":
    "Укажите примерное число ящиков. Можно оставить ноль — уточним при проектировании.",
  "calc.step.mecanisme.hint": "Подъёмные, раздвижные и угловые системы. По желанию.",
  "calc.step.organizatoare.hint": "Внутреннее наполнение для одежды и обуви. По желанию.",
  "calc.step.blat.hint":
    "Только если нужна столешница в расчёте — выберите материал и укажите примерную площадь.",

  /* --------------------------------------------------------------- nivel -- */
  "calc.mode.standart": "Стандарт",
  "calc.mode.standart.blurb":
    "Проверенные материалы и базовая фурнитура — самая доступная точка старта.",
  "calc.mode.premium": "Премиум",
  "calc.mode.premium.blurb":
    "Плиты и механизмы из верхних гамм, особые отделки, выставочное исполнение.",

  /* ----------------------------------------------------------------- tip -- */
  "calc.type.bucatarie": "Кухня",
  "calc.type.bucatarie.blurb": "Нижние и верхние корпуса по форме вашего помещения.",
  "calc.type.bucatarie.lower": "кухня",
  "calc.type.garderoba": "Гардеробная",
  "calc.type.garderoba.blurb":
    "Комната для одежды, выверенная до сантиметра, — с дверями или открытая.",
  "calc.type.garderoba.lower": "гардеробная",
  "calc.type.dulap": "Шкаф",
  "calc.type.dulap.blurb": "Закрытый шкаф до потолка, с распашными или раздвижными дверями.",
  "calc.type.dulap.lower": "шкаф",
  "calc.type.pieseMici": "Отдельные предметы",
  "calc.type.pieseMici.blurb": "Комод, тумбы, туалетный столик, отдельные модули.",
  "calc.type.pieseMici.lower": "отдельные предметы",

  /* --------------------------------------------------------------- formă -- */
  "calc.shape.dreapta": "В линию",
  "calc.shape.colt": "Угловая",
  "calc.shape.u": "П-образная",
  "calc.shape.bar": "С барной стойкой",
  "calc.shape.insula": "С островом",

  /* ---------------------------------------------------------------- corp -- */
  "calc.corp.egger_alb": "Egger — стандартная белая плита",
  "calc.corp.egger_alb.blurb": "Австрийские плиты Egger, классический белый корпус.",
  "calc.corp.egger_color": "Egger — цветная плита премиум",
  "calc.corp.egger_color.blurb": "Те же плиты Egger, в цветных декорах премиум-гаммы.",

  /* -------------------------------------------------------------- fațadă -- */
  "calc.front.pal": "ЛДСП",
  "calc.front.pal.blurb": "Фасады из декорированной плиты — доступное решение.",
  "calc.front.agt_1": "AGT — прямые фасады",
  "calc.front.agt_1.blurb": "Панели МДФ с гладкой поверхностью, облицованные с одной стороны.",
  "calc.front.agt_2": "AGT — облицовка с двух сторон",
  "calc.front.agt_2.blurb": "Те же гладкие панели МДФ, облицованные с обеих сторон.",
  "calc.front.mdf_1": "МДФ крашеный",
  "calc.front.mdf_1.blurb": "Покраска в любой цвет, гладкая поверхность.",
  "calc.front.mdf_2": "МДФ крашеный с фрезеровкой",
  "calc.front.mdf_2.blurb": "Покраска, фрезеровка и любая форма на заказ.",
  "calc.front.front_sticla": "Стекло",
  "calc.front.front_sticla.blurb": "Фасады с дымчатым стеклом в алюминиевой рамке.",
  "calc.front.front_oglinda": "Зеркало",
  "calc.front.front_oglinda.blurb": "Двери с зеркалом в алюминиевой рамке.",
  "calc.front.furnir": "Шпон",
  "calc.front.furnir.blurb": "Настоящее дерево на каждом фасаде.",
  "calc.front.furnir_riflat": "Шпон с фрезеровкой",
  "calc.front.furnir_riflat.blurb": "Настоящее дерево в любой форме.",

  /* ------------------------------------------------------------- sertare -- */
  "calc.drawer.blum_lemn": "Blum — деревянные боковины",
  "calc.drawer.blum_metal": "Blum — металлические боковины",
  "calc.drawer.hettich_lemn": "Hettich — деревянные боковины",
  "calc.drawer.hettich_metal": "Hettich — металлические боковины",

  /* ----------------------------------------------------------- mecanisme -- */
  "calc.mech.blum_aventos_hk_xs": "Blum Aventos HK-XS",
  "calc.mech.blum_aventos_hk_xs.blurb": "Подъёмник для небольших фасадов.",
  "calc.mech.blum_piston_gaz": "Blum Aventos HF",
  "calc.mech.blum_piston_gaz.blurb": "Складной фасад для верхних корпусов.",
  "calc.mech.hettich": "Раздвижная система Hettich",
  "calc.mech.hettich.blurb": "TopLine / WingLine для раздвижных дверей.",
  "calc.mech.kesslohmer": "Угловая система Kessebohmer",
  "calc.mech.kesslohmer.blurb": "Выдвижные системы для углового корпуса.",

  /* ------------------------------------------------------- organizatoare -- */
  "calc.organizer.incaltaminte_8": "Обувница",
  "calc.organizer.incaltaminte_8.blurb": "8 выдвижных полок.",
  "calc.organizer.incaltaminte_12": "Обувница",
  "calc.organizer.incaltaminte_12.blurb": "12 выдвижных полок.",
  "calc.organizer.pantaloni_600": "Брючница",
  "calc.organizer.pantaloni_600.blurb": "Ширина 600 мм.",
  "calc.organizer.pantaloni_800": "Брючница",
  "calc.organizer.pantaloni_800.blurb": "Ширина 800 мм.",
  "calc.organizer.pantaloni_900": "Брючница",
  "calc.organizer.pantaloni_900.blurb": "Ширина 900 мм.",
  "calc.organizer.pantograf": "Пантограф",
  "calc.organizer.pantograf.blurb": "Штанга для одежды опускается к вам.",

  /* ---------------------------------------------------------------- blat -- */
  "calc.top.pal_egger": "ЛДСП Egger",
  "calc.top.pal_egger.blurb": "Ламинированная столешница, декоры Egger.",
  "calc.top.hpl_negru": "HPL компакт, чёрный",
  "calc.top.hpl_negru.blurb": "Чёрное ядро, тонкая кромка — 12 мм.",
  "calc.top.hpl_alb": "HPL компакт, белый",
  "calc.top.hpl_alb.blurb": "Белое ядро, вид камня — 12 мм.",

  /* --------------------------------------------------------- dimensiuni -- */
  "calc.dims.length.label": "Длина, метры",
  "calc.dims.length.placeholder": "напр. 5",
  "calc.dims.height.label": "Высота, метры",
  "calc.dims.depth.legend": "Глубина корпусов",
  "calc.dims.depth.600": "600 мм",
  "calc.dims.depth.900": "900 мм — глубокие корпуса",
  "calc.dims.error.length": "Укажите длину в метрах — от 0,5 до 30.",
  "calc.dims.error.height": "Высота должна быть от 1 до 3,5 метра.",

  /* ------------------------------------------------------- pasul „blat" -- */
  "calc.blat.area.label": "Площадь столешницы, м² (необязательно)",
  "calc.blat.area.placeholder": "напр. 3,5",

  /* ------------------------------------------------------------ numărare -- */
  "calc.counter.decrease": "Убрать: {item}",
  "calc.counter.increase": "Добавить: {item}",

  /* ------------------------------------------------------------ rezultat -- */
  "calc.result.banner": "Фотография из проекта MOBO — {type} на заказ.",
  "calc.result.eyebrow": "Ориентировочная оценка",
  "calc.result.mdl": "≈ {value} MDL",
  "calc.result.note":
    "Оценка ориентировочная — она зависит от точной конфигурации, декоров и аксессуаров. Окончательную цену вы получите после замеров, вместе с проектом и без каких-либо обязательств с вашей стороны.",

  /* ---------------------------------------------------------------- lead -- */
  "calc.lead.title": "Нужен точный расчёт? Его сделает консультант.",
  "calc.lead.name.label": "Имя",
  "calc.lead.name.placeholder": "Ваше имя",
  "calc.lead.phone.label": "Телефон",
  "calc.lead.consent": "Согласен(на) на обработку персональных данных согласно {link}.",
  "calc.lead.consent.link": "Политике конфиденциальности",
  "calc.lead.error.fields": "Заполните имя и телефон и отметьте согласие.",
  "calc.lead.error.send": "Не удалось отправить заявку. Позвоните нам напрямую: {phone}.",
  "calc.lead.submit": "Отправить конфигурацию",
  "calc.lead.submitting": "Отправляем…",
  "calc.lead.restart": "Начать заново",
  "calc.lead.success.title": "Мы получили вашу конфигурацию.",
  "calc.lead.success.body":
    "Свяжемся с вами по номеру {phone} в тот же рабочий день — с расчётом, который проверил консультант.",
  "calc.lead.success.again": "Рассчитать другую конфигурацию",

  /* ------------------------------------------------------------- panoul -- */
  "calc.aside.title": "Ваша конфигурация",
  "calc.aside.empty": "Ваш выбор собирается здесь, шаг за шагом — как спецификация.",
  "calc.aside.estimate": "Ориентировочная оценка",
  "calc.aside.mdl": "≈ {value} MDL · окончательная цена — после замеров",
  "calc.aside.pending": "Появится после того, как вы введёте размеры.",

  /* ---------------------------------------------------------------- bara -- */
  "calc.bar.current": "Текущая оценка:",
  "calc.bar.back": "Назад",
  "calc.bar.next": "Далее",

  /* ------------------------------------------------ etichetele rândurilor -- */
  "calc.row.mode": "Уровень",
  "calc.row.type": "Тип",
  "calc.row.shape": "Форма",
  "calc.row.dims": "Размеры",
  "calc.row.corp": "Корпус",
  "calc.row.front": "Фасады",
  "calc.row.drawers": "Ящики",
  "calc.row.mechanisms": "Механизмы",
  "calc.row.organizers": "Органайзеры",
  "calc.row.countertop": "Столешница",

  /* ---------------------------------------------------- valorile rândurilor */
  "calc.value.count": "{n} шт.",
  "calc.value.dims": "{length} × {height} м",
  "calc.value.dims.depth": "{length} × {height} м, {depth} мм",
  "calc.value.dims.full": "{length} м длина × {height} м высота",
  "calc.value.dims.full.depth": "{length} м длина × {height} м высота, глубина {depth} мм",
  "calc.value.qty": "{label} ×{n}",
  "calc.value.qty.detail": "{label} ({detail}) ×{n}",
  "calc.value.countertop": "{label}, {area} м²",
};
