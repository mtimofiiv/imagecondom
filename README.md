# Image Condom

Image condom is an on-the-fly proxy server for images. It can be used for when you want to resize an image without having to resize it.

Credit goes to [@harianus](https://github.com/harianus) and [@larixk](https://github.com/larixk) for creating the original one which served as an inspiration for this one.

## Design

Image Condom uses streams for all three of its functionalities (input, real-time conversion, output). GraphicsMagick was chosen as the image processing binary due to its efficiency in multi-processor environments.

## Usage

The request should look like this:

```
http://images.server.com/500/aHR0cHM6Ly9ibG9nLmZpaXYuaW8vYXNzZXRzL2ltYWdlcy8yMDE0LTExLTAyLzAxLmpwZw==
```

 * The first part of the request, the `500` is the width you want the image to be resized to.
 * The second part of the URI is the base64-encoded URI of the image you want.

An example instance of the imagecondom is running here: 
https://fiiv-imagecondom.herokuapp.com

It is, of course, on a free Heroku tier, so naturally not really usable for production as it goes to sleep.

## Caching

By default, all the assets are set with maximum expiry cache headers. If you need to get a version without these, append `?bypassCache=true` to the request.

## Running

 * `npm run start` starts the application
 * `npm run cluster` starts the application in clustered mode using [pm2](https://github.com/Unitech/pm2)

## Installing

 * Copy `.env-sample` to `.env`
 * Fill in the `MAX_SIZE` to whatever you want
 
_NOTE_: if you're going to use it on Heroku, use the [GraphicsMagick buildpack](https://github.com/mcollina/heroku-buildpack-graphicsmagick).
