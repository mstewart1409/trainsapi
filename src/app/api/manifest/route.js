// src/app/api/manifest/route.js

import path from 'path';
import * as fs from "node:fs";

export async function GET() {
    const manifestPath = path.resolve('public', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return Response.json(manifest, { status: 200 });
}
