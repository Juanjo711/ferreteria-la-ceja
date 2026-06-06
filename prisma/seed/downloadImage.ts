/**
 * Descarga una imagen desde una URL y devuelve su Buffer.
 * Idempotente cuando se usa con caché en disco (lo maneja el orquestador).
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { "User-Agent": "ferreteria-la-ceja-seed/1.0" },
  });
  if (!response.ok) {
    throw new Error(`[seed] Falló descarga ${url} — HTTP ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
