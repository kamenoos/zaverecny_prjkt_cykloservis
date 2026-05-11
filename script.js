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
    constructor(id, nazev, nakupniCena, minimalniStav, zivotnostKm) {
        super(id, nazev, nakupniCena, minimalniStav);
        this.zivotnostKm = zivotnostKm;
    }
    vypocitejKoncovouCenu() {
        return Math.round(this.nakupniCena * 1.40);
    }
    vypisDetail() {
        return `[Spotřebák] ${this.nazev} | Životnost: ${this.zivotnostKm}km | Koncová cena: ${this.vypocitejKoncovouCenu()} Kč`;
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
            novyDil = new SpotrebniMaterial(surovaData.id, surovaData.nazev, surovaData.nakupniCena, surovaData.minimalniStav, surovaData.zivotnostKm);
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
