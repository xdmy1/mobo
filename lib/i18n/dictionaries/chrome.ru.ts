/**
 * Nav, formularul de lead, consimțământul de cookie-uri, galeria, contactele rapide.
 *
 * Perechea: chrome.ro.ts — aceleași chei, obligatoriu.
 *
 * Numele de brand nu se traduc: MOBO, MOBO Kitchens & Home, Instagram, TikTok,
 * Telegram, Google. Adresarea către cititor este cu «вы» cu literă mică.
 */

import type { ChromeDict } from "./chrome.ro";

export const chromeRu: ChromeDict = {
  "chrome.cookies.accept": "Принять",
  "chrome.cookies.body":
    "Мы используем cookie и похожие технологии, чтобы сайт работал, а с вашего согласия — чтобы понимать, как им пользуются, и продвигаться эффективнее. Подробности — в",
  "chrome.cookies.customize": "Настроить",
  "chrome.cookies.hideOptions": "Скрыть настройки",
  "chrome.cookies.marketing": "Маркетинг",
  "chrome.cookies.marketingHint":
    "Помогает показывать вам подходящие предложения, а не случайную рекламу.",
  "chrome.cookies.necessary": "Строго необходимые",
  "chrome.cookies.necessaryHint": "Работа и безопасность сайта. Всегда включены.",
  "chrome.cookies.necessaryOnly": "Только необходимые",
  "chrome.cookies.policyLink": "Политике конфиденциальности",
  "chrome.cookies.save": "Сохранить выбор",
  "chrome.cookies.statistics": "Статистика",
  "chrome.cookies.statisticsHint":
    "Анонимно показывает, как пользуются сайтом, чтобы мы могли его улучшать.",
  "chrome.cookies.title": "Мы бережно относимся к вашим данным.",

  "chrome.form.checkFields": "Проверьте отмеченные ниже поля.",
  "chrome.form.consentAfter": "Данные третьим лицам не передаются.",
  "chrome.form.consentBefore":
    "Я согласен на обработку персональных данных, чтобы со мной связались по этой заявке, согласно",
  "chrome.form.consentLink": "Политике конфиденциальности",
  "chrome.form.email": "Email",
  "chrome.form.error.consentRequired": "Чтобы отправить заявку, нужно согласие на обработку данных.",
  "chrome.form.error.emailInvalid": "Адрес email выглядит некорректно.",
  "chrome.form.error.messageLong": "Сообщение слишком длинное.",
  "chrome.form.error.nameLong": "Имя слишком длинное.",
  "chrome.form.error.nameShort": "Имя должно содержать не меньше 2 символов.",
  "chrome.form.error.phoneInvalid": "Введите корректный номер телефона.",
  "chrome.form.error.phoneLong": "Номер телефона слишком длинный.",
  "chrome.form.fixFields": "Несколько полей нужно поправить.",
  "chrome.form.honeypot": "Оставьте это поле пустым",
  "chrome.form.lede":
    "Три поля, полминуты. Консультант MOBO позвонит вам в тот же рабочий день, чтобы обсудить проект и записать вас на замер.",
  "chrome.form.meanwhileCalculator": "А пока — онлайн-калькулятор",
  "chrome.form.name": "Имя",
  "chrome.form.namePlaceholder": "Ваше имя",
  "chrome.form.networkError":
    "Соединение не удалось. Проверьте интернет и попробуйте ещё раз или позвоните нам: {phone}.",
  "chrome.form.orCall": "Или позвоните напрямую:",
  "chrome.form.phone": "Телефон",
  "chrome.form.roomLegend": "Что обставляем?",
  "chrome.form.sendFailed": "Не удалось отправить заявку. Позвоните нам напрямую: {phone}.",
  "chrome.form.showroom": "Шоурум",
  "chrome.form.submit": "Отправить заявку",
  "chrome.form.submitting": "Отправляем…",
  "chrome.form.successLive": "Мы получили вашу заявку. Свяжемся с вами в тот же рабочий день.",
  "chrome.form.successTail": "в тот же рабочий день, чтобы согласовать консультацию и замер.",
  "chrome.form.successTitle": "Мы получили вашу заявку.",
  "chrome.form.successToPhone": "Свяжемся с вами по номеру",
  "chrome.form.title":
    "Расскажите, что хотите обставить, и получите предварительный расчёт — без обязательств.",
  "chrome.form.tooMany": "Слишком много заявок подряд. Попробуйте снова через несколько минут.",
  "chrome.form.writeUs": "Напишите нам в",

  "chrome.gallery.alt": "{title} — фотография {n} из {total}",
  "chrome.gallery.altSpace": "{title} — {space}, фотография {n} из {total}",
  "chrome.gallery.figure": "Фотогалерея — {title}",
  "chrome.gallery.next": "Следующая фотография",
  "chrome.gallery.prev": "Предыдущая фотография",
  "chrome.gallery.spaces": "Помещения дома, в порядке галереи",
  "chrome.gallery.track":
    "Фотографии проекта «{title}», помещение за помещением. Для навигации используйте стрелки.",

  "chrome.nav.call": "Позвонить по номеру {phone}",
  "chrome.nav.closeMenu": "Закрыть меню",
  "chrome.nav.cta": "Запросить расчёт",
  "chrome.nav.home": "MOBO Kitchens & Home — главная страница",
  "chrome.nav.language": "Язык",
  "chrome.nav.menu": "Меню",
  "chrome.nav.mobile": "Мобильная навигация",
  "chrome.nav.openMenu": "Открыть меню",
  "chrome.nav.primary": "Основная навигация",

  "chrome.quick.call": "Позвонить",
  "chrome.quick.close": "Закрыть быстрые контакты",
  "chrome.quick.open": "Открыть быстрые контакты",
  "chrome.quick.title": "Быстрая связь",
};
