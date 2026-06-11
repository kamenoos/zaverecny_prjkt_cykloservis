import { TypDilu, UlozenyDil } from './types.js';

// ==========================================
// TRIDY A MODELY (OOP)
// ==========================================

// tato trida je zakladni typ dilu, ostatni dily z ni dedi
export abstract class ZakladniDil {
    protected _skladoveMnozstvi: number = 0;
    protected _nakupniCena!: number;
    public poznamka: string = "";

    constructor(
        public readonly id: number,
        public readonly nazev: string,
        nakupniCena: number,
        public readonly minimalniStav: number
    ) {
        if (nazev.trim() === "") {
            throw new Error("Název dílu nesmí být prázdný!");
        }
        this.nakupniCena = nakupniCena;
    }

    get skladoveMnozstvi(): number { return this._skladoveMnozstvi; }

    set skladoveMnozstvi(hodnota: number) {
        this._skladoveMnozstvi = hodnota < 0 ? 0 : hodnota;
    }

    public jePotrebaObjednat(): boolean {
        return this._skladoveMnozstvi < this.minimalniStav;
    }

    set nakupniCena(hodnota: number) {
        if (hodnota <= 0) {
            console.warn(`[Varování] Cena u "${this.nazev}" je neplatná. Nastavuji na 1 Kč.`);
            this._nakupniCena = 1;
        } else {
            this._nakupniCena = hodnota;
        }
    }

    get nakupniCena(): number { return this._nakupniCena; }

    public pridatNaSklad(mnozstvi: number): void {
        if (mnozstvi > 0) this._skladoveMnozstvi += mnozstvi;
    }

    abstract vypocitejKoncovouCenu(): number;
    abstract vypisDetail(): string;

    // serializace do prosteho objektu pro localstorage
    public serializuj(): UlozenyDil {
        return {
            id: this.id,
            typ: this._getTyp(),
            nazev: this.nazev,
            nakupniCena: this.nakupniCena,
            minimalniStav: this.minimalniStav,
            skladoveMnozstvi: this.skladoveMnozstvi,
            poznamka: this.poznamka,
            ...this._serializujSpecifika()
        };
    }

    protected abstract _getTyp(): TypDilu;
    protected abstract _serializujSpecifika(): Partial<UlozenyDil>;
}

// mechanicky dil - ma material a hmotnost
export class MechanickyDil extends ZakladniDil {
    constructor(id: number, nazev: string, nakupniCena: number, minimalniStav: number,
        public material: string, public hmotnost: number) {
        super(id, nazev, nakupniCena, minimalniStav);
    }
    vypocitejKoncovouCenu(): number { return Math.round(this.nakupniCena * 1.25); }
    vypisDetail(): string { return `[Mechanika] ${this.nazev}`; }
    protected _getTyp(): TypDilu { return "mechanicky"; }
    protected _serializujSpecifika() { return { material: this.material, hmotnost: this.hmotnost }; }
}

// spotrebni material - ma volitelne parametry zivotnosti a objemu
export class SpotrebniMaterial extends ZakladniDil {
    constructor(id: number, nazev: string, nakupniCena: number, minimalniStav: number,
        public zivotnostKm?: number, public objemMl?: number) {
        super(id, nazev, nakupniCena, minimalniStav);
    }
    vypocitejKoncovouCenu(): number { return Math.round(this.nakupniCena * 1.40); }
    vypisDetail(): string { return `[Spotřebák] ${this.nazev}`; }
    protected _getTyp(): TypDilu { return "spotrebni"; }
    protected _serializujSpecifika() { return { zivotnostKm: this.zivotnostKm, objemMl: this.objemMl }; }
}

// elektro komponent - ma kapacitu a verzi firmwaru
export class ElektroKomponent extends ZakladniDil {
    private readonly RECYKLACNI_POPLATEK = 25;
    constructor(id: number, nazev: string, nakupniCena: number, minimalniStav: number,
        public kapacitaWh: number, public verzeFirmwaru: string) {
        super(id, nazev, nakupniCena, minimalniStav);
    }
    vypocitejKoncovouCenu(): number { return Math.round((this.nakupniCena * 1.30) + this.RECYKLACNI_POPLATEK); }
    vypisDetail(): string { return `[Elektro] ${this.nazev}`; }
    protected _getTyp(): TypDilu { return "elektro"; }
    protected _serializujSpecifika() { return { kapacitaWh: this.kapacitaWh, verzeFirmwaru: this.verzeFirmwaru }; }
}
