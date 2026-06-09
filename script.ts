import { KATALOG_DILU } from './data.js';

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
    poznamka?: string; // Volitelná poznámka z databáze
}

// ==========================================
// 1. TŘÍDY A MODELY (OOP)
// ==========================================
abstract class ZakladniDil {
    protected _skladoveMnozstvi: number = 0;
    protected _nakupniCena!: number;
    public poznamka: string = ""; // Každý díl teď může mít poznámku

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

    get skladoveMnozstvi(): number {
        return this._skladoveMnozstvi;
    }

    set skladoveMnozstvi(hodnota: number) {
        if (hodnota < 0) {
            this._skladoveMnozstvi = 0;
        } else {
            this._skladoveMnozstvi = hodnota;
        }
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
    vypocitejKoncovouCenu(): number { return Math.round(this.nakupniCena * 1.25); }
    vypisDetail(): string { return `[Mechanika] ${this.nazev}`; }
}

class SpotrebniMaterial extends ZakladniDil {
    constructor(id: number, nazev: string, nakupniCena: number, minimalniStav: number, public zivotnostKm?: number, public objemMl?: number) {
        super(id, nazev, nakupniCena, minimalniStav);
    }
    vypocitejKoncovouCenu(): number { return Math.round(this.nakupniCena * 1.40); }
    vypisDetail(): string { return `[Spotřebák] ${this.nazev}`; }
}

class ElektroKomponent extends ZakladniDil {
    private readonly RECYKLACNI_POPLATEK = 25;
    constructor(id: number, nazev: string, nakupniCena: number, minimalniStav: number, public kapacitaWh: number, public verzeFirmwaru: string) {
        super(id, nazev, nakupniCena, minimalniStav);
    }
    vypocitejKoncovouCenu(): number { return Math.round((this.nakupniCena * 1.30) + this.RECYKLACNI_POPLATEK); }
    vypisDetail(): string { return `[Elektro] ${this.nazev}`; }
}

// ==========================================
// 2. INICIALIZACE SKLADU
// ==========================================
const skladCykloServisu: ZakladniDil[] = [];
let aktualniFiltr: string = "vse";

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
        } else { return; }
        
        // Načtení poznámky z data.js (pokud tam nějaká je)
        if (surovaData.poznamka) {
            novyDil.poznamka = surovaData.poznamka;
        }

        novyDil.pridatNaSklad(5);
        skladCykloServisu.push(novyDil);
    } catch (e) { console.error(e); }
});

// ==========================================
// 3. DOM ELEMENTY A FILTROVÁNÍ
// ==========================================
const htmlTabulkaBody = document.getElementById("sklad-tabulka-body") as HTMLTableSectionElement;
const htmlStatsHodnota = document.getElementById("stats-celkova-hodnota") as HTMLParagraphElement;
const htmlStatsKriticke = document.getElementById("stats-pocet-kritickych") as HTMLParagraphElement;
const formular = document.getElementById("sklad-form") as HTMLFormElement;
const selectTyp = document.getElementById("form-typ") as HTMLSelectElement;

const boxMaterial = document.getElementById("box-material") as HTMLDivElement;
const boxHmotnost = document.getElementById("box-hmotnost") as HTMLDivElement;
const boxZivotnost = document.getElementById("box-zivotnost") as HTMLDivElement;
const boxObjem = document.getElementById("box-objem") as HTMLDivElement;
const boxKapacita = document.getElementById("box-kapacita") as HTMLDivElement;
const boxFirmware = document.getElementById("box-firmware") as HTMLDivElement;

selectTyp.addEventListener("change", () => {
    const t = selectTyp.value;
    boxMaterial.style.display = t === "mechanicky" ? "block" : "none";
    boxHmotnost.style.display = t === "mechanicky" ? "block" : "none";
    boxZivotnost.style.display = t === "spotrebni" ? "block" : "none";
    boxObjem.style.display = t === "spotrebni" ? "block" : "none";
    boxKapacita.style.display = t === "elektro" ? "block" : "none";
    boxFirmware.style.display = t === "elektro" ? "block" : "none";
});

document.querySelectorAll(".btn-filtr").forEach(tlacitko => {
    tlacitko.addEventListener("click", () => {
        document.querySelectorAll(".btn-filtr").forEach(b => b.classList.remove("aktivni"));
        tlacitko.classList.add("aktivni");
        aktualniFiltr = tlacitko.getAttribute("data-filtr") || "vse";
        aktualizujWeboveRozhrani();
    });
});

// ==========================================
// 4. VYKRESLOVÁNÍ UI (Tabulka s poznámkou a smazáním)
// ==========================================
function aktualizujWeboveRozhrani(): void {
    htmlTabulkaBody.innerHTML = "";
    let celkovaHodnota = 0;
    let pocetKritickych = 0;

    skladCykloServisu.forEach(dil => {
        const jeKriticky = dil.jePotrebaObjednat();
        if (jeKriticky) pocetKritickych++;
        celkovaHodnota += dil.skladoveMnozstvi * dil.vypocitejKoncovouCenu();

        if (aktualniFiltr !== "vse") {
            if (aktualniFiltr === "kriticke" && !jeKriticky) return;
            if (aktualniFiltr === "mechanicky" && !(dil instanceof MechanickyDil)) return;
            if (aktualniFiltr === "spotrebni" && !(dil instanceof SpotrebniMaterial)) return;
            if (aktualniFiltr === "elektro" && !(dil instanceof ElektroKomponent)) return;
        }

        let spec = "";
        if (dil instanceof MechanickyDil) spec = `Mat: ${dil.material}, Váha: ${dil.hmotnost}g`;
        else if (dil instanceof SpotrebniMaterial) spec = `Životnost: ${dil.zivotnostKm || '-'}km, Obj: ${dil.objemMl || '-'}ml`;
        else if (dil instanceof ElektroKomponent) spec = `Kap: ${dil.kapacitaWh}Wh, FW: ${dil.verzeFirmwaru}`;

        const radek = document.createElement("tr");
        if (jeKriticky) radek.style.backgroundColor = "#ffdddd";

        radek.innerHTML = `
            <td><strong>${dil.constructor.name.replace("Dil", "").replace("Material", "")}</strong></td>
            <td>${dil.nazev}</td>
            <td>${dil.skladoveMnozstvi} ks</td>
            <td>${dil.minimalniStav} ks</td>
            <td>${dil.vypocitejKoncovouCenu()} Kč</td>
            <td><small>${spec}</small></td>
            <td><small>${dil.poznamka || "-"}</small></td> <td>
                <button class="btn-akce" onclick="upravMnozstviNaWebu(${dil.id}, 1)">+</button>
                <button class="btn-akce" onclick="upravMnozstviNaWebu(${dil.id}, -1)">-</button>
                <button class="btn-akce" style="background-color: #ffeaea; color: red;" onclick="smazatDilNaWebu(${dil.id})">❌</button> </td>
        `;
        htmlTabulkaBody.appendChild(radek);
    });

    htmlStatsHodnota.innerText = `${celkovaHodnota.toLocaleString()} Kč`;
    htmlStatsKriticke.innerText = `${pocetKritickych} ks`;
}

// ==========================================
// 5. ODESLÁNÍ FORMULÁŘE (Včetně uložení poznámky)
// ==========================================
formular.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
        const getInp = (id: string) => {
            const el = document.getElementById(id) as HTMLInputElement;
            if (!el) throw new Error(`Nenalezeno políčko: ${id}`);
            return el;
        };

        const nazev = getInp("form-nazev").value;
        const cena = Number(getInp("form-cena").value);
        const minimum = Number(getInp("form-minimum").value);
        const mnozstvi = Number(getInp("form-mnozstvi").value);
        const poznamkaText = getInp("form-poznamka").value; // Načtení poznámky
        const typ = selectTyp.value;
        const id = Date.now();

        let novyDil: ZakladniDil;

        if (typ === "mechanicky") {
            novyDil = new MechanickyDil(id, nazev, cena, minimum, getInp("form-material").value || "neurčeno", Number(getInp("form-hmotnost").value) || 0);
        } else if (typ === "spotrebni") {
            const ziv = getInp("form-zivotnost").value ? Number(getInp("form-zivotnost").value) : undefined;
            const obj = getInp("form-objem").value ? Number(getInp("form-objem").value) : undefined;
            novyDil = new SpotrebniMaterial(id, nazev, cena, minimum, ziv, obj);
        } else {
            novyDil = new ElektroKomponent(id, nazev, cena, minimum, Number(getInp("form-kapacita").value) || 0, getInp("form-firmware").value || "1.0.0");
        }

        novyDil.skladoveMnozstvi = mnozstvi;
        novyDil.poznamka = poznamkaText; // Zápis poznámky do objektu
        
        skladCykloServisu.push(novyDil);

        formular.reset();
        selectTyp.dispatchEvent(new Event("change"));
        aktualizujWeboveRozhrani();
    } catch (e: any) {
        alert(`Chyba: ${e.message}`);
    }
});

// ==========================================
// 6. GLOBÁLNÍ FUNKCE (Tlačítka z tabulky)
// ==========================================

// Plus a Mínus
(window as any).upravMnozstviNaWebu = (id: number, zmena: number) => {
    const d = skladCykloServisu.find(x => x.id === id);
    if (d) { d.skladoveMnozstvi += zmena; aktualizujWeboveRozhrani(); }
};

// Funkce pro smazání dílu
(window as any).smazatDilNaWebu = (id: number) => {
    if (confirm("Opravdu chcete tento díl trvale smazat ze skladu?")) {
        const index = skladCykloServisu.findIndex(d => d.id === id);
        if (index !== -1) {
            skladCykloServisu.splice(index, 1); // Odstraní 1 prvek na daném indexu
            aktualizujWeboveRozhrani(); // Okamžitě se to projeví v tabulce i statistikách
        }
    }
};

// PRVNÍ SPUŠTĚNÍ
selectTyp.dispatchEvent(new Event("change"));
aktualizujWeboveRozhrani();