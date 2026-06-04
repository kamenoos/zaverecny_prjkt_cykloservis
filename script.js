import { KATALOG_DILU } from './data.js';
// logika kodu oop
// OPAVENÁ ABSTRAKTNÍ TŘÍDA - nahraď jí tu původní ve script.ts
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
        this.nakupniCena = nakupniCena;
    }
    // =======================================================
    // NOVÉ PRVKY: Getter, setter a metoda pro kontrolu skladu
    // =======================================================
    // Getter: Umožní programu zvenku bezpečně přečíst stav skladu
    get skladoveMnozstvi() {
        return this._skladoveMnozstvi;
    }
    // Setter: Umožní měnit množství a rovnou hlídá, aby nebylo záporné
    set skladoveMnozstvi(hodnota) {
        if (hodnota < 0) {
            this._skladoveMnozstvi = 0;
            console.warn(`[Varování] Množství u "${this.nazev}" nemůže být záporné. Nastavuji 0.`);
        }
        else {
            this._skladoveMnozstvi = hodnota;
        }
    }
    // Veřejná metoda: Zjistí, zda aktuální stav klesl pod minimum
    jePotrebaObjednat() {
        return this._skladoveMnozstvi < this.minimalniStav;
    }
    // =======================================================
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
// ==========================================
// 4. FUNKCE PRO SPRÁVU SKLADU (Příprava pro UI)
// ==========================================
/**
 * Spočítá celkovou hodnotu veškerého zboží na skladě v koncových cenách
 */
function vypocitejCelkovouHodnotuSkladu() {
    let celkovaSuma = 0;
    skladCykloServisu.forEach(dil => {
        // Hodnota položky = množství na skladě * její koncová cena
        celkovaSuma += dil.skladoveMnozstvi * dil.vypocitejKoncovouCenu();
    });
    return celkovaSuma;
}
/**
 * Vrátí pole všech dílů, jejichž stav na skladě klesl pod stanovené minimum
 */
function ziskejDilyPodMinimem() {
    // Využijeme vestavěnou JS funkci filter a naši metodu z bázové třídy
    return skladCykloServisu.filter(dil => dil.jePotrebaObjednat());
}
/**
 * Funkce, kterou později zavolá HTML formulář při odeslání.
 * Nasimuluje přidání úplně nového dílu majitelem servisu.
 */
function naskladniNovyZcelaUnikatniDil(surovaData, pocatecniMnozstvi) {
    try {
        let novyDil;
        // Naše známá formička na oživení objektu
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
            throw new Error("Neznámý typ dílu!");
        }
        novyDil.pridatNaSklad(pocatecniMnozstvi);
        skladCykloServisu.push(novyDil);
        console.log(`[Úspěch] Do skladu byl úspěšně přidán nový díl: ${novyDil.nazev}`);
    }
    catch (error) {
        console.error("Nepodařilo se přidat díl z formuláře:", error);
    }
}
// ==========================================
// 5. TEST NOVÝCH FUNKCÍ V KONZOLI
// ==========================================
console.log("\n=== TEST STATISTIK PRO UI ===");
// Vyzkoušíme výpočet celkové hodnoty
console.log(`Celková hodnota skladu: ${vypocitejCelkovouHodnotuSkladu()} Kč`);
// Nasimulujeme situaci, že nám u některého dílu klesne počet pod minimum
// Vybereme např. hned první díl (Řetězová převodovka) a nastavíme množství na 1 ks (minimum má 2)
skladCykloServisu[0].skladoveMnozstvi = 1;
// Vyzkoušíme filtr nedostatkových dílů
const dilyKObjednani = ziskejDilyPodMinimem();
console.log(`Počet dílů pod minimem: ${dilyKObjednani.length}`);
dilyKObjednani.forEach(d => console.log(` -> NUTNO OBJEDNAT: ${d.nazev} (Na skladě: ${d.skladoveMnozstvi}ks / Min: ${d.minimalniStav}ks)`));
// Vyzkoušíme funkci pro formulář - majitel přidává přes web nové zboží
naskladniNovyZcelaUnikatniDil({
    id: 99,
    typ: "spotrebni",
    nazev: "Brzdová kapalina DOT 4",
    nakupniCena: 190,
    minimalniStav: 2,
    objemMl: 250
}, 10);
// Ověříme, že se hodnota skladu po přidání nového zboží přepočítala a zvýšila
console.log(`Nová celková hodnota skladu: ${vypocitejCelkovouHodnotuSkladu()} Kč`);
console.log("\nVýpis skladu");
skladCykloServisu.forEach(dil => {
    console.log(dil.vypisDetail());
});
