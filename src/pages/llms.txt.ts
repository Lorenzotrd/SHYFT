// /llms.txt : présentation de l'agence pour les moteurs IA (format llmstxt.org), générée à partir des contenus.
import type { APIRoute } from 'astro';
import { llmsIndex } from '../lib/llms';

export const GET: APIRoute = async () =>
  new Response(await llmsIndex(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
