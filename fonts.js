import fs from "fs/promises";
import path from "path";
import glob from "fast-glob";
import ttf2woff2 from "ttf2woff2";
import ttf2woff from "ttf2woff";

async function run() {
	const files = await glob(["public/fonts/**/*.{ttf,otf}"]);

	console.log(`Знайдено шрифтів: ${files.length}`);

	for (const file of files) {
		const ext = path.extname(file);
		const baseName = path.basename(file, ext);
		const outDir = "public/fonts";

		await fs.mkdir(outDir, { recursive: true });

		const buffer = await fs.readFile(file);

		// woff2
		const woff2 = ttf2woff2(buffer);
		await fs.writeFile(path.join(outDir, `${baseName}.woff2`), woff2);

		// woff
		const woff = ttf2woff(buffer);
		await fs.writeFile(path.join(outDir, `${baseName}.woff`), Buffer.from(woff.buffer));

		console.log(`✅ ${baseName} → woff2 + woff`);
	}

	console.log("Готово! Шрифти в public/fonts/");
}

run().catch(err => console.error("❌ Помилка:", err));
