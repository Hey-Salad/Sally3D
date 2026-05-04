import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { withWorkflow } from 'workflow/next'

const repoRoot = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: repoRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default withWorkflow(nextConfig)
