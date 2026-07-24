# Connection Map

Send someone you care about a place-to-place letter. Pick two points on a map, write a message, and share a single link. When they open it, a line draws itself between the two places and a 💌 travels across the world to deliver what you wrote.

**[▶ Try it live](https://connection-map-gamma.vercel.app/)**


https://github.com/user-attachments/assets/bc41e5ba-26c9-405d-a5ae-79243e495c4f


## How it works

1. The sender picks **two points** on a [Leaflet](https://leafletjs.com/) map, either by clicking or by searching a place name, then fills in *from* / *to* and writes a message.
2. The app **compresses the message** with `lz-string` and packs everything into the URL: `?from=lat,lng&to=lat,lng&msg=<compressed>&fn=&tn=`.
3. The sender shares that link. **There is no server and no database.** The whole letter lives inside the URL.
4. The recipient opens it in **viewing mode**: the map auto-zooms to fit both points, the line draws itself, and the 💌 travels along it until it arrives and the message opens.
5. Either side can **export a PNG** of the map or the letter card.



## Why I built this

I started 2026 as an international student in Toronto, far from my family in Ecuador. For New Year I wanted to send them something warmer than a WhatsApp message, so I built this.

## The interesting parts

**No backend, by design.** All the state, meaning the coordinates, the names, and the message, is encoded into the URL, with the message body compressed by `lz-string` so it fits. A shareable letter costs zero infrastructure and stores zero user data. Nothing is ever written to a server. The tradeoff is real and worth naming: URLs have length limits (so messages are capped at 600 characters), there's no persistence if the link is lost, and I get no analytics on the content itself, only that a page was opened. For a personal keepsake you send to one person, that's the right trade.

**Animation as sequencing.** The reveal is a small state machine driven by [GSAP](https://gsap.com/). The line draws first, via an SVG stroke-dash tween (`AnimatedLine.jsx`). Then the letter travels the path, with a duration scaled to the real geographic distance between the two points (`TravelingIcon.jsx`). Then arrival flips the state that opens the message. Each step waits for the one before it. The timing is the product, not an afterthought.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).
Build with `npm run build`; preview the build with `npm run preview`.

## Tech stack


| Tool                       | Role                                     |
| -------------------------- | ---------------------------------------- |
| React 19 + Vite 7          | UI and build                             |
| Leaflet + react-leaflet    | Map, markers, and the drawn line         |
| leaflet-geosearch          | Search a location by name                |
| GSAP                       | Line-draw and letter-travel animations   |
| lz-string                  | Compresses the message to fit in the URL |
| html-to-image              | Exports the map / letter card as a PNG   |
| Vercel + @vercel/analytics | Hosting and page-view analytics          |


