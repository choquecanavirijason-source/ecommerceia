const BUILD_API_URL =
  process.env.API_BUILD_URL ??
  (process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:8000/api/v1");

const FALLBACK_PRODUCT_LIMIT = 2000;

const FALLBACK_CATEGORY_SLUGS = [
  "electrodomesticos",
  "belleza-y-cuidado-personal",
  "accesorios-bebes",
  "auriculares",
  "tecnologia-y-acc",
  "licuadoras-y-exprimidores",
  "celulares",
  "bazar-y-limpieza",
  "herramientas-y-acc",
  "termos-botellas-vasos",
  "griferia",
  "hogar",
  "parlantes",
  "juguetes-y-juegos",
  "bazar",
  "blanqueria",
  "marroquineria",
  "libreria",
  "indumentaria",
  "humidificadoresiluminacion",
  "muebles-y-placares",
  "mesas-y-sillas",
  "cocinas",
  "soportes",
  "calefaccion",
  "rodados-y-acc",
  "escolar",
  "hornos-y-microondas",
  "camaras-y-seguridad",
  "termotanques",
  "smart-tvs",
  "accesorios-gym",
  "sommiers",
];

export async function getProductIds(): Promise<string[]> {
  try {
    const res = await fetch(`${BUILD_API_URL}/products?limit=${FALLBACK_PRODUCT_LIMIT}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const payload = (await res.json()) as { data?: Array<{ id?: number }> };
      const ids = (payload.data ?? [])
        .map((product) => product.id)
        .filter((id): id is number => typeof id === "number" && Number.isFinite(id))
        .map((id) => String(id));

      if (ids.length > 0) return ids;
    }
  } catch {
    // La API no está disponible en build; se usa el fallback.
  }

  return Array.from({ length: FALLBACK_PRODUCT_LIMIT }, (_, index) => String(index + 1));
}

export async function getCategorySlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${BUILD_API_URL}/categories`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const payload = (await res.json()) as { data?: Array<{ slug?: string | null }> };
      const slugs = (payload.data ?? [])
        .map((category) => category.slug)
        .filter((slug): slug is string => typeof slug === "string" && slug.trim().length > 0);

      if (slugs.length > 0) return Array.from(new Set(slugs));
    }
  } catch {
    // La API no está disponible en build; se usa el fallback.
  }

  return FALLBACK_CATEGORY_SLUGS;
}
