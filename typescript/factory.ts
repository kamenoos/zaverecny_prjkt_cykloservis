import { SurovyDil, UlozenyDil } from './types.js';
import { ZakladniDil, MechanickyDil, SpotrebniMaterial, ElektroKomponent } from './models.js';

// ==========================================
// POMOCNE FUNKCE – VYTVORENI DILU
// ==========================================

// z objektu z localstorage nebo z katalogu vytvori spravny typ dilu
export function vytvorDilZDat(data: UlozenyDil | SurovyDil & { skladoveMnozstvi?: number }): ZakladniDil | null {
    try {
        let dil: ZakladniDil;
        if (data.typ === "mechanicky") {
            dil = new MechanickyDil(data.id, data.nazev, data.nakupniCena, data.minimalniStav,
                (data as any).material ?? "neurčeno", (data as any).hmotnost ?? 0);
        } else if (data.typ === "spotrebni") {
            dil = new SpotrebniMaterial(data.id, data.nazev, data.nakupniCena, data.minimalniStav,
                (data as any).zivotnostKm, (data as any).objemMl);
        } else if (data.typ === "elektro") {
            dil = new ElektroKomponent(data.id, data.nazev, data.nakupniCena, data.minimalniStav,
                (data as any).kapacitaWh ?? 0, (data as any).verzeFirmwaru ?? "1.0.0");
        } else {
            return null;
        }
        dil.skladoveMnozstvi = (data as any).skladoveMnozstvi ?? 0;
        dil.poznamka = (data as any).poznamka ?? "";
        return dil;
    } catch (e) {
        console.error("Chyba při vytváření dílu:", e);
        return null;
    }
}
