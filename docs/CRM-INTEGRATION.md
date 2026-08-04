# Conectarea formularului la un CRM WordPress

Răspunsul la întrebarea „putem trimite clienții din formular direct în CRM?" — **da**, iar
arhitectura de mai jos este pregătită deja pentru asta.

---

## De ce funcționează bine în cazul MOBO

mobo.md rulează **deja pe WordPress** (`/wp-content/uploads/`, plus un CDN de assets pe
`assetcdn.net`). Deci nu este vorba de o migrare *de pe* WordPress, ci de adăugarea unui
front-end rapid peste el — un montaj clasic **headless WordPress**.

```
┌──────────────┐   POST /api/lead   ┌────────────────────┐   REST + App Password   ┌─────────────┐
│  Formular    │ ─────────────────► │  Next.js (server)  │ ──────────────────────► │  WordPress  │
│  (browser)   │      JSON          │  validare + retry  │                         │  CRM plugin │
└──────────────┘                    └────────────────────┘                         └─────────────┘
                                              │
                                              └──► Telegram (notificare echipă)
```

Cheile API stau doar pe server. Browserul nu le vede niciodată.

---

## Ce e deja implementat

| Fișier | Rol |
| --- | --- |
| `lib/crm/types.ts` | Schema Zod + interfața `CrmProvider` |
| `lib/crm/index.ts` | `submitLead()` — singurul punct de contact cu CRM-ul |
| `lib/crm/providers/wordpress.ts` | Trimite lead-ul în WP REST API |
| `lib/crm/providers/telegram.ts` | Notificare instant pentru echipa de vânzări |
| `lib/crm/providers/console.ts` | Fallback local, ca formularul să meargă fără config |
| `app/api/lead/route.ts` | Validare, rate limit, honeypot, dwell-time |

Componentele **nu importă niciodată** un provider. Ele nu știu unde ajung datele.
Schimbarea CRM-ului înseamnă editarea unei singure constante în `lib/crm/index.ts`.

---

## Configurare (3 pași)

### 1. Application Password în WordPress

`WP Admin → Users → Profile → Application Passwords` → generează una nouă.
Obligatoriu **HTTPS** — Basic auth pe HTTP trimite parola în clar.

### 2. Completează `.env.local`

```bash
WP_CRM_ENDPOINT="https://cms.mobo.md/wp-json/mobo/v1/leads"
WP_CRM_USER="crm-bot"
WP_CRM_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
```

Pentru **FluentCRM** endpoint-ul devine:

```bash
WP_CRM_ENDPOINT="https://cms.mobo.md/wp-json/fluent-crm/v2/subscribers"
```

### 3. Endpoint-ul în WordPress

Dacă folosești un plugin CRM (FluentCRM, Jetpack CRM, WP Fusion) endpoint-ul există deja.
Pentru un endpoint propriu, în `functions.php` sau într-un mic plugin:

```php
add_action( 'rest_api_init', function () {
    register_rest_route( 'mobo/v1', '/leads', [
        'methods'             => 'POST',
        'callback'            => 'mobo_create_lead',
        // Doar utilizatori care pot administra contacte.
        'permission_callback' => function () {
            return current_user_can( 'edit_posts' );
        },
    ] );
} );

function mobo_create_lead( WP_REST_Request $request ) {
    $body = $request->get_json_params();

    $post_id = wp_insert_post( [
        'post_type'   => 'mobo_lead',
        'post_title'  => sanitize_text_field( $body['full_name'] ?? 'Lead' ),
        'post_status' => 'private',
        'meta_input'  => [
            'phone'      => sanitize_text_field( $body['phone'] ?? '' ),
            'email'      => sanitize_email( $body['email'] ?? '' ),
            'room'       => sanitize_text_field( $body['meta']['room'] ?? '' ),
            'budget'     => sanitize_text_field( $body['meta']['budget'] ?? '' ),
            'message'    => sanitize_textarea_field( $body['meta']['message'] ?? '' ),
            'source'     => sanitize_text_field( $body['meta']['source'] ?? '' ),
            'consent_at' => sanitize_text_field( $body['meta']['consent_at'] ?? '' ),
        ],
    ], true );

    if ( is_wp_error( $post_id ) ) {
        return new WP_Error( 'mobo_lead_failed', 'Could not store lead', [ 'status' => 500 ] );
    }

    return [ 'id' => $post_id ];
}
```

---

## Recomandări operaționale

**Ține WordPress pe un subdomeniu** (`cms.mobo.md`). Dacă WP este compromis sau cade,
front-end-ul rămâne online — leads-urile se rețin și se retrimit.

**WP nu e un CRM adevărat la scară.** Pentru câteva sute–mii de lead-uri e perfect. Când
apar pipeline-uri, etape de deal și automatizări, HubSpot (plan gratuit) sau Pipedrive
sunt alegeri mai bune. Migrarea = un fișier nou în `providers/` și o linie schimbată
în `index.ts`.

**GDPR.** Clienți din Moldova și UE: consimțământ explicit (bifă necompletată implicit),
link către politica de confidențialitate, și `consent_at` salvat — toate există deja în
`leadSchema`.

**Rate limiting.** Implementarea curentă este in-memory: corectă pentru o singură instanță
Node, dar **nu** ține la deploy serverless multi-regiune. Pentru Vercel cu mai multe
regiuni, înlocuiește `Map`-ul din `app/api/lead/route.ts` cu Upstash Redis.

---

## Adăugarea unui alt CRM

```ts
// lib/crm/providers/hubspot.ts
import type { CrmProvider, CrmResult, Lead } from "../types";

export const hubspotProvider: CrmProvider = {
  name: "hubspot",
  async submit(lead: Lead): Promise<CrmResult> {
    // ...
  },
};
```

Apoi, în `lib/crm/index.ts`:

```ts
const PRIMARY: CrmProvider = hubspotProvider;
```

Niciun component nu se modifică.
