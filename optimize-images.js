import sharp from "sharp";
import glob from "fast-glob";
import fs from "fs/promises";
import path from "path";

async function run() {
	const files = await glob(["public/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}"]);

	console.log(`[Оптимизатор] Найдено исходных картинок в public: ${files.length}`);

	if (files.length === 0) {
		console.log("⚠️ Картинки не найдены.");
		return;
	}

	for (const file of files) {
		const ext = path.extname(file);
		const basePath = file.slice(0, -ext.length);

		const targetAvif = `${basePath}.avif`;
		const targetWebp = `${basePath}.webp`;

		console.log(`Обработка: ${path.basename(file)}`);

		const buffer = await fs.readFile(file);
		const img = sharp(buffer);
		const meta = await img.metadata();

		// 1. Сжимаем оригинал на месте
		if (meta.format === "jpeg" || meta.format === "jpg") {
			await img.jpeg({ quality: 75, progressive: true }).toFile(file + ".tmp");
			await fs.rename(file + ".tmp", file);
		} else if (meta.format === "png") {
			await img.png({ quality: 80, compressionLevel: 9 }).toFile(file + ".tmp");
			await fs.rename(file + ".tmp", file);
		}

		// 2. AVIF рядом с оригиналом
		await sharp(buffer)
			.avif({ quality: 65, effort: 4 })
			.toFile(targetAvif);

		// 3. WebP рядом с оригиналом
		await sharp(buffer)
			.webp({ quality: 75 })
			.toFile(targetWebp);
	}

	console.log("✅ Готово! Все картинки обработаны в public/");
}

run().catch(err => console.error("❌ Ошибка:", err));
