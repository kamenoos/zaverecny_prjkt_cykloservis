// ==========================================
// TRIDY A MODELY (OOP)
// ==========================================
// tato trida je zakladni typ dilu, ostatni dily z ni dedi
export class ZakladniDil {
    id;
    nazev;
    minimalniStav;
    _skladoveMnozstvi = 0;
    _nakupniCena;
    poznamka = "";
    constructor(id, nazev, nakupniCena, minimalniStav) {
        this.id = id;
        this.nazev = nazev;
        this.minimalniStav = minimalniStav;
        if (nazev.trim() === "") {
            throw new Error("Název dílu nesmí být prázdný!");
        }
        this.nakupniCena = nakupniCena;
    }
    get skladoveMnozstvi() { return this._skladoveMnozstvi; }
    set skladoveMnozstvi(hodnota) {
        this._skladoveMnozstvi = hodnota < 0 ? 0 : hodnota;
    }
    jePotrebaObjednat() {
        return this._skladoveMnozstvi < this.minimalniStav;
    }
    set nakupniCena(hodnota) {
        if (hodnota <= 0) {
            console.warn(`[Varování] Cena u "${this.nazev}" je neplatná. Nastavuji na 1 Kč.`);
            this._nakupniCena = 1;
        }
        else {
            this._nakupniCena = hodnota;
        }
    }
    get nakupniCena() { return this._nakupniCena; }
    pridatNaSklad(mnozstvi) {
        if (mnozstvi > 0)
            this._skladoveMnozstvi += mnozstvi;
    }
    // serializace do prosteho objektu pro localstorage
    serializuj() {
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
}
// mechanicky dil - ma material a hmotnost
export class MechanickyDil extends ZakladniDil {
    material;
    hmotnost;
    constructor(id, nazev, nakupniCena, minimalniStav, material, hmotnost) {
        super(id, nazev, nakupniCena, minimalniStav);
        this.material = material;
        this.hmotnost = hmotnost;
    }
    vypocitejKoncovouCenu() { return Math.round(this.nakupniCena * 1.25); }
    vypisDetail() { return `[Mechanika] ${this.nazev}`; }
    _getTyp() { return "mechanicky"; }
    _serializujSpecifika() { return { material: this.material, hmotnost: this.hmotnost }; }
}
// spotrebni material - ma volitelne parametry zivotnosti a objemu
export class SpotrebniMaterial extends ZakladniDil {
    zivotnostKm;
    objemMl;
    constructor(id, nazev, nakupniCena, minimalniStav, zivotnostKm, objemMl) {
        super(id, nazev, nakupniCena, minimalniStav);
        this.zivotnostKm = zivotnostKm;
        this.objemMl = objemMl;
    }
    vypocitejKoncovouCenu() { return Math.round(this.nakupniCena * 1.40); }
    vypisDetail() { return `[Spotřebák] ${this.nazev}`; }
    _getTyp() { return "spotrebni"; }
    _serializujSpecifika() { return { zivotnostKm: this.zivotnostKm, objemMl: this.objemMl }; }
}
// elektro komponent - ma kapacitu a verzi firmwaru
export class ElektroKomponent extends ZakladniDil {
    kapacitaWh;
    verzeFirmwaru;
    RECYKLACNI_POPLATEK = 25;
    constructor(id, nazev, nakupniCena, minimalniStav, kapacitaWh, verzeFirmwaru) {
        super(id, nazev, nakupniCena, minimalniStav);
        this.kapacitaWh = kapacitaWh;
        this.verzeFirmwaru = verzeFirmwaru;
    }
    vypocitejKoncovouCenu() { return Math.round((this.nakupniCena * 1.30) + this.RECYKLACNI_POPLATEK); }
    vypisDetail() { return `[Elektro] ${this.nazev}`; }
    _getTyp() { return "elektro"; }
    _serializujSpecifika() { return { kapacitaWh: this.kapacitaWh, verzeFirmwaru: this.verzeFirmwaru }; }
}
