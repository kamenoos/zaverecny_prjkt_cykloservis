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
        // Spustí setter pro validaci ceny
        this.nakupniCena = nakupniCena; 
    }

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

console.log("\nVýpis skladu");
skladCykloServisu.forEach(dil => {
    console.log(dil.vypisDetail());
});