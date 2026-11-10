# BIIL — Industrial Intelligence Layer

An immersive, keyboard-driven project presentation for the Southeast University CSE 460 Final Year Design Project I. BIIL is presented as a **proposed platform**; the report describes plans, requirements, architecture and estimates, not a deployed production system. Dashboard visuals and sensor demonstrations are clearly labeled illustrative.

## Local development

Requirements: Node.js 22 LTS and npm 10+.

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```sh
npm run typecheck
npm run lint
npm run build
npm start
```

`npm start` serves the production standalone build; `npm run dev` is for local development.

## Presentation controls

- `ArrowRight` / `Space`: next scene
- `ArrowLeft`: previous scene
- `O`: scene overview
- `N`: presenter note (scope reminder)
- `F`: browser fullscreen
- `Escape`: close overview or exit fullscreen

The bottom progress markers and previous/next controls are clickable. Select a node in the six-domain scene, compare hardware configurations, and trigger the explicitly simulated motor anomaly. Reduced-motion preferences are respected.

## Source and accuracy

The project report is included at [`docs/FinalVersionBILL.pdf`](docs/FinalVersionBILL.pdf). The six supplied team and supervisor photographs are under `public/team/` and are served unmodified. The presentation preserves the report's stated names, architecture, planned inspection flow, cost scenarios and phase outputs. In particular, it flags the report's **12-month Table 3.1** versus **9-month Figure 3.2** schedule discrepancy. Literature-review measurements are not represented as BIIL results.

## Docker deployment

The root `Dockerfile` uses Node 22 Alpine, a reproducible npm lockfile, Next.js standalone output, and a non-root production runtime. No writable application state is required.

Build and run:

```sh
docker build -t biil-presentation .
docker run --rm -p 3000:3000 biil-presentation
```

Compose (change the host port if needed):

```sh
docker compose up --build -d
```

Compose maps `${APP_PORT:-3000}` on the host to port `3000` in the container. `/api/health` returns a minimal `{"status":"ok"}` response and is used by both Docker health checks. Inspect status and logs with:

```sh
docker compose ps
docker compose logs -f biil-presentation
```

## Dokploy deployment

1. Push this repository to GitHub and connect the repository in Dokploy.
2. Select **Dockerfile** as the deployment method.
3. Set the Dockerfile path to `./Dockerfile` and the application/container port to `3000`.
4. Configure a domain in Dokploy and enable its HTTPS/Let's Encrypt option. The app listens on `0.0.0.0:3000`; TLS is terminated by Dokploy's reverse proxy.
5. No application secrets or required environment variables are needed. If configuring optional runtime values, keep `NODE_ENV=production`, `PORT=3000`, and `HOSTNAME=0.0.0.0` inside the container. Do not commit real `.env` files.
6. Deploy. Verify `https://your-configured-domain/api/health` responds with HTTP 200.

Dokploy wording may vary slightly by release; the required build context is the repository root and internal service port is always `3000`.

## Maintenance

Push updates to the connected GitHub branch and redeploy using Dokploy. For a local Compose deployment, run `git pull` then `docker compose up --build -d`. Review app output in Dokploy's deployment logs or with `docker compose logs -f`. Verify health at `/api/health` after a deployment.

## Included assets

- `public/team/`: the five supplied member portraits and supervisor portrait.
- `docs/FinalVersionBILL.pdf`: the supplied project report.
- The 3D industrial world is constructed from optimized procedural Three.js geometry; no external GLB/HDR or stock-person assets are required.
