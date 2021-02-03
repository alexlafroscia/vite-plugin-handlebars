# `vite-plugin-handlebars`

> Support for Handlebars syntax in Vite HTML Files

## Why?

I really like Vite as a simple static site bundler. It can handle bundling multiple HTML files, which is great, but lacks the ability out-of-the-box to share parts of those HTML files.

While a JS framework like React or Vue could be used to solve this problem, this is heavy-handed for a simple site that could be completely pre-rendered without a JS run-time of any kind.

Handlebars provides what we need to be able to stitch together multiple HTML files, interpolate variables, etc.

## Installation

WIP

## Configuration

WIP

## Quirks

- Assets included in a partial using a relative path will _probably_ not work how you would first expect; the relative path is left alone, making it relative to the _output_ file, not the partial itself. This will (hopefully) be resolved in a future release.
