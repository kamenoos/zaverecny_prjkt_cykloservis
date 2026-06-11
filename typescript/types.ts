// ==========================================
// TYPY A INTERFACEA
// ==========================================

// typ dilu, ktery se v aplikaci pouziva
export type TypDilu = "mechanicky" | "spotrebni" | "elektro";

// tato data jsou puvodni entries z katalogu nebo importu
export interface SurovyDil {
    id: number;
    typ: TypDilu;
    nazev: string;
    nakupniCena: number;
    minimalniStav: number;
    material?: string;
    hmotnost?: number;
    zivotnostKm?: number;
    kapacitaWh?: number;
    verzeFirmwaru?: string;
    objemMl?: number;
    poznamka?: string;
}

// serializovany dil, ktery se uklada do localstorage
export interface UlozenyDil {
    id: number;
    typ: TypDilu;
    nazev: string;
    nakupniCena: number;
    minimalniStav: number;
    skladoveMnozstvi: number;
    poznamka: string;
    material?: string;
    hmotnost?: number;
    zivotnostKm?: number;
    objemMl?: number;
    kapacitaWh?: number;
    verzeFirmwaru?: string;
}
