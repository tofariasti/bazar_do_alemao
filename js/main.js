(function () {
  "use strict";

  var WHATSAPP_NUMBER = "5551981335930";

  var WHATSAPP_INTENTS = {
    default: "Olá! Vi o site do Bazar do Alemão e gostaria de mais informações.",
    promocoes: "Olá! Quero saber as promoções e ofertas da semana no Bazar do Alemão.",
    disponibilidade:
      "Olá! Gostaria de saber se vocês têm o seguinte produto disponível: ",
    endereco:
      "Olá! Poderia confirmar o endereço e horário de funcionamento da loja?",
    atendimento: "Olá! Preciso de ajuda com um produto no Bazar do Alemão.",
    "oferta-utilidades":
      "Olá! Vi a oferta de utilidades para casa no site e gostaria de mais informações.",
    "oferta-decoracao":
      "Olá! Vi a oferta de decoração e presentes no site e gostaria de mais informações.",
    "oferta-brinquedos":
      "Olá! Vi a oferta de brinquedos no site e gostaria de saber o que há disponível.",
  };

  function buildWhatsAppUrl(intentKey) {
    var message =
      WHATSAPP_INTENTS[intentKey] || WHATSAPP_INTENTS.default;
    return (
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(message)
    );
  }

  function bindWhatsApp(el) {
    var intent = el.getAttribute("data-whatsapp-intent") || "default";
    el.setAttribute("href", buildWhatsAppUrl(intent));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  }

  document.querySelectorAll("[data-whatsapp-intent]").forEach(bindWhatsApp);

  document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
    if (!el.hasAttribute("data-whatsapp-intent")) {
      el.setAttribute("data-whatsapp-intent", "default");
    }
    bindWhatsApp(el);
  });

  var yearEl = document.getElementById("ano-atual");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.querySelector(".site-nav");

  function setNavOpen(isOpen) {
    navToggle.setAttribute("aria-expanded", String(isOpen));
    siteNav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Fechar menu" : "Abrir menu"
    );
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      setNavOpen(!expanded);
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
        setNavOpen(false);
      }
    });
  }

  function getStoreStatus() {
    var now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    var day = now.getDay();
    var minutes = now.getHours() * 60 + now.getMinutes();
    var openMin;
    var closeMin;

    if (day === 0) {
      openMin = 9 * 60;
      closeMin = 17 * 60 + 30;
    } else {
      openMin = 9 * 60;
      closeMin = 20 * 60;
    }

    var isOpen = minutes >= openMin && minutes < closeMin;
    return { isOpen: isOpen, day: day };
  }

  function updateOpenStatus() {
    var badge = document.getElementById("status-loja");
    var text = document.getElementById("status-text");
    if (!badge || !text) return;

    var status = getStoreStatus();
    badge.hidden = false;
    badge.classList.remove("is-open", "is-closed");

    if (status.isOpen) {
      badge.classList.add("is-open");
      text.textContent = "Aberto agora";
    } else {
      badge.classList.add("is-closed");
      if (status.day === 0) {
        text.textContent = "Fechado — domingo abre 9h";
      } else if (status.day === 6) {
        text.textContent = "Fechado — sábado abre 9h";
      } else {
        text.textContent = "Fechado — abrimos às 9h";
      }
    }
  }

  updateOpenStatus();

  function renderOfertas(ofertas) {
    var grid = document.getElementById("ofertas-grid");
    if (!grid || !ofertas.length) return;

    grid.innerHTML = "";

    ofertas.forEach(function (oferta) {
      var li = document.createElement("li");
      li.className = "offer-card";
      li.innerHTML =
        '<div class="offer-card-media">' +
        '<img src="' +
        oferta.imagem +
        '" alt="Oferta: ' +
        oferta.titulo +
        '" width="400" height="300" loading="lazy" decoding="async">' +
        '<span class="offer-card-badge">Oferta da semana</span>' +
        "</div>" +
        '<div class="offer-card-body">' +
        "<h3>" +
        oferta.titulo +
        "</h3>" +
        "<p>" +
        oferta.descricao +
        "</p>" +
        '<a class="btn btn-whatsapp btn-sm" href="#" data-whatsapp-intent="' +
        oferta.intent +
        '">Pedir no WhatsApp</a>' +
        "</div>";
      grid.appendChild(li);
      bindWhatsApp(li.querySelector("[data-whatsapp-intent]"));
    });

    refreshOffersCarousel();
  }

  var offersCarouselState = null;

  function getOffersCarouselSlides() {
    var track = document.getElementById("ofertas-grid");
    if (!track) return [];
    return Array.prototype.slice.call(track.querySelectorAll(".offer-card"));
  }

  function refreshOffersCarousel() {
    if (!offersCarouselState) return;
    offersCarouselState.slides = getOffersCarouselSlides();
    offersCarouselState.buildDots();
    offersCarouselState.scrollToIndex(0, false);
    offersCarouselState.updateUI();
  }

  function initOffersCarousel() {
    var root = document.getElementById("offers-carousel");
    var viewport = document.getElementById("ofertas-carousel-viewport");
    var dotsContainer = document.getElementById("ofertas-carousel-dots");
    if (!root || !viewport || !dotsContainer) return;

    if (offersCarouselState) {
      refreshOffersCarousel();
      return;
    }

    var prevBtn = root.querySelector(".offers-carousel-btn--prev");
    var nextBtn = root.querySelector(".offers-carousel-btn--next");
    var currentIndex = 0;
    var scrollTimer;

    function getSlides() {
      return offersCarouselState
        ? offersCarouselState.slides
        : getOffersCarouselSlides();
    }

    function getClosestIndex() {
      var slides = getSlides();
      if (!slides.length) return 0;

      var viewportRect = viewport.getBoundingClientRect();
      var center = viewportRect.left + viewportRect.width / 2;
      var closest = 0;
      var minDist = Infinity;

      slides.forEach(function (slide, i) {
        var rect = slide.getBoundingClientRect();
        var slideCenter = rect.left + rect.width / 2;
        var dist = Math.abs(slideCenter - center);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });

      return closest;
    }

    function scrollToIndex(index, smooth) {
      var slides = getSlides();
      if (!slides.length) return;

      currentIndex = Math.max(0, Math.min(index, slides.length - 1));
      slides[currentIndex].scrollIntoView({
        behavior: smooth === false ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
      updateUI();
    }

    function buildDots() {
      var slides = getSlides();
      dotsContainer.innerHTML = "";

      slides.forEach(function (_slide, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "offers-carousel-dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Oferta " + (i + 1) + " de " + slides.length);
        dot.addEventListener("click", function () {
          scrollToIndex(i, true);
        });
        dotsContainer.appendChild(dot);
      });
    }

    function updateUI() {
      var slides = getSlides();
      if (!slides.length) return;

      currentIndex = getClosestIndex();
      var dots = dotsContainer.querySelectorAll(".offers-carousel-dot");

      dots.forEach(function (dot, i) {
        var isActive = i === currentIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      if (prevBtn) prevBtn.disabled = currentIndex <= 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= slides.length - 1;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        scrollToIndex(currentIndex - 1, true);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        scrollToIndex(currentIndex + 1, true);
      });
    }

    viewport.addEventListener("scroll", function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateUI, 80);
    });

    viewport.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToIndex(currentIndex - 1, true);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollToIndex(currentIndex + 1, true);
      }
    });

    offersCarouselState = {
      slides: getOffersCarouselSlides(),
      buildDots: buildDots,
      scrollToIndex: scrollToIndex,
      updateUI: updateUI,
    };

    buildDots();
    updateUI();
  }

  initOffersCarousel();

  function reviewInitials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0);
      })
      .join("")
      .toUpperCase();
  }

  function renderDepoimentos(lista) {
    var grid = document.getElementById("depoimentos-grid");
    if (!grid || !lista.length) return;

    grid.innerHTML = "";

    lista.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "review-card";
      li.innerHTML =
        '<div class="review-card-header">' +
        '<span class="review-avatar" aria-hidden="true">' +
        reviewInitials(item.nome) +
        "</span>" +
        '<div class="review-meta">' +
        '<p class="review-name">' +
        item.nome +
        "</p>" +
        '<p class="review-badge">' +
        item.meta +
        "</p>" +
        "</div>" +
        "</div>" +
        '<div class="review-stars" role="img" aria-label="' +
        item.estrelas +
        ' de 5 estrelas">' +
        "★★★★★".slice(0, item.estrelas) +
        "</div>" +
        '<p class="review-when">' +
        item.quando +
        "</p>" +
        '<blockquote class="review-text"><p>' +
        item.texto +
        "</p></blockquote>" +
        '<p class="review-source">Avaliação no Google</p>';
      grid.appendChild(li);
    });
  }

  function formatDateBr(iso) {
    if (!iso) return "";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  fetch("assets/catalogo.json")
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (catalogo) {
      if (!catalogo) return;

      var download = document.getElementById("catalogo-download");
      if (download && catalogo.arquivo) {
        download.href = catalogo.arquivo;
        if (catalogo.nomeDownload) {
          download.setAttribute("download", catalogo.nomeDownload);
        }
      }

      var tamanho = document.getElementById("catalogo-tamanho");
      if (tamanho && catalogo.tamanhoKb) {
        tamanho.textContent = "PDF · " + catalogo.tamanhoKb + " KB";
      }

      var atualizado = document.getElementById("catalogo-atualizado");
      if (atualizado && catalogo.atualizadoEm) {
        atualizado.textContent = "Atualizado em " + formatDateBr(catalogo.atualizadoEm);
      }

      var titulo = document.getElementById("catalogo-title");
      if (titulo && catalogo.titulo) {
        titulo.textContent = "Baixar " + catalogo.titulo.toLowerCase() + " (PDF)";
      }
    })
    .catch(function () {});

  fetch("assets/depoimentos.json")
    .then(function (res) {
      if (!res.ok) throw new Error("depoimentos");
      return res.json();
    })
    .then(renderDepoimentos)
    .catch(function () {});

  fetch("assets/ofertas.json")
    .then(function (res) {
      if (!res.ok) throw new Error("ofertas");
      return res.json();
    })
    .then(renderOfertas)
    .catch(function () {
      /* HTML estático de fallback permanece se fetch falhar (ex.: file://) */
      refreshOffersCarousel();
    });

  function resolveSiteBase(config) {
    if (config && config.canonicalUrl) {
      return config.canonicalUrl.replace(/\/?$/, "/");
    }
    if (config && config.siteUrl && config.siteUrl.indexOf("instagram.com") === -1) {
      return config.siteUrl.replace(/\/?$/, "/");
    }
    if (location.protocol === "http:" || location.protocol === "https:") {
      return location.origin + "/";
    }
    return "";
  }

  function absoluteFromBase(base, path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    if (!base) return path;
    try {
      return new URL(path, base).href;
    } catch (err) {
      return path;
    }
  }

  function setMetaContent(selector, value) {
    if (!value) return;
    var el = document.querySelector(selector);
    if (el) el.setAttribute("content", value);
  }

  function applySeo(config) {
    var base = resolveSiteBase(config);
    var seo = (config && config.seo) || {};
    var ogImagePath = seo.ogImage || "assets/images/instagram/post-1.jpg";
    var ogImageAbs = absoluteFromBase(base, ogImagePath);

    if (base) {
      var canonical = document.getElementById("seo-canonical");
      if (canonical) canonical.setAttribute("href", base);

      setMetaContent("#seo-og-url", base);
    }

    if (ogImageAbs) {
      setMetaContent("#seo-og-image", ogImageAbs);
      setMetaContent("#seo-twitter-image", ogImageAbs);
    }

    if (seo.twitterSite) {
      setMetaContent('meta[name="twitter:site"]', seo.twitterSite);
    }

    var jsonLdEl = document.getElementById("seo-jsonld");
    if (jsonLdEl && base) {
      try {
        var data = JSON.parse(jsonLdEl.textContent);
        var graph = data["@graph"];
        if (graph) {
          graph.forEach(function (node) {
            if (node.url === "/") node.url = base;
            if (node["@id"] === "#website") node.url = base;
            if (node["@id"] === "#store") {
              node.url = base;
              if (node.image && node.image.indexOf("http") !== 0) {
                node.image = absoluteFromBase(base, node.image);
              }
              if (node.logo && node.logo.indexOf("http") !== 0) {
                node.logo = absoluteFromBase(base, node.logo);
              }
              if (config.googleMapsUrl) {
                node.hasMap = config.googleMapsUrl;
              }
            }
            if (node["@id"] === "#webpage") {
              node.url = base;
              if (node.primaryImageOfPage && node.primaryImageOfPage.indexOf("http") !== 0) {
                node.primaryImageOfPage = absoluteFromBase(base, node.primaryImageOfPage);
              }
            }
          });
          jsonLdEl.textContent = JSON.stringify(data);
        }
      } catch (err) {
        /* JSON-LD estático permanece */
      }
    }
  }

  var qrCaption = document.getElementById("qr-site-url");
  fetch("assets/site-config.json")
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (config) {
      if (!config) return;

      applySeo(config);

      if (qrCaption && config.siteUrl) {
        qrCaption.textContent = config.siteUrl;
      }

      if (config.googleReviewUrl) {
        document.querySelectorAll(".js-google-review").forEach(function (btn) {
          btn.href = config.googleReviewUrl;
        });
      }
    })
    .catch(function () {
      applySeo(null);
    });
})();
