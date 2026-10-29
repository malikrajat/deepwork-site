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
     With no endpoint set on the form, nothing here runs: the markup's own
     `action="mailto:..."` takes over and the visitor's mail client composes the
     message. When an endpoint is present the form is posted as JSON instead, so
     the message arrives without a mail client being configured.

     To enable it, put the address on the form in public/contact/index.html:

       data-endpoint="https://formspree.io/f/XXXXXXXX"

     A Formspree endpoint works as it is. Web3Forms also needs its access key in
     the body — add `access_key` to `payload` below. Either way, the provider must
     then be named in the privacy policy, because it handles the message. */
  var form = document.querySelector('[data-contact-form]');
  var endpoint = form ? (form.getAttribute('data-endpoint') || '').trim() : '';

  if (!form || !endpoint) return;

  var status = document.querySelector('[data-form-status]');
  var submit = form.querySelector('[type="submit"]');
  var submitLabel = submit ? submit.textContent : '';

  /* The note under the button describes what actually happens. Without an
     endpoint it says the message opens in the visitor's mail app — true. With
     one, that sentence would be a lie, so it is replaced with the service that
     receives the message, named from the endpoint itself. */
  var deliveryNote = document.querySelector('[data-note-delivery]');

  if (deliveryNote) {
    var provider = endpoint;
    try {
      provider = new URL(endpoint).hostname;
    } catch (error) {
      /* Not a URL: keep the endpoint as written rather than claim a host. */
    }

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
    var trap = form.querySelector('[name="_gotcha"]');
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
    var payload = {
      name: fields.get('name') || '',
      email: fields.get('email') || '',
      subject: fields.get('subject') || 'Contact',
      message: fields.get('message') || '',
      /* Formspree reads `_subject` for the email subject; `subject` above is the
         visitor's own choice of topic and is kept as a field of the message. */
      _subject: 'DeepWork — ' + (fields.get('subject') || 'Contact'),
      _gotcha: '',
    };

    if (submit) submit.disabled = true;
    if (submit) submit.textContent = 'Sending…';
    say('Sending…', '');

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        form.reset();
        say('Thank you — your message was sent. I will read it.', 'ok');
      })
      .catch(function () {
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
