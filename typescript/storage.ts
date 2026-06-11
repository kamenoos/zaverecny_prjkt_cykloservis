import { UlozenyDil } from './types.js';
import { ZakladniDil } from './models.js';
import { vytvorDilZDat } from './factory.js';

const STORAGE_KEY = "cyklosklad_data";

// ==========================================
// LOCALSTORAGE – ULOZENI A NACTENI
// ==========================================

// ulozi pole dilu do localstorage jako json string
export function ulozSklad(skladCykloServisu: ZakladniDil[]): void {
    const data = skladCykloServisu.map(d => d.serializuj());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function nactiSkladZLocalStorage(): ZakladniDil[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        const data: UlozenyDil[] = JSON.parse(raw);
        return data.map(vytvorDilZDat).filter((d): d is ZakladniDil => d !== null);
    } catch {
        console.error("Chyba při načítání localStorage – používám výchozí katalog.");
        return [];
    }
}
