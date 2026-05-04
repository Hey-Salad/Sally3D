# v0-heysalad-3d-printer

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_Yg9uqgQXdJnOgUt4lRB6CziPqc17)

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## CAD Workflow

Sally3D has two CAD generation paths:

- `POST /api/cad/generate` returns a synchronous JSCAD result for the current chat UI.
- `POST /api/cad/workflow` starts a durable Vercel Workflow run and returns a `runId`.
- `GET /api/cad/workflow?runId=...` checks workflow status and returns the completed STL download links.

The Workflow integration follows the Vercel Workflow / Workflow SDK docs from the Builder's Night resources:

- [Vercel Workflow](https://vercel.com/docs/workflow)
- [Workflow SDK Next.js guide](https://useworkflow.dev/docs/getting-started/next)
- [Starting Workflows](https://useworkflow.dev/docs/foundations/starting-workflows)
- [Building durable AI agents](https://useworkflow.dev/docs/ai)
- [Workflow SDK repo](https://github.com/vercel/workflow)
- [Workflow examples](https://github.com/vercel/workflow-examples)

Example request:

```bash
curl -X POST http://localhost:3000/api/cad/workflow \
  -H 'content-type: application/json' \
  --data '{
    "innerDimensions": { "length": 80, "width": 50, "height": 24 },
    "wallThickness": 2,
    "cornerRadius": 2,
    "lidType": "snap",
    "lidOverlap": 2,
    "mountingHoles": [],
    "standoffHeight": 4,
    "portCutouts": [],
    "ventilation": { "type": "slots", "area": "top", "density": "low" },
    "printOrientation": "lid-up",
    "supportRequired": false
  }'
```

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/chilu18/v0-heysalad-3d-printer" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
