/**
 * Google Tag Manager, wired through Google Consent Mode v2.
 *
 * The container itself loads on every page, as the GTM install instructions
 * say. What does NOT happen unprompted is storage: the consent defaults below
 * are pushed BEFORE the container script, so until the visitor answers the
 * cookie dialog GTM runs in cookieless mode — tags still fire, but they may
 * not read or write ad/analytics storage. This site shows an EU-style consent
 * dialog and publishes a GDPR page; loading the raw snippet with storage
 * granted by default would make both of those untrue.
 *
 * The dialog calls pushConsentUpdate() the moment the visitor decides, which
 * promotes the categories they allowed. A returning visitor's stored answer is
 * replayed by the boot script below, before the container loads, so they never
 * spend a pageview in the denied default.
 */

export const GTM_ID = "GTM-N6HN2RML";

/** Mirrors the two optional toggles in the cookie dialog. */
export type ConsentChoice = {
  analytics: boolean;
  marketing: boolean;
};

/** localStorage key owned by components/ui/CookieConsent.tsx. */
const STORAGE_KEY = "mobo-consent";

/**
 * Consent defaults + the stored answer, inlined ahead of the container.
 *
 * `wait_for_update` holds tags briefly so a stored answer, or a fast click,
 * lands before anything fires — without it GTM would evaluate the denied
 * default and never re-run those tags for the current pageview.
 *
 * Written as a string because it has to execute before any React code: there
 * is no component lifecycle early enough to do this from.
 */
export const CONSENT_BOOT_SCRIPT = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('consent','default',{
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  analytics_storage:'denied',
  functionality_storage:'granted',
  security_storage:'granted',
  wait_for_update:500
});
try{
  var c=JSON.parse(localStorage.getItem('${STORAGE_KEY}')||'null');
  if(c&&c.v===1){
    gtag('consent','update',{
      ad_storage:c.marketing?'granted':'denied',
      ad_user_data:c.marketing?'granted':'denied',
      ad_personalization:c.marketing?'granted':'denied',
      analytics_storage:c.analytics?'granted':'denied'
    });
  }
}catch(e){}
`.trim();

/** The container loader, verbatim from the GTM install instructions. */
export const GTM_SCRIPT = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
`.trim();

type ConsentValue = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Promote the categories the visitor allowed. Safe to call before the boot
 * script has run (it queues onto dataLayer directly) and safe on the server,
 * where it is a no-op.
 */
export function pushConsentUpdate({ analytics, marketing }: ConsentChoice): void {
  if (typeof window === "undefined") return;

  const ad: ConsentValue = marketing ? "granted" : "denied";
  const payload = {
    ad_storage: ad,
    ad_user_data: ad,
    ad_personalization: ad,
    analytics_storage: analytics ? "granted" : ("denied" as ConsentValue),
  };

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", payload);
  } else {
    /* Container not booted yet (script blocked, or an ad blocker ate it).
       The array form is what gtag() would have pushed anyway. */
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(["consent", "update", payload]);
  }
}
