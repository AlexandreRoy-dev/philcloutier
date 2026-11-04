import fs from "node:fs";
import path from "node:path";

const SITE = "https://philippecloutier.net";

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FONT_STYLESHEET = "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Outfit:wght@300;400;500;600&display=swap";

const AGENT = {
  "@type": ["RealEstateAgent", "LocalBusiness"],
  "@id": SITE + "/#agent",
  name: "Philippe Cloutier",
  url: SITE + "/",
  image: [SITE + "/assets/portrait.webp", SITE + "/og-image.jpg"],
  description: "Courtier immobilier résidentiel RE/MAX CRYSTAL à Saint-Eustache. Achat, vente et évaluation sur la Rive-Nord, dans les Laurentides, Lanaudière et Laval.",
  telephone: ["+1-438-495-4079", "+1-450-472-7220"],
  email: "philippe.cloutier@equipelamarche.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "479 Bd Arthur-Sauvé, Local 101",
    addressLocality: "Saint-Eustache",
    addressRegion: "QC",
    postalCode: "J7P 2B3",
    addressCountry: "CA"
  },
  geo: { "@type": "GeoCoordinates", latitude: 45.565, longitude: -73.905 },
  areaServed: [
    "Saint-Eustache",
    "Sainte-Thérèse",
    "Deux-Montagnes",
    "Boisbriand",
    "Blainville",
    "Mirabel",
    "Terrebonne",
    "Laurentides",
    "Lanaudière",
    "Laval"
  ].map((name) => ({ "@type": "AdministrativeArea", name })),
  knowsLanguage: ["fr-CA", "en"],
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "license",
    identifier: "J4384",
    recognizedBy: { "@type": "Organization", name: "OACIQ", url: "https://www.oaciq.com/" }
  },
  memberOf: { "@type": "Organization", name: "Équipe Lamarche Troini", url: "https://equipelt.com/" },
  parentOrganization: { "@type": "Organization", name: "RE/MAX CRYSTAL", url: "https://www.remax-quebec.com/", identifier: "A2944" },
  sameAs: [
    "https://www.facebook.com/profile.php?id=61580330362343",
    "https://www.instagram.com/philippe_cloutier_/",
    "https://www.remax-quebec.com/fr/courtiers-immobiliers/philippe.cloutier",
    "https://equipelt.com/"
  ]
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": SITE + "/#website",
  url: SITE + "/",
  name: "Philippe Cloutier, courtier immobilier",
  inLanguage: "fr-CA",
  publisher: { "@id": SITE + "/#agent" }
};

function graph(nodes) {
  return { "@context": "https://schema.org", "@graph": [WEBSITE, AGENT, ...nodes] };
}

function breadcrumb(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

function head(options) {
  const image = options.image || SITE + "/og-image.jpg";
  const imageAlt = options.imageAlt || "Philippe Cloutier, courtier immobilier RE/MAX CRYSTAL à Saint-Eustache";
  const blocks = options.jsonLd || [];
  const json = blocks.map((block) => `<script type="application/ld+json">\n${JSON.stringify(block)}\n</script>`).join("\n");
  const robots = options.robots ? `<meta name="robots" content="${esc(options.robots)}">` : "";
  return `<!DOCTYPE html>
<html lang="fr-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(options.title)}</title>
  <meta name="description" content="${esc(options.description)}">
  ${robots}
  <link rel="canonical" href="${esc(options.canonical)}">
  <link rel="alternate" hreflang="fr-CA" href="${esc(options.canonical)}">
  <link rel="alternate" hreflang="x-default" href="${esc(options.canonical)}">
  <meta name="theme-color" content="#161411">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta property="og:title" content="${esc(options.title)}">
  <meta property="og:description" content="${esc(options.description)}">
  <meta property="og:type" content="${options.ogType || "website"}">
  <meta property="og:locale" content="fr_CA">
  <meta property="og:site_name" content="Philippe Cloutier">
  <meta property="og:url" content="${esc(options.canonical)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:image:alt" content="${esc(imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(options.title)}">
  <meta name="twitter:description" content="${esc(options.description)}">
  <meta name="twitter:image" content="${esc(image)}">
  <meta name="twitter:image:alt" content="${esc(imageAlt)}">
  ${json}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="${FONT_STYLESHEET}" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="${FONT_STYLESHEET}"></noscript>
  <link rel="stylesheet" href="/assets/site.css">
</head>`;
}

function header(solid) {
  return `<a class="skip" href="#contenu">Aller au contenu</a>
<div class="atmosphere" aria-hidden="true"><span class="orb orb-a"></span><span class="orb orb-b"></span></div>
<div class="page">
<header class="nav${solid ? " nav-solid" : ""}" id="nav">
  <div class="nav-inner">
    <a class="brand" href="/">
      <img class="brand-logo brand-logo-light" src="/logo_remax_crystal_fond_noir.png" alt="RE/MAX CRYSTAL" width="500" height="208">
      <img class="brand-logo brand-logo-dark" src="/crystal-supp-noir-diamand.png" alt="" width="1600" height="712">
      <span class="brand-name">Philippe Cloutier</span>
    </a>
    <nav class="nav-links" aria-label="Principal">
      <a href="/proprietes/">Propriétés</a>
      <a href="/#a-propos">À propos</a>
      <a href="/#services">Services</a>
      <a href="/#temoignages">Témoignages</a>
      <a href="/#contact">Contact</a>
    </nav>
    <a class="nav-phone desk" href="tel:+14384954079">(438) 495-4079</a>
    <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-panel" aria-label="Ouvrir le menu"><span></span><span></span></button>
  </div>
</header>
<div class="nav-panel" id="nav-panel" hidden>
  <a href="/proprietes/">Propriétés</a>
  <a href="/#a-propos">À propos</a>
  <a href="/#services">Services</a>
  <a href="/#temoignages">Témoignages</a>
  <a href="/#contact">Contact</a>
  <a class="nav-phone" href="tel:+14384954079">(438) 495-4079</a>
</div>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap-wide footer-grid">
    <div>
      <img class="footer-logo" src="/logo_remax_crystal_fond_noir.png" alt="RE/MAX CRYSTAL" width="500" height="208" loading="lazy" decoding="async">
      <p>Philippe Cloutier, courtier immobilier résidentiel affilié à RE/MAX CRYSTAL et à l'Équipe Lamarche Troini. Saint-Eustache, Laurentides, Lanaudière et Laval.</p>
    </div>
    <div class="footer-links">
      <a href="/proprietes/">Propriétés</a>
      <a href="/#services">Services</a>
      <a href="/#contact">Contact</a>
      <a href="/politique-confidentialite.html">Politique de confidentialité</a>
    </div>
    <div class="footer-links">
      <a href="tel:+14384954079">(438) 495-4079</a>
      <a href="mailto:philippe.cloutier@equipelamarche.com">philippe.cloutier@equipelamarche.com</a>
      <a href="https://www.facebook.com/profile.php?id=61580330362343" rel="noopener me">Facebook</a>
      <a href="https://www.instagram.com/philippe_cloutier_/" rel="noopener me">Instagram</a>
    </div>
  </div>
  <div class="wrap-wide">
    <p class="fine">Chaque bureau est indépendant et autonome. / Each Office Is Independently Owned and Operated.</p>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Philippe Cloutier</span>
      <span>Roy Marketing</span>
    </div>
  </div>
</footer>
</div>
<div class="cookie" id="cookie-banner" role="dialog" aria-label="Consentement aux témoins">
  <div class="cookie-inner">
    <p>Ce site utilise des témoins essentiels et, avec votre consentement, des témoins d'analyse. Consultez la <a href="/politique-confidentialite.html">politique de confidentialité</a>.</p>
    <div class="cookie-actions">
      <button type="button" id="cookie-reject">Refuser</button>
      <button type="button" class="cookie-accept" id="cookie-accept">Accepter</button>
    </div>
  </div>
</div>
<script src="/assets/site.js" defer></script>
</body>
</html>`;
}

function excerpt(text, max) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return (space > 80 ? cut.slice(0, space) : cut).trim() + "…";
}

function clock(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("fr-CA", {
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Toronto"
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour");
  const minute = parts.find((part) => part.type === "minute");
  if (!hour) return null;
  if (!minute || minute.value === "00") return hour.value + " h";
  return hour.value + " h " + minute.value;
}

function dayLabel(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Toronto"
  }).format(date);
}

function openHouseLine(openHouse) {
  if (!openHouse) return "";
  const startDay = openHouse.from ? dayLabel(openHouse.from) : null;
  const endDay = openHouse.to ? dayLabel(openHouse.to) : null;
  const startTime = openHouse.from ? clock(openHouse.from) : null;
  const endTime = openHouse.to ? clock(openHouse.to) : null;
  let when = "";
  if (startDay && startTime && endTime && startDay === endDay) when = startDay + ", " + startTime + " à " + endTime;
  else if (startDay && startTime && endDay && endTime) when = startDay + ", " + startTime + " au " + endDay + ", " + endTime;
  else if (startDay) when = startDay;
  if (when) return when.charAt(0).toUpperCase() + when.slice(1);
  return openHouse.label || "";
}

function metaLine(listing) {
  return [listing.propertyKind, listing.bedrooms, listing.bathrooms].filter(Boolean).join(" · ");
}

function cardAlt(listing) {
  return [listing.address, listing.city].filter(Boolean).join(", ") || "Propriété";
}

export function cardHtml(listing, eager) {
  const photo = listing.photos[0];
  const statusClass = listing.status === "vendu" ? " card-status badge-sold" : " card-status";
  const open = listing.openHouse ? `<p class="card-note">${esc(listing.openHouse.label || listing.openHouse.text)}</p>` : "";
  return `<article class="card" data-city="${esc(listing.city || "")}" data-kind="${esc(listing.propertyKind || "")}" data-status="${esc(listing.status)}" data-open-house="${listing.openHouse ? "1" : "0"}" data-price="${listing.priceKind === "sale" && listing.priceAmount != null ? esc(listing.priceAmount) : ""}" data-price-kind="${esc(listing.priceKind)}">
  <a class="card-media" href="/proprietes/${esc(listing.id)}/">
    ${photo ? `<img src="${esc(photo.medium)}" alt="${esc(cardAlt(listing))}" width="960" height="720"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">` : ""}
    <span class="${statusClass.trim()}">${esc(listing.statusLabel)}</span>
  </a>
  <div class="card-body">
    ${listing.priceDisplay ? `<p class="card-price">${esc(listing.priceDisplay)}</p>` : ""}
    <h3><a href="/proprietes/${esc(listing.id)}/">${esc(listing.address || "Propriété")}</a></h3>
    ${listing.city ? `<p class="card-city">${esc(listing.city)}</p>` : ""}
    ${metaLine(listing) ? `<p class="card-meta">${esc(metaLine(listing))}</p>` : ""}
    ${open}
    <div class="card-foot">
      <span class="card-mls">Centris ${esc(listing.centris)}</span>
      <a class="text-link" href="${esc(listing.listingUrl)}" target="_blank" rel="noopener">Fiche RE/MAX</a>
    </div>
  </div>
</article>`;
}

export function featuredHtml(listings) {
  const featured = listings.filter((item) => item.status !== "a-louer").slice(0, 3);
  const chosen = featured.length ? featured : listings.slice(0, 3);
  if (!chosen.length) {
    return `<p class="lede">Les inscriptions seront affichées ici dès que la page courtier RE/MAX répond.</p>`;
  }
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Propriétés en cours de Philippe Cloutier",
    itemListElement: chosen.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: SITE + "/proprietes/" + item.id + "/",
      name: [item.address, item.city].filter(Boolean).join(", ")
    }))
  };
  return `<div class="feature-grid" data-anim>\n${chosen.map((item, index) => cardHtml(item, index === 0)).join("\n")}\n</div>\n<script type="application/ld+json">\n${JSON.stringify(list)}\n</script>`;
}

function options(values) {
  return values
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index)
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((value) => `<option value="${esc(value)}">${esc(value)}</option>`)
    .join("");
}

function residenceType(listing) {
  const blob = `${listing.propertyKind || ""} ${listing.propertyType || ""}`;
  if (/condo|appartement/i.test(blob)) return "Apartment";
  if (/détaché|detache|isolé|isole/i.test(blob)) return "SingleFamilyResidence";
  return "House";
}

function listingStatusPhrase(listing) {
  if (listing.status === "a-louer") return "à louer";
  if (listing.status === "vendu") return "vendue";
  return "à vendre";
}

function listingTitle(listing) {
  const kind = listing.propertyKind || "Propriété";
  const place = listing.city || "Québec";
  const address = listing.address || listing.centris;
  const price = listing.priceDisplay ? " | " + listing.priceDisplay : "";
  return `${kind} ${listingStatusPhrase(listing)} à ${place} | ${address}${price}`;
}

function listingDescription(listing) {
  const kind = listing.propertyKind || "Propriété";
  let sentence = `${kind} ${listingStatusPhrase(listing)}`;
  if (listing.address) sentence += " au " + listing.address;
  if (listing.city) sentence += ", " + listing.city;
  sentence += ".";
  if (listing.priceDisplay) sentence += " " + listing.priceDisplay + ".";
  sentence += ` Centris ${listing.centris}. Courtier Philippe Cloutier, RE/MAX CRYSTAL à Saint-Eustache.`;
  return excerpt(sentence, 170);
}

function photoAlt(listing, photo) {
  const place = [listing.address, listing.city].filter(Boolean).join(", ");
  const label = photo && photo.alt ? photo.alt : "";
  if (label && place && !label.includes(place)) return label + ", " + place;
  return label || place || "Photo de la propriété";
}

function listingSchema(listing) {
  const name = [listing.address, listing.city].filter(Boolean).join(", ");
  const about = {
    "@type": residenceType(listing),
    name: name || listing.centris,
    address: {
      "@type": "PostalAddress",
      streetAddress: [listing.streetNumber, listing.streetName, listing.unit ? "app. " + listing.unit : ""].filter(Boolean).join(" ") || undefined,
      addressLocality: listing.city || undefined,
      postalCode: listing.postalCode || undefined,
      addressRegion: "QC",
      addressCountry: "CA"
    }
  };
  if (listing.bedroomsCount) about.numberOfBedrooms = listing.bedroomsCount;
  if (listing.bathroomsCount) about.numberOfBathroomsTotal = listing.bathroomsCount;
  if (listing.showMap) {
    about.geo = { "@type": "GeoCoordinates", latitude: listing.latitude, longitude: listing.longitude };
  }
  const schema = {
    "@type": "RealEstateListing",
    name: name || "Propriété " + listing.centris,
    url: SITE + "/proprietes/" + listing.id + "/",
    identifier: listing.centris,
    inLanguage: "fr-CA",
    image: listing.photos.slice(0, 8).map((photo) => photo.large),
    about,
    provider: { "@id": SITE + "/#agent" }
  };
  if (listing.descriptionText) schema.description = excerpt(listing.descriptionText, 400);
  if (listing.priceAmount != null) {
    schema.offers = {
      "@type": "Offer",
      price: listing.priceAmount,
      priceCurrency: "CAD",
      availability: listing.status === "vendu" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: listing.listingUrl
    };
    if (listing.priceKind === "rent") {
      schema.offers.priceSpecification = {
        "@type": "UnitPriceSpecification",
        price: listing.priceAmount,
        priceCurrency: "CAD",
        unitText: "MONTH"
      };
    }
  }
  if (listing.datePosted && !Number.isNaN(new Date(listing.datePosted).getTime())) schema.datePosted = listing.datePosted;
  return schema;
}

function activeCities(listings) {
  return [...new Set(listings.filter((item) => item.status !== "vendu" && item.city).map((item) => item.city))].sort((a, b) =>
    a.localeCompare(b, "fr")
  );
}

export function townsHtml(listings) {
  const cities = activeCities(listings);
  if (!cities.length) return "";
  return `<ul class="town-links">\n${cities
    .map((city) => `<li><a href="/proprietes/?ville=${encodeURIComponent(city)}">${esc(city)}</a></li>`)
    .join("\n")}\n</ul>`;
}

export function renderPropertiesPage(listings, syncedAt) {
  const cities = options(listings.map((item) => item.city));
  const kinds = options(listings.map((item) => item.propertyKind));
  const hasOpen = listings.some((item) => item.openHouse);
  const statuses = [
    ["a-vendre", "À vendre"],
    ["a-louer", "À louer"],
    ["vendu", "Vendu"]
  ].filter(([value]) => listings.some((item) => item.status === value));
  if (hasOpen) statuses.push(["visite-libre", "Visite libre"]);
  const when = syncedAt
    ? new Intl.DateTimeFormat("fr-CA", { dateStyle: "long", timeStyle: "short", timeZone: "America/Toronto" }).format(new Date(syncedAt))
    : null;
  const itemList = {
    "@type": "ItemList",
    name: "Propriétés de Philippe Cloutier",
    numberOfItems: listings.length,
    itemListElement: listings.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: SITE + "/proprietes/" + item.id + "/",
      name: [item.address, item.city].filter(Boolean).join(", ")
    }))
  };
  const cityNames = activeCities(listings);
  const propertiesDescription = excerpt(
    "Propriétés à vendre et à louer de Philippe Cloutier, courtier immobilier RE/MAX CRYSTAL à Saint-Eustache" +
      (cityNames.length ? " : " + cityNames.join(", ") : "") +
      ". Chaque fiche mène à l'annonce RE/MAX.",
    170
  );
  return `${head({
    title: "Propriétés à vendre | Philippe Cloutier, RE/MAX Saint-Eustache",
    description: propertiesDescription,
    canonical: SITE + "/proprietes/",
    imageAlt: "Propriétés affichées par Philippe Cloutier, courtier RE/MAX CRYSTAL",
    jsonLd: [
      graph([
        breadcrumb([
          { name: "Accueil", url: SITE + "/" },
          { name: "Propriétés", url: SITE + "/proprietes/" }
        ]),
        itemList
      ])
    ]
  })}
<body>
${header(true)}
<main id="contenu">
  <section class="page-hero">
    <div class="wrap">
      <p class="crumbs"><a href="/">Accueil</a> / Propriétés</p>
      <p class="eyebrow">RE/MAX Québec</p>
      <h1>Propriétés affichées par Philippe Cloutier</h1>
      <p class="lede" style="margin-top:1.25rem">Les données proviennent de sa page courtier RE/MAX. Chaque fiche renvoie vers l'annonce officielle. ${when ? "Dernière synchronisation : " + esc(when) + "." : ""}</p>
    </div>
  </section>
  <section class="section-tight">
    <div class="wrap-wide">
      <form class="filters" id="filters" action="/proprietes/" method="get">
        <label>Ville
          <select id="filter-city" name="ville"><option value="">Toutes</option>${cities}</select>
        </label>
        <label>Type
          <select id="filter-kind" name="type"><option value="">Tous</option>${kinds}</select>
        </label>
        <label>Statut
          <select id="filter-status" name="statut"><option value="">Tous</option>${statuses.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join("")}</select>
        </label>
        <label>Prix
          <select id="filter-price" name="prix">
            <option value="">Tous les prix</option>
            <option value="0-400000">Moins de 400 000 $</option>
            <option value="400000-600000">400 000 $ à 600 000 $</option>
            <option value="600000-800000">600 000 $ à 800 000 $</option>
            <option value="800000-">800 000 $ et plus</option>
          </select>
        </label>
        <button type="button" id="filter-reset">Réinitialiser</button>
      </form>
      <p class="result-count" id="result-count">${listings.length} propriété${listings.length > 1 ? "s" : ""}</p>
      <div class="listing-grid" data-listing-grid>
        ${listings.map((item) => cardHtml(item, false)).join("\n")}
      </div>
      <p class="empty" id="listing-empty" hidden>Aucune propriété ne correspond à ces filtres.</p>
      <noscript><p class="lede">Sans JavaScript, les filtres restent inactifs et toutes les propriétés restent affichées.</p></noscript>
    </div>
  </section>
</main>
${footer()}`;
}

function facts(listing) {
  const rows = [
    ["Statut", listing.statusLabel],
    ["Type", listing.propertyKind],
    ["Genre", listing.propertyType && listing.propertyType !== listing.propertyKind ? listing.propertyType : null],
    ["Chambres", listing.bedrooms],
    ["Salles de bain", listing.bathrooms],
    ["Salles d'eau", listing.powderRooms],
    ["Aire habitable", listing.livingArea],
    ["Terrain", listing.landArea],
    ["Municipalité", listing.cityFull || listing.city],
    ["Code postal", listing.postalCode],
    ["Centris", listing.centris],
    ["Région", listing.region]
  ].filter((row) => row[1]);
  return rows
    .map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`)
    .join("");
}

function relatedHtml(listing, listings) {
  const others = listings.filter((item) => item.id !== listing.id && item.status !== "vendu").slice(0, 4);
  if (!others.length) return "";
  return `<section class="section-tight"><div class="wrap-wide"><h2 class="block-title">Autres propriétés</h2><ul class="town-links">${others
    .map((item) => `<li><a href="/proprietes/${esc(item.id)}/">${esc([item.address, item.city].filter(Boolean).join(", "))}</a></li>`)
    .join("")}</ul></div></section>`;
}

export function renderListingPage(listing, listings = []) {
  const name = [listing.address, listing.city].filter(Boolean).join(", ");
  const description = listingDescription(listing);
  const photo = listing.photos[0];
  const thumbs = listing.photos
    .map((item, index) => {
      const alt = photoAlt(listing, item);
      return `<button type="button" data-gallery-src="${esc(item.large)}" data-gallery-alt="${esc(alt)}" aria-label="${esc(alt)}" aria-pressed="${index === 0 ? "true" : "false"}"><img src="${esc(item.medium)}" alt="" width="92" height="68" loading="lazy"></button>`;
    })
    .join("");
  const map = listing.showMap
    ? `<a class="btn btn-line" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.latitude + "," + listing.longitude)}" target="_blank" rel="noopener">Voir sur la carte</a>`
    : "";
  const morePhotos = listing.photoCount > listing.photos.length ? `<p class="card-note">${listing.photoCount} photos sur la fiche RE/MAX.</p>` : "";
  return `${head({
    title: listingTitle(listing),
    description,
    canonical: SITE + "/proprietes/" + listing.id + "/",
    image: photo ? photo.large : undefined,
    imageAlt: name || "Propriété " + listing.centris,
    ogType: "article",
    robots: listing.status === "vendu" ? "noindex, follow" : "",
    jsonLd: [
      graph([
        breadcrumb([
          { name: "Accueil", url: SITE + "/" },
          { name: "Propriétés", url: SITE + "/proprietes/" },
          { name: name || listing.centris, url: SITE + "/proprietes/" + listing.id + "/" }
        ]),
        listingSchema(listing)
      ])
    ]
  })}
<body>
${header(true)}
<main id="contenu">
  <section class="page-hero">
    <div class="wrap-wide">
      <p class="crumbs"><a href="/">Accueil</a> / <a href="/proprietes/">Propriétés</a> / ${esc(listing.city || listing.centris)}</p>
      <p class="eyebrow">${esc(listing.statusLabel)}</p>
      <h1>${esc(name || "Propriété " + listing.centris)}</h1>
    </div>
  </section>
  <section>
    <div class="wrap-wide listing-layout">
      <div>
        ${photo ? `<div class="gallery-main"><img id="gallery-main" src="${esc(photo.large)}" alt="${esc(photoAlt(listing, photo))}" width="1200" height="900" fetchpriority="high"></div>` : ""}
        ${listing.photos.length > 1 ? `<div class="thumbs" role="group" aria-label="Photos">${thumbs}</div>` : ""}
        ${morePhotos}
      </div>
      <div>
        ${listing.priceDisplay ? `<p class="listing-price">${esc(listing.priceDisplay)}</p>` : ""}
        ${openHouseLine(listing.openHouse) ? `<p class="open-house">${esc(openHouseLine(listing.openHouse))}</p>` : ""}
        <div class="facts">${facts(listing)}</div>
        ${listing.descriptionText ? `<div class="prose">${listing.descriptionHtml && listing.descriptionHtml.includes("<") ? listing.descriptionHtml : `<p>${esc(listing.descriptionText)}</p>`}</div>` : ""}
        <div class="listing-actions">
          <a class="btn btn-ink" href="${esc(listing.listingUrl)}" target="_blank" rel="noopener">Voir la fiche officielle RE/MAX</a>
          <a class="btn btn-line" href="/#contact">Parler à Philippe</a>
          ${map}
        </div>
      </div>
    </div>
  </section>
  ${relatedHtml(listing, listings)}
</main>
${footer()}`;
}

function dayStamp(value, fallback) {
  const date = new Date(value || fallback || Date.now());
  if (Number.isNaN(date.getTime())) return String(fallback || "").slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function renderSitemap(listings, syncedAt) {
  const fallback = dayStamp(syncedAt);
  const indexable = listings.filter((item) => item.status !== "vendu");
  const urls = [
    { loc: SITE + "/", priority: "1.0", freq: "weekly", lastmod: fallback },
    { loc: SITE + "/proprietes/", priority: "0.9", freq: "daily", lastmod: fallback },
    ...indexable.map((item) => ({
      loc: SITE + "/proprietes/" + item.id + "/",
      priority: "0.8",
      freq: "daily",
      lastmod: dayStamp(item.updatedAt, fallback)
    })),
    { loc: SITE + "/politique-confidentialite.html", priority: "0.3", freq: "yearly", lastmod: "2026-06-23" }
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.freq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

export function writeGenerated(root, listings, syncedAt) {
  const featuredPath = path.join(root, "index.html");
  const index = fs.readFileSync(featuredPath, "utf8");
  const start = "<!-- LISTINGS:FEATURED:START -->";
  const end = "<!-- LISTINGS:FEATURED:END -->";
  if (!index.includes(start) || !index.includes(end)) {
    throw new Error("index.html is missing the listings markers");
  }
  let next = index.replace(new RegExp(start + "[\\s\\S]*?" + end), start + "\n" + featuredHtml(listings) + "\n" + end);
  const townsStart = "<!-- SEO:TOWNS:START -->";
  const townsEnd = "<!-- SEO:TOWNS:END -->";
  if (next.includes(townsStart) && next.includes(townsEnd)) {
    next = next.replace(new RegExp(townsStart + "[\\s\\S]*?" + townsEnd), townsStart + "\n" + townsHtml(listings) + "\n" + townsEnd);
  }
  fs.writeFileSync(featuredPath, next);
  const dir = path.join(root, "proprietes");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderPropertiesPage(listings, syncedAt));
  const keep = new Set(listings.map((item) => item.id));
  for (const entry of fs.readdirSync(dir)) {
    if (entry === "index.html") continue;
    if (!keep.has(entry)) fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
  for (const listing of listings) {
    const folder = path.join(dir, listing.id);
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, "index.html"), renderListingPage(listing, listings));
  }
  fs.writeFileSync(path.join(root, "sitemap.xml"), renderSitemap(listings, syncedAt));
}
