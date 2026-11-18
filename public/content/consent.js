/**
 * Google Consent Mode v2 defaults, before anything that measures or advertises.
 *
 * This file must load synchronously and before Tag Manager and AdSense, or the
 * first request those tags make carries no consent signal and Google treats the
 * visit as unconsented anyway. It is one small local file rather than an inline
 * block repeated in twelve documents, so there is one place to correct it.
 *
 * What it does, and why it is split in two:
 *
 * 1. **In the EEA, the UK, Switzerland and Brazil, everything starts denied.** Google's
 *    consent rules require consent before advertising or analytics cookies are
 *    stored, so the default is "no" and only the visitor can change it. The
 *    AdSense consent messages — the certified platform configured in AdSense →
 *    Privacy & messaging, not something hand-built here — appear in those regions
 *    and update these signals when a choice is made.
 * 2. **Everywhere else the defaults are granted**, because the message is not
 *    shown there and a denied default would silently switch off the analytics
 *    the site is entitled to collect outside those regions. Both choices are
 *    explained in `/privacy/` and `/cookies/`.
 *
 * `ads_data_redaction` keeps Google from receiving full URLs and identifiers
 * while advertising storage is denied, and `url_passthrough` lets a click still
 * be attributed without a cookie. Neither grants anything.
 *
 * If the consent message is never configured in AdSense, nothing breaks: the
 * signals stay at their defaults and the site still works without advertising.
 */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  /* Tag Manager defines the same function with the same body. Keeping the first
     definition means a page that loads this file and then GTM has one queue and
     two writers, which is how the consent commands are meant to work. */
  window.gtag = window.gtag || gtag;

  /* The countries with a consent rule this site follows: the EEA and the UK
     (GDPR), Switzerland (revised FADP), and Brazil (LGPD). Written out because
     a region list is ISO 3166-1 codes; there is no "EEA" value, and an invented
     one would silently match nothing. */
  var REGULATED = [
    'AT',
    'BE',
    'BG',
    'BR',
    'HR',
    'CY',
    'CZ',
    'DK',
    'EE',
    'FI',
    'FR',
    'DE',
    'GR',
    'HU',
    'IS',
    'IE',
    'IT',
    'LV',
    'LI',
    'LT',
    'LU',
    'MT',
    'NL',
    'NO',
    'PL',
    'PT',
    'RO',
    'SK',
    'SI',
    'ES',
    'SE',
    'GB',
    'CH',
  ];

  function signals(value) {
    return {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value,
    };
  }

  gtag('consent', 'default', {
    ...signals('denied'),
    region: REGULATED,
    wait_for_update: 500,
  });

  gtag('consent', 'default', signals('granted'));

  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);
})();
