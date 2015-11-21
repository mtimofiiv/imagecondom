# Image Condom

Image condom is an on-the-fly proxy server for images. It can be used for when you want to resize an image without having to resize it.

Credit goes to [@harianus](https://github.com/harianus) and [@larixk](https://github.com/larixk) for creating the original one which served as an inpiration for this one.

## Design

Image Condom uses streams for all three of its functionalities (input, real-time conversion, output). GraphicsMagick was chosen as the image processing binary due to its efficiency in multi-processor environments.

## Usage

## Running

 * `npm run start` starts the application
 * `npm run cluster` starts the application in clustered mode using [pm2](https://github.com/Unitech/pm2)

## Installing

 * Copy `.env-sample` to `.env`
 * Fill in the `MAX_SIZE` to whatever you want
 
_NOTE_: if you're going to use it on Heroku, use the [GraphicsMagick buildpack](https://github.com/mcollina/heroku-buildpack-graphicsmagick).
