import { KATALOG_DILU } from './data.js';

// definice typů pro data z JS souboru
type TypDilu = "mechanicky" | "spotrebni" | "elektro";

interface SurovyDil {
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
}

// logika kodu oop
// OPAVENÁ ABSTRAKTNÍ TŘÍDA - nahraď jí tu původní ve script.ts
abstract class ZakladniDil {
    protected _skladoveMnozstvi: number = 0;
    protected _nakupniCena!: number;

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

    // =======================================================
    // NOVÉ PRVKY: Getter, setter a metoda pro kontrolu skladu
    // =======================================================
    
    // Getter: Umožní programu zvenku bezpečně přečíst stav skladu
    get skladoveMnozstvi(): number {
        return this._skladoveMnozstvi;
    }

    // Setter: Umožní měnit množství a rovnou hlídá, aby nebylo záporné
    set skladoveMnozstvi(hodnota: number) {
        if (hodnota < 0) {
            this._skladoveMnozstvi = 0;
            console.warn(`[Varování] Množství u "${this.nazev}" nemůže být záporné. Nastavuji 0.`);
        } else {
            this._skladoveMnozstvi = hodnota;
        }
    }

    // Veřejná metoda: Zjistí, zda aktuální stav klesl pod minimum
    public jePotrebaObjednat(): boolean {
        return this._skladoveMnozstvi < this.minimalniStav;
    }
    // =======================================================

    set nakupniCena(hodnota: number) {
        if (hodnota <= 0) {
            console.warn(`[Varování] Cena u "${this.nazev}" je neplatná (${hodnota} Kč). Nastavuji na 1 Kč.`);
            this._nakupniCena = 1;
        } else {
            this._nakupniCena = hodnota;
        }
    }

    get nakupniCena(): number {
        return this._nakupniCena;
    }

    public pridatNaSklad(mnozstvi: number): void {
        if (mnozstvi > 0) {
            this._skladoveMnozstvi += mnozstvi;
        }
    }

    abstract vypocitejKoncovouCenu(): number;
    abstract vypisDetail(): string;
}

class MechanickyDil extends ZakladniDil {
    constructor(id: number, nazev: string, nakupniCena: number, minimalniStav: number, public material: string, public hmotnost: number) {
        super(id, nazev, nakupniCena, minimalniStav);
    }

    vypocitejKoncovouCenu(): number {
        return Math.round(this.nakupniCena * 1.25);
    }

    vypisDetail(): string {
        return `[Mechanika] ${this.nazev} | Mat: ${this.material} | Váha: ${this.hmotnost}g | Koncová cena: ${this.vypocitejKoncovouCenu()} Kč`;
    }
}

class SpotrebniMaterial extends ZakladniDil {
    constructor(id: number, nazev: string, nakupniCena: number, minimalniStav: number, public zivotnostKm?: number, public objemMl?: number) {
        super(id, nazev, nakupniCena, minimalniStav);
    }

    vypocitejKoncovouCenu(): number {
        return Math.round(this.nakupniCena * 1.40);
    }

    vypisDetail(): string {
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
    private readonly RECYKLACNI_POPLATEK = 25;

    constructor(id: number, nazev: string, nakupniCena: number, minimalniStav: number, public kapacitaWh: number, public verzeFirmwaru: string) {
        super(id, nazev, nakupniCena, minimalniStav);
    }

    vypocitejKoncovouCenu(): number {
        return Math.round((this.nakupniCena * 1.30) + this.RECYKLACNI_POPLATEK);
    }

    vypisDetail(): string {
        return `[Elektro] ${this.nazev} | Baterie: ${this.kapacitaWh}Wh | FW: ${this.verzeFirmwaru} | Koncová cena: ${this.vypocitejKoncovouCenu()} Kč`;
    }
}

// hlavní logika aplikace

const skladCykloServisu: ZakladniDil[] = [];

//SurovyDil jako typ pro objekty z JS souboru
const katalog = KATALOG_DILU as SurovyDil[];
katalog.forEach((surovaData: SurovyDil) => {
    try {
        let novyDil: ZakladniDil;

        if (surovaData.typ === "mechanicky") {
            novyDil = new MechanickyDil(surovaData.id, surovaData.nazev, surovaData.nakupniCena, surovaData.minimalniStav, surovaData.material!, surovaData.hmotnost!);
        } else if (surovaData.typ === "spotrebni") {
            novyDil = new SpotrebniMaterial(surovaData.id, surovaData.nazev, surovaData.nakupniCena, surovaData.minimalniStav, surovaData.zivotnostKm, surovaData.objemMl);
        } else if (surovaData.typ === "elektro") {
            novyDil = new ElektroKomponent(surovaData.id, surovaData.nazev, surovaData.nakupniCena, surovaData.minimalniStav, surovaData.kapacitaWh!, surovaData.verzeFirmwaru!);
        } else {
            return;
        }

        novyDil.pridatNaSklad(5);
        skladCykloServisu.push(novyDil);

    } catch (error) {
        console.error("Chyba při vytváření objektu:", error);
    }
});

// ==========================================
// 4. FUNKCE PRO SPRÁVU SKLADU (Příprava pro UI)
// ==========================================

/**
 * Spočítá celkovou hodnotu veškerého zboží na skladě v koncových cenách
 */
function vypocitejCelkovouHodnotuSkladu(): number {
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
function ziskejDilyPodMinimem(): ZakladniDil[] {
    // Využijeme vestavěnou JS funkci filter a naši metodu z bázové třídy
    return skladCykloServisu.filter(dil => dil.jePotrebaObjednat());
}

/**
 * Funkce, kterou později zavolá HTML formulář při odeslání.
 * Nasimuluje přidání úplně nového dílu majitelem servisu.
 */
function naskladniNovyZcelaUnikatniDil(surovaData: SurovyDil, pocatecniMnozstvi: number): void {
    try {
        let novyDil: ZakladniDil;

        // Naše známá formička na oživení objektu
        if (surovaData.typ === "mechanicky") {
            novyDil = new MechanickyDil(surovaData.id, surovaData.nazev, surovaData.nakupniCena, surovaData.minimalniStav, surovaData.material!, surovaData.hmotnost!);
        } else if (surovaData.typ === "spotrebni") {
            novyDil = new SpotrebniMaterial(surovaData.id, surovaData.nazev, surovaData.nakupniCena, surovaData.minimalniStav, surovaData.zivotnostKm, surovaData.objemMl);
        } else if (surovaData.typ === "elektro") {
            novyDil = new ElektroKomponent(surovaData.id, surovaData.nazev, surovaData.nakupniCena, surovaData.minimalniStav, surovaData.kapacitaWh!, surovaData.verzeFirmwaru!);
        } else {
            throw new Error("Neznámý typ dílu!");
        }

        novyDil.pridatNaSklad(pocatecniMnozstvi);
        skladCykloServisu.push(novyDil);
        console.log(`[Úspěch] Do skladu byl úspěšně přidán nový díl: ${novyDil.nazev}`);

    } catch (error) {
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

