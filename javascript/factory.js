import { MechanickyDil, SpotrebniMaterial, ElektroKomponent } from './models.js';
// ==========================================
// POMOCNE FUNKCE – VYTVORENI DILU
// ==========================================
// z objektu z localstorage nebo z katalogu vytvori spravny typ dilu
export function vytvorDilZDat(data) {
    try {
        let dil;
        if (data.typ === "mechanicky") {
            dil = new MechanickyDil(data.id, data.nazev, data.nakupniCena, data.minimalniStav, data.material ?? "neurčeno", data.hmotnost ?? 0);
        }
        else if (data.typ === "spotrebni") {
            dil = new SpotrebniMaterial(data.id, data.nazev, data.nakupniCena, data.minimalniStav, data.zivotnostKm, data.objemMl);
        }
        else if (data.typ === "elektro") {
            dil = new ElektroKomponent(data.id, data.nazev, data.nakupniCena, data.minimalniStav, data.kapacitaWh ?? 0, data.verzeFirmwaru ?? "1.0.0");
        }
        else {
            return null;
        }
        dil.skladoveMnozstvi = data.skladoveMnozstvi ?? 0;
        dil.poznamka = data.poznamka ?? "";
        return dil;
    }
    catch (e) {
        console.error("Chyba při vytváření dílu:", e);
        return null;
    }
}
