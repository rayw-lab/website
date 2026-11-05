import assert from 'node:assert/strict';
export function unzip(bytes: Uint8Array): Record<string, string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), files: Record<string, string> = {};
  let offset = 0;
  while (offset + 4 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
    assert.equal(view.getUint16(offset + 8, true), 0, 'stored zip');
    const size = view.getUint32(offset + 18, true), n = view.getUint16(offset + 26, true), extra = view.getUint16(offset + 28, true);
    const name = new TextDecoder().decode(bytes.slice(offset + 30, offset + 30 + n));
    const start = offset + 30 + n + extra;
    files[name] = new TextDecoder().decode(bytes.slice(start, start + size)); offset = start + size;
  }
  return files;
}
