#!/usr/bin/env node

const { program } = require("commander");
const { XMLParser } = require("fast-xml-parser");
const fs = require("fs-extra");
const Jimp = require("jimp");

const { join, parse } = require("path");

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "$",
});

program
    .name("atlas-splitter")
    .description("Splits TextureAtlas XML Files")
    .version("1.0.0")
    .argument("<TextureAtlas>", "the path to the TextureAtlas to split")
    .action(async (TextureAtlasPath) => {
        const TextureAtlasData = fs.readFileSync(TextureAtlasPath);
        const TextureAtlas = parser.parse(TextureAtlasData).TextureAtlas;

        const imagePath = join(
            TextureAtlasPath,
            "../",
            TextureAtlas.$imagePath
        );

        const ImageData = fs.readFileSync(imagePath);

        fs.emptyDirSync(
            join(TextureAtlasPath, "../", parse(TextureAtlas.$imagePath).name)
        );

        const TextureAtlasImage = await Jimp.read(ImageData);

        for (const SubTexture of TextureAtlas.SubTexture) {
            const croppedImage = TextureAtlasImage.clone().crop(
                parseInt(SubTexture.$x),
                parseInt(SubTexture.$y),
                parseInt(SubTexture.$width),
                parseInt(SubTexture.$height)
            );
            if (!SubTexture.$frameX) {
                croppedImage.write(
                    join(
                        TextureAtlasPath,
                        "../",
                        parse(TextureAtlas.$imagePath).name,
                        SubTexture.$name + parse(TextureAtlas.$imagePath).ext
                    )
                );
            } else {
                const framedImage = new Jimp(
                    SubTexture.$frameWidth,
                    SubTexture.$frameHeight,
                    0x0
                );
                framedImage.composite(
                    croppedImage,
                    -SubTexture.$frameX,
                    -SubTexture.$frameY
                );
                framedImage.write(
                    join(
                        TextureAtlasPath,
                        "../",
                        parse(TextureAtlas.$imagePath).name,
                        SubTexture.$name + parse(TextureAtlas.$imagePath).ext
                    )
                );
            }
        }
    });

program.parse();
