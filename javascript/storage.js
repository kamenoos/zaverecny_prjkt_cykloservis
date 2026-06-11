import { vytvorDilZDat } from './factory.js';
const STORAGE_KEY = "cyklosklad_data";
// ==========================================
// LOCALSTORAGE – ULOZENI A NACTENI
// ==========================================
// ulozi pole dilu do localstorage jako json string
export function ulozSklad(skladCykloServisu) {
    const data = skladCykloServisu.map(d => d.serializuj());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
export function nactiSkladZLocalStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
        return [];
    try {
        const data = JSON.parse(raw);
        return data.map(vytvorDilZDat).filter((d) => d !== null);
    }
    catch {
        console.error("Chyba při načítání localStorage – používám výchozí katalog.");
        return [];
    }
}
