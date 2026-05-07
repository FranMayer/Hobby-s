import { supabase } from './supabase';

const MIGRATED_KEY = 'hobbycount_migrated_v1';
const COLLECTIONS_IDS = ['vinilos', 'camaras', 'autosf1', 'monedas'];

function cleanPayload(item) {
  const { id, createdAt, updatedAt, importedAt, created_at, updated_at, ...rest } = item;
  return {
    ...rest,
    wishlist: rest.wishlist === true,
    year: rest.year ? parseInt(rest.year, 10) : null,
  };
}

export async function getAll() {
  const results = await Promise.all(
    COLLECTIONS_IDS.map(id =>
      supabase.from(id).select('*').order('created_at', { ascending: false })
    )
  );
  return Object.fromEntries(
    COLLECTIONS_IDS.map((id, i) => [id, results[i].data ?? []])
  );
}

export async function getCollection(id) {
  const { data, error } = await supabase
    .from(id)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addItem(collectionId, item) {
  const { data, error } = await supabase
    .from(collectionId)
    .insert(cleanPayload(item))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteItem(collectionId, itemId) {
  const { error } = await supabase.from(collectionId).delete().eq('id', itemId);
  if (error) throw error;
}

export async function updateItem(collectionId, itemId, patch) {
  const { error } = await supabase
    .from(collectionId)
    .update({ ...cleanPayload(patch), updated_at: new Date().toISOString() })
    .eq('id', itemId);
  if (error) throw error;
}

export async function importItems(collectionId, parsedItems) {
  const payload = parsedItems.map(cleanPayload);
  const { data, error } = await supabase.from(collectionId).insert(payload).select();
  if (error) throw error;
  return data?.length ?? 0;
}

// Migra datos de localStorage a Supabase la primera vez (solo si Supabase está vacío)
export async function migrateFromLocalStorage() {
  if (localStorage.getItem(MIGRATED_KEY)) return { migrated: false };

  const raw = localStorage.getItem('hobbycount_v1');
  if (!raw) { localStorage.setItem(MIGRATED_KEY, 'true'); return { migrated: false }; }

  let local;
  try { local = JSON.parse(raw); } catch { return { migrated: false }; }

  let total = 0;
  for (const id of COLLECTIONS_IDS) {
    const items = local[id] ?? [];
    if (!items.length) continue;

    const { count } = await supabase
      .from(id)
      .select('*', { count: 'exact', head: true });
    if (count > 0) continue;

    const payload = items.map(({ id: _id, createdAt, updatedAt, importedAt, ...rest }) => ({
      ...cleanPayload(rest),
      created_at: createdAt ?? new Date().toISOString(),
    }));

    const { error } = await supabase.from(id).insert(payload);
    if (!error) total += payload.length;
  }

  localStorage.setItem(MIGRATED_KEY, 'true');
  return { migrated: total > 0, count: total };
}
