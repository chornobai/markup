import fs from "fs/promises";
import path from "path";
import glob from "fast-glob";

async function run() {
    const files = await glob(["public/icons/**/*.svg", "!public/icons/sprite.svg"]);

    console.log(`Знайдено іконок: ${files.length}`);

    let symbols = "";

    for (const file of files) {
        const name = path.basename(file, ".svg");
        let content = await fs.readFile(file, "utf-8");

        const viewBox = content.match(/viewBox="([^"]+)"/)?.[1] || "0 0 24 24";

        content = content
            .replace(/<svg[^>]*>/g, "")
            .replace(/<\/svg>/g, "")
            .trim();

        symbols += `  <symbol id="${name}" viewBox="${viewBox}">\n    ${content}\n  </symbol>\n`;
    }

    const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols}</svg>`;

    await fs.writeFile("public/sprite.svg", sprite);

    console.log("✅ Спрайт: public/icons/sprite.svg");
}

run().catch(err => console.error("❌ Помилка:", err));
