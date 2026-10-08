/*
 * Palmer's local cookie-consent notice.
 *
 * This file intentionally has no network, analytics, or third-party
 * dependencies.  The page can initialise it with:
 *
 *   window.initCookieNotice({ logo: '/assets/logo.png' });
 */
(function exposeCookieNotice(root) {
  'use strict';

  if (!root || !root.document) return;

  var document = root.document;
  var STORAGE_KEY = 'Palmer consent';
  var activeController = null;

  var DEFAULTS = {
    logo: '/assets/logo.png',
    title: 'This website uses cookies',
    description:
      'We use cookies to personalize content and ads, provide social media features, and analyze our website traffic. We also share information about your use of our site with our social media, advertising, and analytics partners. These partners may combine this information with other information you\'ve provided to them or that they\'ve collected from your use of their services.'
  };

  var CATEGORIES = [
    {
      key: 'necessary',
      label: 'Necessary',
      description: 'These cookies are required for the website to work and cannot be switched off.',
      required: true
    },
    {
      key: 'preferences',
      label: 'Preferences',
      description: 'These cookies remember choices you make so the site can feel more personal.',
      required: false
    },
    {
      key: 'statistics',
      label: 'Statistics',
      description: 'These cookies help us understand how visitors use the website.',
      required: false
    },
    {
      key: 'marketing',
      label: 'Marketing',
      description: 'These cookies may be used to make advertising more relevant to you.',
      required: false
    }
  ];

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function getStorage() {
    try {
      return root.localStorage;
    } catch (_error) {
      return null;
    }
  }

  function hasSavedConsent(storage) {
    if (!storage) return false;
    try {
      return storage.getItem(STORAGE_KEY) !== null;
    } catch (_error) {
      return false;
    }
  }

  function readSavedConsent(storage) {
    if (!storage) return null;
    try {
      var raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      try {
        var parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : { value: raw };
      } catch (_parseError) {
        return { value: raw };
      }
    } catch (_error) {
      return null;
    }
  }

  function saveConsent(storage, values, action) {
    var payload = {
      version: 1,
      action: action,
      necessary: true,
      preferences: Boolean(values.preferences),
      statistics: Boolean(values.statistics),
      marketing: Boolean(values.marketing),
      savedAt: new Date().toISOString()
    };

    if (storage) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (_error) {
        // Private browsing modes can expose localStorage but reject writes.
      }
    }

    try {
      root.dispatchEvent(new root.CustomEvent('palmer-cookie-consent', { detail: payload }));
    } catch (_error) {
      // CustomEvent is unavailable in a few older embedded browsers.
    }

    return payload;
  }

  function makeConsentNotice(options) {
    var config = Object.assign({}, DEFAULTS, options || {});
    var storage = getStorage();
    var previousFocus = document.activeElement;
    var currentTab = 'consent';
    var customizing = false;
    var destroyed = false;
    var values = {
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false
    };

    var saved = readSavedConsent(storage);
    CATEGORIES.forEach(function (category) {
      if (saved && typeof saved[category.key] === 'boolean') {
        values[category.key] = saved[category.key];
      }
    });
    values.necessary = true;

    var rootElement = createElement('div', 'palmer-cookie');
    rootElement.setAttribute('data-palmer-cookie', '');
    rootElement.setAttribute('aria-live', 'polite');
    rootElement.hidden = hasSavedConsent(storage);

    var backdrop = createElement('div', 'palmer-cookie__backdrop');
    backdrop.setAttribute('aria-hidden', 'true');
    rootElement.appendChild(backdrop);

    var dialog = createElement('section', 'palmer-cookie__dialog');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'palmer-cookie-title');
    dialog.setAttribute('tabindex', '-1');
    rootElement.appendChild(dialog);

    var header = createElement('header', 'palmer-cookie__header');
    var logo = createElement('img', 'palmer-cookie__logo');
    logo.src = config.logo;
    logo.alt = 'Palmer';
    logo.decoding = 'async';
    header.appendChild(logo);
    dialog.appendChild(header);

    var tabList = createElement('div', 'palmer-cookie__tabs');
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', 'Cookie information');
    dialog.appendChild(tabList);

    var tabButtons = {};
    ['consent', 'about', 'details'].forEach(function (tabName) {
      var label = tabName === 'consent' ? 'Consent' : tabName === 'about' ? 'About cookies' : 'Details';
      var tab = createElement('button', 'palmer-cookie__tab', label);
      tab.type = 'button';
      tab.id = 'palmer-cookie-tab-' + tabName;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'palmer-cookie-panel-' + tabName);
      tabButtons[tabName] = tab;
      tabList.appendChild(tab);
    });

    var content = createElement('div', 'palmer-cookie__content');
    dialog.appendChild(content);

    var panels = {};
    ['consent', 'about', 'details'].forEach(function (panelName) {
      var panel = createElement('div', 'palmer-cookie__panel');
      panel.id = 'palmer-cookie-panel-' + panelName;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', 'palmer-cookie-tab-' + panelName);
      panels[panelName] = panel;
      content.appendChild(panel);
    });

    var consentTitle = createElement('h1', 'palmer-cookie__title', config.title);
    consentTitle.id = 'palmer-cookie-title';
    panels.consent.appendChild(consentTitle);
    panels.consent.appendChild(createElement('p', 'palmer-cookie__description', config.description));

    var customizePanel = createElement('div', 'palmer-cookie__customize');
    var customizeTitle = createElement('h2', 'palmer-cookie__customize-title', 'Customize your preferences');
    customizePanel.appendChild(customizeTitle);
    customizePanel.appendChild(
      createElement('p', 'palmer-cookie__customize-intro', 'Choose which optional cookies you would like to allow.')
    );
    var categoryList = createElement('div', 'palmer-cookie__categories');
    var switches = {};

    CATEGORIES.forEach(function (category) {
      var item = createElement('div', 'palmer-cookie__category');
      var categoryCopy = createElement('div', 'palmer-cookie__category-copy');
      categoryCopy.appendChild(createElement('h3', 'palmer-cookie__category-title', category.label));
      categoryCopy.appendChild(createElement('p', 'palmer-cookie__category-description', category.description));
      item.appendChild(categoryCopy);

      var switchButton = createElement('button', 'palmer-cookie__switch');
      switchButton.type = 'button';
      switchButton.setAttribute('role', 'switch');
      switchButton.setAttribute('aria-label', category.label + ' cookies');
      switchButton.dataset.category = category.key;
      if (category.required) {
        switchButton.disabled = true;
        switchButton.setAttribute('aria-disabled', 'true');
      }
      var switchThumb = createElement('span', 'palmer-cookie__switch-thumb');
      switchThumb.setAttribute('aria-hidden', 'true');
      switchButton.appendChild(switchThumb);
      switches[category.key] = switchButton;
      item.appendChild(switchButton);
      categoryList.appendChild(item);
    });
    customizePanel.appendChild(categoryList);
    panels.consent.appendChild(customizePanel);

    var aboutTitle = createElement('h2', 'palmer-cookie__title', 'About cookies');
    panels.about.appendChild(aboutTitle);
    panels.about.appendChild(
      createElement(
        'p',
        'palmer-cookie__description',
        'Cookies are small text files stored on your device. They help this website remember your preferences and understand which parts of the site are useful to visitors.'
      )
    );
    panels.about.appendChild(
      createElement(
        'p',
        'palmer-cookie__description',
        'You can change your choices at any time by returning to this cookie notice. Necessary cookies are always enabled because they keep the site secure and usable.'
      )
    );

    var detailsTitle = createElement('h2', 'palmer-cookie__title', 'Cookie details');
    panels.details.appendChild(detailsTitle);
    var detailsList = createElement('div', 'palmer-cookie__details');
    CATEGORIES.forEach(function (category) {
      var row = createElement('div', 'palmer-cookie__details-row');
      row.appendChild(createElement('strong', 'palmer-cookie__details-label', category.label));
      row.appendChild(createElement('span', 'palmer-cookie__details-value', category.required ? 'Always active' : 'Optional'));
      detailsList.appendChild(row);
    });
    panels.details.appendChild(detailsList);

    var actions = createElement('footer', 'palmer-cookie__actions');
    var rejectButton = createElement('button', 'palmer-cookie__button palmer-cookie__button--secondary', 'Reject all');
    var customizeButton = createElement('button', 'palmer-cookie__button palmer-cookie__button--secondary', 'Customize');
    var acceptButton = createElement('button', 'palmer-cookie__button palmer-cookie__button--primary', 'Accept all');
    [rejectButton, customizeButton, acceptButton].forEach(function (button) {
      button.type = 'button';
      actions.appendChild(button);
    });
    var saveButton = createElement('button', 'palmer-cookie__button palmer-cookie__button--primary palmer-cookie__button--save', 'Save preferences');
    saveButton.type = 'button';
    actions.appendChild(saveButton);
    dialog.appendChild(actions);

    var body = document.body || document.documentElement;
    body.appendChild(rootElement);

    function setBodyLock(locked) {
      if (!body || !body.classList) return;
      body.classList.toggle('palmer-cookie-open', locked);
    }

    function refreshSwitches() {
      CATEGORIES.forEach(function (category) {
        var switchButton = switches[category.key];
        var checked = Boolean(values[category.key]);
        switchButton.setAttribute('aria-checked', String(checked));
        switchButton.classList.toggle('is-checked', checked);
      });
    }

    function refreshTabs() {
      Object.keys(tabButtons).forEach(function (tabName) {
        var active = currentTab === tabName;
        tabButtons[tabName].setAttribute('aria-selected', String(active));
        tabButtons[tabName].tabIndex = active ? 0 : -1;
        panels[tabName].hidden = !active;
      });
    }

    function setCustomizing(show) {
      customizing = Boolean(show);
      rootElement.classList.toggle('is-customizing', customizing);
      customizePanel.hidden = !customizing;
      saveButton.hidden = !customizing;
      customizeButton.hidden = customizing;
      refreshSwitches();
    }

    function setTab(tabName) {
      if (!panels[tabName]) return;
      currentTab = tabName;
      refreshTabs();
      if (tabName !== 'consent') setCustomizing(false);
    }

    function finish(action) {
      if (destroyed) return null;
      var payload = saveConsent(storage, values, action);
      close();
      return payload;
    }

    function open() {
      if (destroyed) return controller;
      rootElement.hidden = false;
      setBodyLock(true);
      currentTab = 'consent';
      setCustomizing(false);
      refreshTabs();
      refreshSwitches();
      rootElement.classList.remove('is-leaving');
      var reveal = function () {
        rootElement.classList.add('is-visible');
        dialog.focus();
      };
      if (typeof root.requestAnimationFrame === 'function') root.requestAnimationFrame(reveal);
      else reveal();
      return controller;
    }

    function close() {
      if (destroyed) return controller;
      rootElement.classList.remove('is-visible');
      rootElement.classList.add('is-leaving');
      setBodyLock(false);
      var finishClose = function () {
        if (!destroyed) rootElement.hidden = true;
      };
      if (root.setTimeout) root.setTimeout(finishClose, 180);
      else finishClose();
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
      return controller;
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      setBodyLock(false);
      if (typeof rootElement.remove === 'function') rootElement.remove();
      else if (rootElement.parentNode) rootElement.parentNode.removeChild(rootElement);
      if (activeController === controller) activeController = null;
    }

    Object.keys(tabButtons).forEach(function (tabName) {
      tabButtons[tabName].addEventListener('click', function () {
        setTab(tabName);
      });
    });

    Object.keys(switches).forEach(function (categoryKey) {
      switches[categoryKey].addEventListener('click', function () {
        if (switches[categoryKey].disabled) return;
        values[categoryKey] = !values[categoryKey];
        refreshSwitches();
      });
    });

    rejectButton.addEventListener('click', function () {
      values.preferences = false;
      values.statistics = false;
      values.marketing = false;
      finish('reject');
    });
    acceptButton.addEventListener('click', function () {
      values.preferences = true;
      values.statistics = true;
      values.marketing = true;
      finish('accept');
    });
    customizeButton.addEventListener('click', function () {
      setTab('consent');
      setCustomizing(true);
      customizeTitle.focus && customizeTitle.focus();
    });
    saveButton.addEventListener('click', function () {
      finish('customize');
    });

    refreshTabs();
    refreshSwitches();
    setCustomizing(false);

    var controller = {
      open: open,
      close: close,
      destroy: destroy,
      getConsent: function () {
        return readSavedConsent(storage);
      },
      element: rootElement
    };

    if (!rootElement.hidden) {
      open();
    }

    return controller;
  }

  function initCookieNotice(options) {
    if (activeController && activeController.element && activeController.element.isConnected) {
      return activeController;
    }
    activeController = makeConsentNotice(options);
    return activeController;
  }

  root.initCookieNotice = initCookieNotice;
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : null);
