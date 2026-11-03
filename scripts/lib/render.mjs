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

function head(options) {
  const image = options.image || SITE + "/og-image.jpg";
  const json = options.jsonLd
    ? options.jsonLd.map((block) => `<script type="application/ld+json">\n${JSON.stringify(block)}\n</script>`).join("\n")
    : "";
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(options.title)}</title>
  <meta name="description" content="${esc(options.description)}">
  <link rel="canonical" href="${esc(options.canonical)}">
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
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(options.title)}">
  <meta name="twitter:description" content="${esc(options.description)}">
  <meta name="twitter:image" content="${esc(image)}">
  ${json}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
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
      <img class="brand-logo brand-logo-light" src="/logo_remax_crystal_fond_noir.png" alt="RE/MAX CRYSTAL" height="42">
      <img class="brand-logo brand-logo-dark" src="/crystal-supp-noir-diamand.png" alt="" height="42">
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
      <img class="footer-logo" src="/logo_remax_crystal_fond_noir.png" alt="RE/MAX CRYSTAL" height="36">
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

export function cardHtml(listing, eager) {
  const photo = listing.photos[0];
  const statusClass = listing.status === "vendu" ? " card-status badge-sold" : " card-status";
  const open = listing.openHouse ? `<p class="card-note">${esc(listing.openHouse.label || listing.openHouse.text)}</p>` : "";
  return `<article class="card" data-city="${esc(listing.city || "")}" data-kind="${esc(listing.propertyKind || "")}" data-status="${esc(listing.status)}" data-open-house="${listing.openHouse ? "1" : "0"}" data-price="${listing.priceKind === "sale" && listing.priceAmount != null ? esc(listing.priceAmount) : ""}" data-price-kind="${esc(listing.priceKind)}">
  <a class="card-media" href="/proprietes/${esc(listing.id)}/">
    ${photo ? `<img src="${esc(photo.medium)}" alt="${esc(photo.alt)}" width="960" height="720"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">` : ""}
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

function listingSchema(listing) {
  const accommodation = listing.propertyKind && /condo|appartement/i.test(listing.propertyKind) ? "Apartment" : "House";
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: [listing.address, listing.city].filter(Boolean).join(", "),
    url: SITE + "/proprietes/" + listing.id + "/",
    identifier: listing.centris,
    inLanguage: "fr-CA",
    image: listing.photos.slice(0, 6).map((photo) => photo.large),
    about: {
      "@type": accommodation,
      name: [listing.address, listing.city].filter(Boolean).join(", "),
      address: {
        "@type": "PostalAddress",
        streetAddress: [listing.streetNumber, listing.streetName, listing.unit ? "app. " + listing.unit : ""].filter(Boolean).join(" "),
        addressLocality: listing.city || undefined,
        postalCode: listing.postalCode || undefined,
        addressRegion: "QC",
        addressCountry: "CA"
      }
    },
    offers: listing.priceAmount
      ? {
          "@type": "Offer",
          price: listing.priceAmount,
          priceCurrency: "CAD",
          availability: listing.status === "vendu" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
          url: listing.listingUrl,
          ...(listing.priceKind === "rent"
            ? { priceSpecification: { "@type": "UnitPriceSpecification", price: listing.priceAmount, priceCurrency: "CAD", unitText: "MONTH" } }
            : {})
        }
      : undefined,
    provider: { "@id": SITE + "/#agent" }
  };
  if (listing.descriptionText) schema.description = listing.descriptionText.slice(0, 500);
  if (listing.bedroomsCount) schema.about.numberOfBedrooms = listing.bedroomsCount;
  if (listing.bathroomsCount) schema.about.numberOfBathroomsTotal = listing.bathroomsCount;
  if (listing.showMap) {
    schema.about.geo = { "@type": "GeoCoordinates", latitude: listing.latitude, longitude: listing.longitude };
  }
  if (listing.datePosted) schema.datePosted = listing.datePosted;
  return schema;
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
    "@context": "https://schema.org",
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
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Propriétés", item: SITE + "/proprietes/" }
    ]
  };
  return `${head({
    title: "Propriétés | Philippe Cloutier, courtier immobilier",
    description: "Inscriptions actuelles de Philippe Cloutier, courtier immobilier résidentiel RE/MAX CRYSTAL à Saint-Eustache. Maisons et condos à vendre dans les Laurentides, Lanaudière, Laval et au-delà.",
    canonical: SITE + "/proprietes/",
    jsonLd: [breadcrumb, itemList]
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

export function renderListingPage(listing) {
  const name = [listing.address, listing.city].filter(Boolean).join(", ");
  const description = listing.descriptionText
    ? listing.descriptionText.slice(0, 180)
    : [listing.propertyKind, listing.statusLabel, listing.city, listing.priceDisplay].filter(Boolean).join(" · ");
  const photo = listing.photos[0];
  const thumbs = listing.photos
    .map((item, index) => {
      return `<button type="button" data-gallery-src="${esc(item.large)}" data-gallery-alt="${esc(item.alt)}" aria-label="${esc(item.alt)}" aria-pressed="${index === 0 ? "true" : "false"}"><img src="${esc(item.medium)}" alt="" width="92" height="68" loading="lazy"></button>`;
    })
    .join("");
  const map = listing.showMap
    ? `<a class="btn btn-line" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.latitude + "," + listing.longitude)}" target="_blank" rel="noopener">Voir sur la carte</a>`
    : "";
  const morePhotos = listing.photoCount > listing.photos.length ? `<p class="card-note">${listing.photoCount} photos sur la fiche RE/MAX.</p>` : "";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Propriétés", item: SITE + "/proprietes/" },
      { "@type": "ListItem", position: 3, name: name || listing.centris, item: SITE + "/proprietes/" + listing.id + "/" }
    ]
  };
  return `${head({
    title: (name || "Propriété") + " | Philippe Cloutier",
    description: excerpt(description, 170),
    canonical: SITE + "/proprietes/" + listing.id + "/",
    image: photo ? photo.large : undefined,
    ogType: "article",
    jsonLd: [breadcrumb, listingSchema(listing)]
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
        ${photo ? `<div class="gallery-main"><img id="gallery-main" src="${esc(photo.large)}" alt="${esc(photo.alt)}" width="1200" height="900" fetchpriority="high"></div>` : ""}
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
</main>
${footer()}`;
}

export function renderSitemap(listings, syncedAt) {
  const lastmod = (syncedAt || new Date().toISOString()).slice(0, 10);
  const urls = [
    { loc: SITE + "/", priority: "1.0", freq: "weekly" },
    { loc: SITE + "/proprietes/", priority: "0.9", freq: "daily" },
    ...listings.map((item) => ({ loc: SITE + "/proprietes/" + item.id + "/", priority: "0.8", freq: "daily" })),
    { loc: SITE + "/politique-confidentialite.html", priority: "0.3", freq: "yearly" }
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
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
  const next = index.replace(new RegExp(start + "[\\s\\S]*?" + end), start + "\n" + featuredHtml(listings) + "\n" + end);
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
    fs.writeFileSync(path.join(folder, "index.html"), renderListingPage(listing));
  }
  fs.writeFileSync(path.join(root, "sitemap.xml"), renderSitemap(listings, syncedAt));
}
