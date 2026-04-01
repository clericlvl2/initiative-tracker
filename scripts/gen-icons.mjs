/**
 * Generates minimal valid PNG icons for PWA.
 * Solid #18130E (ink) background — no canvas/sharp required.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

function crc32(buf) {
	const table = Array.from({ length: 256 }, (_, n) => {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		return c >>> 0;
	});
	let crc = 0xffffffff;
	for (const byte of buf) crc = (table[(crc ^ byte) & 0xff] ^ (crc >>> 8)) >>> 0;
	return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
	const lenBuf = Buffer.alloc(4);
	lenBuf.writeUInt32BE(data.length);
	const typeData = Buffer.concat([Buffer.from(type), data]);
	const crcBuf = Buffer.alloc(4);
	crcBuf.writeUInt32BE(crc32(typeData));
	return Buffer.concat([lenBuf, typeData, crcBuf]);
}

function makePng(size, r, g, b) {
	const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(size, 0);
	ihdr.writeUInt32BE(size, 4);
	ihdr[8] = 8; // bit depth
	ihdr[9] = 2; // RGB

	const rows = [];
	for (let y = 0; y < size; y++) {
		const row = Buffer.alloc(1 + size * 3);
		row[0] = 0; // filter: none
		for (let x = 0; x < size; x++) {
			row[1 + x * 3] = r;
			row[2 + x * 3] = g;
			row[3 + x * 3] = b;
		}
		rows.push(row);
	}

	return Buffer.concat([
		sig,
		chunk("IHDR", ihdr),
		chunk("IDAT", deflateSync(Buffer.concat(rows))),
		chunk("IEND", Buffer.alloc(0)),
	]);
}

mkdirSync("public", { recursive: true });
// #18130E = rgb(24, 19, 14) — ink color
writeFileSync("public/pwa-192x192.png", makePng(192, 24, 19, 14));
writeFileSync("public/pwa-512x512.png", makePng(512, 24, 19, 14));
console.log("✓ pwa-192x192.png and pwa-512x512.png written to public/");
