import { CONSUMER_INFO, SITE } from "@/lib/data";

/** Corpul paginii „Info clienți" în română. */

export default function InfoRo() {
  const { authority } = CONSUMER_INFO;

  return (
    <>
      <h2>Util de știut înainte și după comandă</h2>
      <ul>
        <li>
          Toate produsele au <strong>5 ani garanție</strong>, cu deservire la un singur apel
          și posibilitate de prelungire.
        </li>
        <li>Plata poate fi eșalonată în 10 rate, prin intermediul Microinvest.</li>
        <li>Alegi dintre trei categorii de materiale: Standard, Optim &amp; Premium.</li>
        <li>Mobilierul se predă doar după verificarea lui împreună cu tine, la montaj.</li>
      </ul>

      <h2>Sesizări și reclamații</h2>
      <p>
        Pentru orice sesizare sau reclamație referitoare la produsele și serviciile noastre,
        contactează-ne mai întâi direct: <a href={`mailto:${SITE.email}`}>{SITE.email}</a> sau{" "}
        <a href={SITE.phoneHref}>{SITE.phone}</a>. Răspundem în aceeași zi lucrătoare.
      </p>

      <h2>Autoritatea națională competentă</h2>
      <p>
        În conformitate cu legislația Republicii Moldova, consumatorii au dreptul de a fi
        informați și protejați. Autoritatea competentă este:
      </p>
      <ul>
        <li>
          <strong>{authority.name}</strong>
        </li>
        <li>{authority.address}</li>
        <li>Telefon: {authority.phones.join(" · ")}</li>
        <li>
          <a href={authority.website} target="_blank" rel="noopener noreferrer">
            {authority.websiteLabel}
          </a>
        </li>
      </ul>
    </>
  );
}
