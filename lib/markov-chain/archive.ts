/** PNGs are already compressed; package them as stored ZIP entries.
 * Format: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
 */
const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
  for (let i = 0; i < 8; i++) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function safeFilename(value: string): string {
  return value.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 80) || "markov-chain";
}

export function statePNGFilename(state: string, index: number): string {
  // A numbered prefix keeps filenames unique even when two names sanitize alike.
  return `${String(index + 1).padStart(3, "0")}-${safeFilename(state)}.png`;
}

export async function createZIP(files: { name: string; data: Blob }[], signal?: AbortSignal): Promise<Blob> {
  const localParts: BlobPart[] = [], centralParts: BlobPart[] = [];
  const names = new Set<string>();
  let offset = 0, centralSize = 0;
  if (files.length > 65535) throw new Error("Too many files for this ZIP archive.");
  for (const file of files) {
    signal?.throwIfAborted();
    if (!file.name || /[/\\\x00]/.test(file.name) || names.has(file.name)) throw new Error("ZIP filenames must be unique and contain no folder separators.");
    names.add(file.name);
    const name = new TextEncoder().encode(file.name);
    if (name.length > 65535) throw new Error("A ZIP filename is too long.");
    const size = file.data.size;
    if (offset + 30 + name.length + size >= 0xffffffff) throw new Error("The export is too large for one ZIP. Reduce PNG resolution and try again.");
    const bytes = new Uint8Array(await file.data.arrayBuffer());
    signal?.throwIfAborted();
    const crc = crc32(bytes);
    const local = new Uint8Array(30 + name.length), l = new DataView(local.buffer);
    l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true);
    l.setUint16(6, 0x0800, true); // UTF-8 names; method 0 stores the PNG as-is.
    l.setUint16(12, 0x21, true); // Valid DOS date: 1980-01-01.
    l.setUint32(14, crc, true); l.setUint32(18, size, true); l.setUint32(22, size, true);
    l.setUint16(26, name.length, true); local.set(name, 30);
    const central = new Uint8Array(46 + name.length), c = new DataView(central.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true); c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true); c.setUint32(20, size, true); c.setUint32(24, size, true);
    c.setUint16(28, name.length, true); c.setUint32(42, offset, true); central.set(name, 46);
    localParts.push(local, file.data); centralParts.push(central);
    offset += local.length + size; centralSize += central.length;
  }
  signal?.throwIfAborted();
  if (offset + centralSize + 22 >= 0xffffffff) throw new Error("The export is too large for one ZIP. Reduce PNG resolution and try again.");
  const end = new Uint8Array(22), e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
  e.setUint32(12, centralSize, true); e.setUint32(16, offset, true);
  return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
}
