import { KATALOG_DILU } from './data.js';
// logika kodu oop
class ZakladniDil {
    id;
    nazev;
    minimalniStav;
    _skladoveMnozstvi = 0;
    _nakupniCena;
    constructor(id, nazev, nakupniCena, minimalniStav) {
        this.id = id;
        this.nazev = nazev;
        this.minimalniStav = minimalniStav;
        if (nazev.trim() === "") {
            throw new Error("Název dílu nesmí být prázdný!");
        }
        // Spustí setter pro validaci ceny
        this.nakupniCena = nakupniCena;
    }
    set nakupniCena(hodnota) {
        if (hodnota <= 0) {
            console.warn(`[Varování] Cena u "${this.nazev}" je neplatná (${hodnota} Kč). Nastavuji na 1 Kč.`);
            this._nakupniCena = 1;
        }
        else {
            this._nakupniCena = hodnota;
        }
    }
    get nakupniCena() {
        return this._nakupniCena;
    }
    pridatNaSklad(mnozstvi) {
        if (mnozstvi > 0) {
            this._skladoveMnozstvi += mnozstvi;
        }
    }
}
class MechanickyDil extends ZakladniDil {
    material;
    hmotnost;
    constructor(id, nazev, nakupniCena, minimalniStav, material, hmotnost) {
        super(id, nazev, nakupniCena, minimalniStav);
        this.material = material;
        this.hmotnost = hmotnost;
    }
    vypocitejKoncovouCenu() {
        return Math.round(this.nakupniCena * 1.25);
    }
    vypisDetail() {
        return `[Mechanika] ${this.nazev} | Mat: ${this.material} | Váha: ${this.hmotnost}g | Koncová cena: ${this.vypocitejKoncovouCenu()} Kč`;
    }
}
class SpotrebniMaterial extends ZakladniDil {
    zivotnostKm;
    objemMl;
    constructor(id, nazev, nakupniCena, minimalniStav, zivotnostKm, objemMl) {
        super(id, nazev, nakupniCena, minimalniStav);
        this.zivotnostKm = zivotnostKm;
        this.objemMl = objemMl;
    }
    vypocitejKoncovouCenu() {
        return Math.round(this.nakupniCena * 1.40);
    }
    vypisDetail() {
        let detail = `[Spotřebák] ${this.nazev} | Koncová cena: ${this.vypocitejKoncovouCenu()} Kč`;
        if (this.zivotnostKm) {
            detail += ` | Životnost: ${this.zivotnostKm}km`;
        }
        if (this.objemMl) {
            detail += ` | Objem: ${this.objemMl}ml`;
        }
        return detail;
    }
}
class ElektroKomponent extends ZakladniDil {
    kapacitaWh;
    verzeFirmwaru;
    RECYKLACNI_POPLATEK = 25;
    constructor(id, nazev, nakupniCena, minimalniStav, kapacitaWh, verzeFirmwaru) {
        super(id, nazev, nakupniCena, minimalniStav);
        this.kapacitaWh = kapacitaWh;
        this.verzeFirmwaru = verzeFirmwaru;
    }
    vypocitejKoncovouCenu() {
        return Math.round((this.nakupniCena * 1.30) + this.RECYKLACNI_POPLATEK);
    }
    vypisDetail() {
        return `[Elektro] ${this.nazev} | Baterie: ${this.kapacitaWh}Wh | FW: ${this.verzeFirmwaru} | Koncová cena: ${this.vypocitejKoncovouCenu()} Kč`;
    }
}
// hlavní logika aplikace
const skladCykloServisu = [];
//SurovyDil jako typ pro objekty z JS souboru
const katalog = KATALOG_DILU;
katalog.forEach((surovaData) => {
    try {
        let novyDil;
        if (surovaData.typ === "mechanicky") {
            novyDil = new MechanickyDil(surovaData.id, surovaData.nazev, surovaData.nakupniCena, surovaData.minimalniStav, surovaData.material, surovaData.hmotnost);
        }
        else if (surovaData.typ === "spotrebni") {
            novyDil = new SpotrebniMaterial(surovaData.id, surovaData.nazev, surovaData.nakupniCena, surovaData.minimalniStav, surovaData.zivotnostKm, surovaData.objemMl);
        }
        else if (surovaData.typ === "elektro") {
            novyDil = new ElektroKomponent(surovaData.id, surovaData.nazev, surovaData.nakupniCena, surovaData.minimalniStav, surovaData.kapacitaWh, surovaData.verzeFirmwaru);
        }
        else {
            return;
        }
        novyDil.pridatNaSklad(5);
        skladCykloServisu.push(novyDil);
    }
    catch (error) {
        console.error("Chyba při vytváření objektu:", error);
    }
});
console.log("\nVýpis skladu");
skladCykloServisu.forEach(dil => {
    console.log(dil.vypisDetail());
});
