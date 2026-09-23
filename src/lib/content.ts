// Accès aux collections, dans l'ordre d'affichage voulu par les rédacteurs.
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';

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

/** Les six services de la refonte, dans l'ordre choisi dans Keystatic. */
export async function services(): Promise<Service[]> {
  return (await getCollection('services')).sort((a, b) => a.data.ordre - b.data.ordre);
}

/** Réglage à entrée unique (accueil, navigation, formulaire…). */
export async function single<K extends CollectionKey>(name: K): Promise<CollectionEntry<K>['data']> {
  const [entry] = await getCollection(name);
  if (!entry) throw new Error(`Réglage manquant : src/content/site/${String(name)}.yaml`);
  return entry.data;
}

export const expertiseUrl = (slug?: string) => (slug ? `/expertises/${slug}` : '/expertises');
export const sectorUrl = (slug?: string) => (slug ? `/secteurs/${slug}` : '/secteurs');

export const find = <T extends { id: string }>(list: T[], id: string): T => {
  const item = list.find((x) => x.id === id);
  if (!item) throw new Error(`Entrée introuvable : ${id}`);
  return item;
};
