// Accès aux collections, dans l'ordre d'affichage voulu par les rédacteurs.
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import type { Lang } from './i18n';

export type Sector = CollectionEntry<'secteurs'>;
export type Expertise = CollectionEntry<'expertises'>;
export type Service = CollectionEntry<'services'>;

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export async function sectors(): Promise<Sector[]> {
  return (await getCollection('secteurs')).sort(byOrder);
}

export async function expertises(): Promise<Expertise[]> {
  return (await getCollection('expertises')).sort(byOrder);
}

/** Les six services de la refonte, dans l'ordre choisi dans Keystatic, dans la langue demandée. */
export async function services(lang: Lang = 'fr'): Promise<Service[]> {
  const list = lang === 'en' ? await getCollection('servicesEn') : await getCollection('services');
  return (list as Service[]).sort((a, b) => a.data.ordre - b.data.ordre);
}

/** Réglages qui existent aussi en anglais (collection « <nom>En »). */
type Bilingual = 'accueil' | 'site' | 'rendezVous' | 'serviceCommun' | 'auditOffert' | 'merci' | 'rdvMerci';

/** Réglage à entrée unique (accueil, navigation, formulaire…). En anglais, seulement pour les réglages traduits. */
export async function single<K extends CollectionKey>(name: K, lang: K extends Bilingual ? Lang : 'fr' = 'fr'): Promise<CollectionEntry<K>['data']> {
  const key = (lang === 'en' ? `${String(name)}En` : name) as K;
  const [entry] = await getCollection(key);
  if (!entry) throw new Error(`Réglage manquant : ${String(key)} (${lang})`);
  return entry.data;
}

/** Pages légales, dans la langue demandée. */
export async function legalPages(lang: Lang = 'fr'): Promise<CollectionEntry<'pages'>[]> {
  return (lang === 'en' ? await getCollection('pagesEn') : await getCollection('pages')) as CollectionEntry<'pages'>[];
}

export const expertiseUrl = (slug?: string) => (slug ? `/expertises/${slug}` : '/expertises');

export const find = <T extends { id: string }>(list: T[], id: string): T => {
  const item = list.find((x) => x.id === id);
  if (!item) throw new Error(`Entrée introuvable : ${id}`);
  return item;
};
