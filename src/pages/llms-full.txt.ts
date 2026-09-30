// /llms-full.txt : texte principal de chaque page service (FR puis EN), pour les moteurs IA.
import type { APIRoute } from 'astro';
import { llmsFull } from '../lib/llms';

export const GET: APIRoute = async () =>
  new Response(await llmsFull(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
