import { ZakladniDil, MechanickyDil, SpotrebniMaterial, ElektroKomponent } from '../../models.js';
import { ulozSklad } from '../../storage.js';
import { vytvorDilZDat } from '../../factory.js';
import { aktualizujWeboveRozhrani } from './renderer.js';

// ==========================================
// event handlery a akce
// ==========================================

// nastavi tlacitka filtru v seznamu dilu
export function nastavitFiltraci(aktualniFiltr: { filtr: string }, skladCykloServisu: ZakladniDil[], 
    htmlTabulkaBody: HTMLTableSectionElement, htmlStatsHodnota: HTMLParagraphElement, 
    htmlStatsKriticke: HTMLParagraphElement, editovaneId: number | null): void {
    
    document.querySelectorAll(".btn-filtr").forEach(tlacitko => {
        tlacitko.addEventListener("click", () => {
            document.querySelectorAll(".btn-filtr").forEach(b => b.classList.remove("aktivni"));
            tlacitko.classList.add("aktivni");
            aktualniFiltr.filtr = tlacitko.getAttribute("data-filtr") || "vse";
            aktualizujWeboveRozhrani(skladCykloServisu, htmlTabulkaBody, htmlStatsHodnota, htmlStatsKriticke, aktualniFiltr.filtr, editovaneId);
        });
    });
}

export function nastavitFiltrPoliFomulare(selectTyp: HTMLSelectElement): void {
    // pri zmene typu dilu ve formulari zobrazime nebo skryjeme spravna pole
    selectTyp.addEventListener("change", () => {
        const t = selectTyp.value;
        const boxMaterial  = document.getElementById("box-material")  as HTMLDivElement;
        const boxHmotnost  = document.getElementById("box-hmotnost")  as HTMLDivElement;
        const boxZivotnost = document.getElementById("box-zivotnost") as HTMLDivElement;
        const boxObjem     = document.getElementById("box-objem")     as HTMLDivElement;
        const boxKapacita  = document.getElementById("box-kapacita")  as HTMLDivElement;
        const boxFirmware  = document.getElementById("box-firmware")  as HTMLDivElement;

        boxMaterial.style.display  = t === "mechanicky" ? "block" : "none";
        boxHmotnost.style.display  = t === "mechanicky" ? "block" : "none";
        boxZivotnost.style.display = t === "spotrebni"  ? "block" : "none";
        boxObjem.style.display     = t === "spotrebni"  ? "block" : "none";
        boxKapacita.style.display  = t === "elektro"    ? "block" : "none";
        boxFirmware.style.display  = t === "elektro"    ? "block" : "none";
    });
}

export function nastavitExport(skladCykloServisu: ZakladniDil[]): void {
    // tlacitko na export dat skladu do json souboru
    const btnExport = document.getElementById("btn-export") as HTMLButtonElement;
    btnExport.addEventListener("click", () => {
        const data = skladCykloServisu.map(d => d.serializuj());
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cyklosklad_export_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

export function nastavitFormularOdeslani(
    skladCykloServisu: ZakladniDil[],
    formular: HTMLFormElement,
    selectTyp: HTMLSelectElement,
    htmlTabulkaBody: HTMLTableSectionElement,
    htmlStatsHodnota: HTMLParagraphElement,
    htmlStatsKriticke: HTMLParagraphElement,
    stav: { filtr: string; editovaneId: number | null }
): void {
    formular.addEventListener("submit", (event) => {
        event.preventDefault();
        try {
            const getInp = (id: string) => {
                const el = document.getElementById(id) as HTMLInputElement;
                if (!el) throw new Error(`Nenalezeno políčko: ${id}`);
                return el;
            };

            const nazev      = getInp("form-nazev").value;
            const cena       = Number(getInp("form-cena").value);
            const minimum    = Number(getInp("form-minimum").value);
            const mnozstvi   = Number(getInp("form-mnozstvi").value);
            const poznamka   = getInp("form-poznamka").value;
            const typ        = selectTyp.value;
            const id         = Date.now();

            let novyDil: ZakladniDil;

            if (typ === "mechanicky") {
                novyDil = new MechanickyDil(id, nazev, cena, minimum,
                    getInp("form-material").value || "neurčeno",
                    Number(getInp("form-hmotnost").value) || 0);
            } else if (typ === "spotrebni") {
                const ziv = getInp("form-zivotnost").value ? Number(getInp("form-zivotnost").value) : undefined;
                const obj = getInp("form-objem").value     ? Number(getInp("form-objem").value)     : undefined;
                novyDil = new SpotrebniMaterial(id, nazev, cena, minimum, ziv, obj);
            } else {
                novyDil = new ElektroKomponent(id, nazev, cena, minimum,
                    Number(getInp("form-kapacita").value) || 0,
                    getInp("form-firmware").value || "1.0.0");
            }

            novyDil.skladoveMnozstvi = mnozstvi;
            novyDil.poznamka = poznamka;
            skladCykloServisu.push(novyDil);

            formular.reset();
            selectTyp.dispatchEvent(new Event("change"));
            ulozSklad(skladCykloServisu);
            aktualizujWeboveRozhrani(skladCykloServisu, htmlTabulkaBody, htmlStatsHodnota, htmlStatsKriticke, stav.filtr, stav.editovaneId);
        } catch (e: any) {
            alert(`Chyba: ${e.message}`);
        }
    });
}

// ==========================================
// globalni funkce (tlacitka z tabulky)
// ==========================================

export function nastavitGlobalniPomocneFunkce(
    skladCykloServisu: ZakladniDil[],
    htmlTabulkaBody: HTMLTableSectionElement,
    htmlStatsHodnota: HTMLParagraphElement,
    htmlStatsKriticke: HTMLParagraphElement,
    stav: { filtr: string; editovaneId: number | null }
): void {
    (window as any).upravMnozstviNaWebu = (id: number, zmena: number) => {
        const d = skladCykloServisu.find(x => x.id === id);
        if (d) {
            d.skladoveMnozstvi += zmena;
            ulozSklad(skladCykloServisu);
            aktualizujWeboveRozhrani(skladCykloServisu, htmlTabulkaBody, htmlStatsHodnota, htmlStatsKriticke, stav.filtr, stav.editovaneId);
        }
    };

    (window as any).smazatDilNaWebu = (id: number) => {
        if (confirm("Opravdu chcete tento díl trvale smazat ze skladu?")) {
            const index = skladCykloServisu.findIndex(d => d.id === id);
            if (index !== -1) {
                skladCykloServisu.splice(index, 1);
                ulozSklad(skladCykloServisu);
                aktualizujWeboveRozhrani(skladCykloServisu, htmlTabulkaBody, htmlStatsHodnota, htmlStatsKriticke, stav.filtr, stav.editovaneId);
            }
        }
    };

    (window as any).spustitEditaci = (id: number) => {
        stav.editovaneId = id;
        aktualizujWeboveRozhrani(skladCykloServisu, htmlTabulkaBody, htmlStatsHodnota, htmlStatsKriticke, stav.filtr, stav.editovaneId);
    };

    (window as any).zrusitEditaci = () => {
        stav.editovaneId = null;
        aktualizujWeboveRozhrani(skladCykloServisu, htmlTabulkaBody, htmlStatsHodnota, htmlStatsKriticke, stav.filtr, stav.editovaneId);
    };

    (window as any).ulozitEditaci = (id: number) => {
        const dil = skladCykloServisu.find(x => x.id === id);
        if (!dil) return;

        const nazev    = (document.getElementById("edit-nazev")    as HTMLInputElement).value.trim();
        const mnozstvi = Number((document.getElementById("edit-mnozstvi") as HTMLInputElement).value);
        const minimum  = Number((document.getElementById("edit-minimum")  as HTMLInputElement).value);
        const cena     = Number((document.getElementById("edit-cena")     as HTMLInputElement).value);
        const poznamka = (document.getElementById("edit-poznamka") as HTMLInputElement).value;

        if (!nazev) { alert("Název nesmí být prázdný!"); return; }
        if (cena <= 0) { alert("Cena musí být kladná!"); return; }
        if (minimum < 1) { alert("Minimální stav musí být alespoň 1!"); return; }

        const sData = dil.serializuj();
        const novyDil = vytvorDilZDat({
            ...sData,
            nazev,
            nakupniCena: cena,
            minimalniStav: minimum,
            skladoveMnozstvi: mnozstvi,
            poznamka
        });
        if (!novyDil) return;

        const index = skladCykloServisu.findIndex(x => x.id === id);
        skladCykloServisu[index] = novyDil;

        stav.editovaneId = null;
        ulozSklad(skladCykloServisu);
        aktualizujWeboveRozhrani(skladCykloServisu, htmlTabulkaBody, htmlStatsHodnota, htmlStatsKriticke, stav.filtr, stav.editovaneId);
    };
}
