const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const folder = path.join(__dirname, "public");

async function compress() {
    const files = fs.readdirSync(folder);

    for (const file of files) {
        const fullPath = path.join(folder, file);

        if (!fs.statSync(fullPath).isFile()) continue;

        const ext = path.extname(file).toLowerCase();

        if (![".png", ".jpg", ".jpeg"].includes(ext)) continue;

        const tempPath = fullPath + ".tmp";

        await sharp(fullPath)
            .resize({
                width: 1600,
                withoutEnlargement: true,
            })
            .png({
                compressionLevel: 9,
                quality: 80,
            })
            .toFile(tempPath);

        fs.renameSync(tempPath, fullPath);

        console.log("Optimized:", file);
    }

    console.log("Done!");
}

compress();