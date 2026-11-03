export const BROKER_SLUG = "philippe.cloutier";
export const SOURCE_PAGE = "https://www.remax-quebec.com/fr/courtiers-immobiliers/philippe.cloutier";
export const STATE_URL = "https://www.remax-quebec.com/resources/static/prod/fr/courtiers-immobiliers/philippe.cloutier/state.js";
export const MEDIA = "https://media.remax-quebec.com/img/";

// Public values embedded in the RE/MAX Québec website. Used only if the live page cannot be parsed.
export const FALLBACK_API = "https://api.remax-quebec.com/api/";
export const FALLBACK_KEY = "c4dWcBkE#RL78Y@zg4Y06M$qrOJAeh7Fwv!Z9T4Q1f@zZ";

const PHOTO_LIMIT = 12;

export function decodeJsString(value) {
  return JSON.parse('"' + value.replace(/"/g, '\\"') + '"');
}

export function cityName(municipalite) {
  if (!municipalite) return null;
  const match = String(municipalite).match(/^([^()]+)/);
  const city = (match ? match[1] : municipalite).trim();
  return city || null;
}

export function stripHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeHtml(value) {
  if (!value) return "";
  let html = String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  html = html.replace(/<\/?(p|br|strong|em|b|i|ul|ol|li)\b[^>]*>/gi, (tag) => {
    const name = tag.replace(/<\/?([a-z0-9]+).*/i, "$1").toLowerCase();
    if (name === "br") return "<br>";
    const closing = /^<\//.test(tag);
    if (name === "b") return closing ? "</strong>" : "<strong>";
    if (name === "i") return closing ? "</em>" : "<em>";
    return closing ? `</${name}>` : `<${name}>`;
  });
  html = html.replace(/<(?!\/?(?:p|br|strong|em|ul|ol|li)\b)[^>]+>/gi, "");
  return html.trim();
}

function photoUrl(path, size) {
  if (!path) return null;
  return MEDIA + size + "/" + String(path).replace(/^\/+/, "");
}

function frenchCount(value, singular, plural) {
  if (value == null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return number + " " + (number > 1 ? plural : singular);
}

function areaText(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.fr) return value.fr;
  return null;
}

function formatWhen(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Toronto"
  }).format(date);
}

export function normalizeListing(detail, searchItem) {
  const address = detail.address || {};
  const city = cityName(address.municipalite);
  const street = address.short_display && address.short_display.fr ? address.short_display.fr : null;
  const descriptionSource = (detail.content && (detail.content.description?.fr || detail.content.addenda?.fr)) || "";
  const descriptionText = stripHtml(descriptionSource);
  const descriptionHtml = sanitizeHtml(descriptionSource);
  const forSale = Boolean(detail.is_for_sale);
  const rental = Boolean(detail.is_rental) && !forSale;
  const sold = Boolean(detail.is_sold);
  let status = "a-vendre";
  let statusLabel = "À vendre";
  if (sold) {
    status = "vendu";
    statusLabel = "Vendu";
  } else if (rental) {
    status = "a-louer";
    statusLabel = "À louer";
  }
  const open = detail.has_open_house || detail.status === "open-house" || (searchItem && searchItem.status === "open-house");
  const next = (searchItem && searchItem.next_open_house) || null;
  const houses = Array.isArray(detail.open_houses) ? detail.open_houses : [];
  const firstHouse = houses[0] || null;
  let openHouse = null;
  if (open && !sold) {
    const from = (next && next.from) || (firstHouse && (firstHouse.from || firstHouse.start || firstHouse.date_from)) || null;
    const to = (next && next.to) || (firstHouse && (firstHouse.to || firstHouse.end || firstHouse.date_to)) || null;
    const label = (next && next.fr) || null;
    const when = from ? formatWhen(from) : null;
    const until = to ? formatWhen(to) : null;
    openHouse = {
      label: label || null,
      from: from || null,
      to: to || null,
      text: [label, when && until ? when + " au " + until : when].filter(Boolean).join(" · ") || null
    };
    if (!openHouse.text) openHouse = null;
  }
  const photos = (Array.isArray(detail.photos) ? detail.photos : [])
    .map((photo) => {
      const large = photoUrl(photo.url, "www_large");
      const medium = photoUrl(photo.url, "www_medium");
      if (!large) return null;
      const name = photo.name && photo.name.fr ? photo.name.fr : null;
      return {
        alt: name || street || "Photo de la propriété",
        large,
        medium: medium || large
      };
    })
    .filter(Boolean)
    .slice(0, PHOTO_LIMIT);
  const slug = detail.slug && detail.slug.fr ? detail.slug.fr : null;
  const priceDisplay = detail.display_price && detail.display_price.fr ? detail.display_price.fr : null;
  const priceAmount = forSale || (!rental && detail.price_sale) ? detail.price_sale : rental ? detail.price_rental : detail.price_sale;
  const listing = {
    id: String(detail.no_inscription),
    centris: String(detail.no_inscription),
    status,
    statusLabel,
    openHouse,
    priceDisplay,
    priceAmount: Number.isFinite(Number(priceAmount)) ? Number(priceAmount) : null,
    priceKind: rental ? "rent" : "sale",
    address: street,
    city,
    cityFull: address.municipalite || null,
    region: address.region || null,
    postalCode: address.codePostal || null,
    streetNumber: address.noCiviqueDebut || null,
    streetName: address.nomRueComplet || null,
    unit: address.appartement || null,
    propertyKind: detail.property_kind && detail.property_kind.fr ? detail.property_kind.fr : null,
    propertyType: detail.property_type && detail.property_type.fr ? detail.property_type.fr : null,
    bedrooms: frenchCount(detail.nb_of_bedrooms, "chambre", "chambres"),
    bedroomsCount: Number.isFinite(Number(detail.nb_of_bedrooms)) ? Number(detail.nb_of_bedrooms) : null,
    bathrooms: frenchCount(detail.nb_of_bathrooms, "salle de bain", "salles de bain"),
    bathroomsCount: Number.isFinite(Number(detail.nb_of_bathrooms)) ? Number(detail.nb_of_bathrooms) : null,
    powderRooms: frenchCount(detail.nb_of_powder_rooms, "salle d'eau", "salles d'eau"),
    livingArea: areaText(detail.superficie_habitable),
    landArea: areaText(detail.superficie_terrain),
    descriptionText,
    descriptionHtml,
    photos,
    photoCount: Array.isArray(detail.photos) ? detail.photos.length : photos.length,
    listingUrl: slug ? "https://www.remax-quebec.com/fr/proprietes/" + slug : SOURCE_PAGE,
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    showMap: Boolean(detail.flag_show_map && address.latitude != null && address.longitude != null),
    datePosted: detail.created_at || null,
    updatedAt: detail.last_modified || null
  };
  return listing;
}

export function sortListings(listings) {
  return [...listings].sort((a, b) => {
    const rank = (item) => (item.openHouse ? 0 : item.status === "a-vendre" ? 1 : item.status === "a-louer" ? 2 : 3);
    const diff = rank(a) - rank(b);
    if (diff) return diff;
    return (b.priceAmount || 0) - (a.priceAmount || 0);
  });
}

export function contentSignature(payload) {
  const clone = JSON.parse(JSON.stringify(payload));
  delete clone.syncedAt;
  return JSON.stringify(clone);
}
