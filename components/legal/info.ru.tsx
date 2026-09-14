import { CONSUMER_INFO, SITE } from "@/lib/data";

/** Corpul paginii „Info clienți" în rusă. */

export default function InfoRu() {
  const { authority } = CONSUMER_INFO;

  return (
    <>
      <h2>Полезно знать до и после заказа</h2>
      <ul>
        <li>
          На все изделия действует <strong>5 лет гарантии</strong>, с обслуживанием по одному
          звонку и возможностью продления.
        </li>
        <li>Оплату можно разбить на 10 платежей через Microinvest.</li>
        <li>Вы выбираете из трёх категорий материалов: Standard, Optim &amp; Premium.</li>
        <li>Мебель передаётся только после того, как вы проверите её вместе с нами при монтаже.</li>
      </ul>

      <h2>Обращения и претензии</h2>
      <p>
        По любому обращению или претензии, связанным с нашими изделиями и услугами, свяжитесь
        сначала напрямую с нами: <a href={`mailto:${SITE.email}`}>{SITE.email}</a> или{" "}
        <a href={SITE.phoneHref}>{SITE.phone}</a>. Мы отвечаем в тот же рабочий день.
      </p>

      <h2>Компетентный национальный орган</h2>
      <p>
        В соответствии с законодательством Республики Молдова потребители имеют право на
        информацию и на защиту. Компетентный орган:
      </p>
      <ul>
        <li>
          <strong>
            Государственная инспекция по надзору за непродовольственной продукцией и защите
            прав потребителей ({authority.name})
          </strong>
        </li>
        <li>{authority.address}</li>
        <li>Телефон: {authority.phones.join(" · ")}</li>
        <li>
          <a href={authority.website} target="_blank" rel="noopener noreferrer">
            {authority.websiteLabel}
          </a>
        </li>
      </ul>
    </>
  );
}
