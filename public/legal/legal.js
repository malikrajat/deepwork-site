/**
 * The documents' only script: theme, copy, and the contact form.
 *
 * Deliberately small and dependency-free. Everything on these pages reads
 * without it — this adds a control, it does not render content. It also sends no
 * request of its own: the documents are not counted by the visit counter, and
 * the only network call possible here is the contact form, and only after the
 * visitor presses Send on a form that has an endpoint.
 *
 * The theme key is the same one `src/app/core/theme.ts` uses, so a choice made
 * on the home page applies here and the other way round.
 */
(function () {
  'use strict';

  var THEME_KEY = 'deepwork-site-theme';
  var root = document.documentElement;

  /* ---------- Theme ---------- */
  var toggle = document.querySelector('[data-theme-toggle]');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function describe(theme) {
    return theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme';
  }

  if (toggle) {
    /* The button ships with `hidden` so that a visitor without JavaScript never
       meets a control that cannot do anything. This is the line that shows it. */
    toggle.hidden = false;
    toggle.setAttribute('aria-label', describe(currentTheme()));

    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      toggle.setAttribute('aria-label', describe(next));

      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (error) {
        /* Private mode or blocked storage: the theme still applies to this page
           view, which is the part the visitor asked for. */
      }
    });
  }

  /* ---------- Copy the address ---------- */
  var copyButton = document.querySelector('[data-copy]');

  if (copyButton) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      /* No clipboard API — the address is already on screen as selectable text. */
      copyButton.hidden = true;
    } else {
      var copyLabel = copyButton.textContent;
      copyButton.addEventListener('click', function () {
        navigator.clipboard.writeText(copyButton.getAttribute('data-copy')).then(
          function () {
            copyButton.textContent = 'Copied';
            setTimeout(function () {
              copyButton.textContent = copyLabel;
            }, 2000);
          },
          function () {
            copyButton.textContent = 'Copy failed';
            setTimeout(function () {
              copyButton.textContent = copyLabel;
            }, 2000);
          },
        );
      });
    }
  }

  /* ---------- Contact form ----------
     The form posts to Web3Forms, which forwards the message to the inbox named
     in the privacy policy. Its access key is never committed: `tools/contact-config.cjs`
     reads it from the environment (or a gitignored `.env.local`) and writes it to
     `public/contact/config.js` before every start and build.

     With no key or no endpoint configured, nothing here runs and the markup's
     own `action="mailto:..."` takes over, so the page still works — it just
     opens the visitor's mail app instead of sending.

     The provider is named in the note under the button and in the privacy
     policy, because it handles the message. */
  var form = document.querySelector('[data-contact-form]');
  var config = window.DEEPWORK_CONTACT || {};
  var endpoint = (config.endpoint || (form ? form.getAttribute('data-endpoint') : '') || '').trim();
  var accessKey = (config.accessKey || '').trim();
  var provider = config.provider || 'the form service';

  if (!form || !endpoint || !accessKey) return;

  var status = document.querySelector('[data-form-status]');
  var submit = form.querySelector('[type="submit"]');
  var submitLabel = submit ? submit.textContent : '';

  /* The service enforces hCaptcha on this form, so a token is required with
     every submission. The widget is mounted here rather than in the markup: it
     needs a third-party script, and a visitor with JavaScript off never gets one
     — they post through `mailto:` instead, where no captcha is involved. */
  var captchaHost = form.querySelector('[data-captcha-host]');

  if (config.captcha && captchaHost) {
    var widget = document.createElement('div');
    widget.className = 'h-captcha';
    widget.setAttribute('data-captcha', 'true');
    /* The normal widget is a fixed 303px wide, which does not fit a 320px phone
       once the form's padding is taken out. Compact is 164px and fits anywhere;
       the size is chosen at render time because hCaptcha cannot change it later. */
    widget.setAttribute(
      'data-size',
      window.matchMedia('(min-width: 420px)').matches ? 'normal' : 'compact',
    );
    widget.setAttribute(
      'data-theme',
      document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
    );
    captchaHost.appendChild(widget);
    captchaHost.hidden = false;

    var captchaScript = document.createElement('script');
    captchaScript.src = 'https://web3forms.com/client/script.js';
    captchaScript.async = true;
    captchaScript.defer = true;
    document.body.appendChild(captchaScript);
  }

  function captchaToken() {
    var field = form.querySelector('[name="h-captcha-response"]');
    return field ? field.value : '';
  }

  function captchaReset() {
    if (window.hcaptcha && typeof window.hcaptcha.reset === 'function') {
      window.hcaptcha.reset();
    }
  }

  /* The note under the button describes what actually happens. Without an
     endpoint it says the message opens in the visitor's mail app — true. With
     one, that sentence would be a lie, so it is replaced with the service that
     receives the message. */
  var deliveryNote = document.querySelector('[data-note-delivery]');

  if (deliveryNote) {
    deliveryNote.textContent =
      'Delivered to contact@rajatmalik.dev through ' + provider + '. Nothing is posted publicly.';
  }

  function say(message, kind) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form__status' + (kind ? ' form__status--' + kind : '');
  }

  form.setAttribute('action', endpoint);
  form.setAttribute('novalidate', 'novalidate');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    /* The honeypot: a field no person fills in and no screen reader announces.
       A message with it filled is dropped without sending anything. */
    var trap = form.querySelector('[name="botcheck"]');
    if (trap && trap.value) {
      say('Thank you — your message was sent.', 'ok');
      form.reset();
      return;
    }

    if (!form.checkValidity()) {
      form.removeAttribute('novalidate');
      form.reportValidity();
      form.setAttribute('novalidate', 'novalidate');
      say('Please fill in the required fields.', 'error');
      return;
    }

    var fields = new FormData(form);
    var topic = fields.get('subject') || 'Contact';
    var token = captchaToken();

    if (config.captcha && !token) {
      say('Please complete the check below, then press Send again.', 'error');
      return;
    }

    var payload = {
      /* Web3Forms routes the message by this key. It is public by design — it can
         only deliver to the inbox that owns it — and is injected at build time. */
      access_key: accessKey,
      name: fields.get('name') || '',
      /* Web3Forms replies to `email` by default, so a reply goes to the visitor. */
      email: fields.get('email') || '',
      subject: 'DeepWork — ' + topic,
      topic: topic,
      message: fields.get('message') || '',
      from_name: 'DeepWork contact form',
      /* The provider's own honeypot. Empty is the only truthful value: a person
         cannot fill a field the page never renders. */
      botcheck: '',
    };

    if (config.captcha) payload['h-captcha-response'] = token;

    if (submit) submit.disabled = true;
    if (submit) submit.textContent = 'Sending…';
    say('Sending…', '');

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        /* Web3Forms answers JSON on both paths: `{ success: boolean, message }`.
           A 200 with `success: false` is still a refusal, so both are checked. */
        return response.json().then(
          function (body) {
            return { ok: response.ok && body.success !== false, body: body };
          },
          function () {
            return { ok: response.ok, body: {} };
          },
        );
      })
      .then(function (result) {
        if (!result.ok) throw new Error(result.body.message || 'Submission refused');
        form.reset();
        /* A captcha token is single-use: clear it whether or not the message
           sent, or the next attempt would post a token the service has seen. */
        captchaReset();
        say('Thank you — your message was sent. I will read it.', 'ok');
      })
      .catch(function () {
        captchaReset();
        say(
          'The message could not be sent. Please write to contact@rajatmalik.dev instead.',
          'error',
        );
      })
      .then(function () {
        if (submit) submit.disabled = false;
        if (submit) submit.textContent = submitLabel;
      });
  });
})();
