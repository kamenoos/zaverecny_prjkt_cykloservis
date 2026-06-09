import { KATALOG_DILU } from './data.js';
// ==========================================
// 1. TŘÍDY A MODELY (OOP)
// ==========================================
class ZakladniDil {
    id;
    nazev;
    minimalniStav;
    _skladoveMnozstvi = 0;
    _nakupniCena;
    poznamka = ""; // Každý díl teď může mít poznámku
    constructor(id, nazev, nakupniCena, minimalniStav) {
        this.id = id;
        this.nazev = nazev;
        this.minimalniStav = minimalniStav;
        if (nazev.trim() === "") {
            throw new Error("Název dílu nesmí být prázdný!");
        }
        this.nakupniCena = nakupniCena;
    }
    get skladoveMnozstvi() {
        return this._skladoveMnozstvi;
    }
    set skladoveMnozstvi(hodnota) {
        if (hodnota < 0) {
            this._skladoveMnozstvi = 0;
        }
        else {
            this._skladoveMnozstvi = hodnota;
        }
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
    vypocitejKoncovouCenu() { return Math.round(this.nakupniCena * 1.25); }
    vypisDetail() { return `[Mechanika] ${this.nazev}`; }
}
class SpotrebniMaterial extends ZakladniDil {
    zivotnostKm;
    objemMl;
    constructor(id, nazev, nakupniCena, minimalniStav, zivotnostKm, objemMl) {
        super(id, nazev, nakupniCena, minimalniStav);
        this.zivotnostKm = zivotnostKm;
        this.objemMl = objemMl;
    }
    vypocitejKoncovouCenu() { return Math.round(this.nakupniCena * 1.40); }
    vypisDetail() { return `[Spotřebák] ${this.nazev}`; }
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
    vypocitejKoncovouCenu() { return Math.round((this.nakupniCena * 1.30) + this.RECYKLACNI_POPLATEK); }
    vypisDetail() { return `[Elektro] ${this.nazev}`; }
}
// ==========================================
// 2. INICIALIZACE SKLADU
// ==========================================
const skladCykloServisu = [];
let aktualniFiltr = "vse";
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
        // Načtení poznámky z data.js (pokud tam nějaká je)
        if (surovaData.poznamka) {
            novyDil.poznamka = surovaData.poznamka;
        }
        novyDil.pridatNaSklad(5);
        skladCykloServisu.push(novyDil);
    }
    catch (e) {
        console.error(e);
    }
});
// ==========================================
// 3. DOM ELEMENTY A FILTROVÁNÍ
// ==========================================
const htmlTabulkaBody = document.getElementById("sklad-tabulka-body");
const htmlStatsHodnota = document.getElementById("stats-celkova-hodnota");
const htmlStatsKriticke = document.getElementById("stats-pocet-kritickych");
const formular = document.getElementById("sklad-form");
const selectTyp = document.getElementById("form-typ");
const boxMaterial = document.getElementById("box-material");
const boxHmotnost = document.getElementById("box-hmotnost");
const boxZivotnost = document.getElementById("box-zivotnost");
const boxObjem = document.getElementById("box-objem");
const boxKapacita = document.getElementById("box-kapacita");
const boxFirmware = document.getElementById("box-firmware");
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
function aktualizujWeboveRozhrani() {
    htmlTabulkaBody.innerHTML = "";
    let celkovaHodnota = 0;
    let pocetKritickych = 0;
    skladCykloServisu.forEach(dil => {
        const jeKriticky = dil.jePotrebaObjednat();
        if (jeKriticky)
            pocetKritickych++;
        celkovaHodnota += dil.skladoveMnozstvi * dil.vypocitejKoncovouCenu();
        if (aktualniFiltr !== "vse") {
            if (aktualniFiltr === "kriticke" && !jeKriticky)
                return;
            if (aktualniFiltr === "mechanicky" && !(dil instanceof MechanickyDil))
                return;
            if (aktualniFiltr === "spotrebni" && !(dil instanceof SpotrebniMaterial))
                return;
            if (aktualniFiltr === "elektro" && !(dil instanceof ElektroKomponent))
                return;
        }
        let spec = "";
        if (dil instanceof MechanickyDil)
            spec = `Mat: ${dil.material}, Váha: ${dil.hmotnost}g`;
        else if (dil instanceof SpotrebniMaterial)
            spec = `Životnost: ${dil.zivotnostKm || '-'}km, Obj: ${dil.objemMl || '-'}ml`;
        else if (dil instanceof ElektroKomponent)
            spec = `Kap: ${dil.kapacitaWh}Wh, FW: ${dil.verzeFirmwaru}`;
        const radek = document.createElement("tr");
        if (jeKriticky)
            radek.style.backgroundColor = "#ffdddd";
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
        const getInp = (id) => {
            const el = document.getElementById(id);
            if (!el)
                throw new Error(`Nenalezeno políčko: ${id}`);
            return el;
        };
        const nazev = getInp("form-nazev").value;
        const cena = Number(getInp("form-cena").value);
        const minimum = Number(getInp("form-minimum").value);
        const mnozstvi = Number(getInp("form-mnozstvi").value);
        const poznamkaText = getInp("form-poznamka").value; // Načtení poznámky
        const typ = selectTyp.value;
        const id = Date.now();
        let novyDil;
        if (typ === "mechanicky") {
            novyDil = new MechanickyDil(id, nazev, cena, minimum, getInp("form-material").value || "neurčeno", Number(getInp("form-hmotnost").value) || 0);
        }
        else if (typ === "spotrebni") {
            const ziv = getInp("form-zivotnost").value ? Number(getInp("form-zivotnost").value) : undefined;
            const obj = getInp("form-objem").value ? Number(getInp("form-objem").value) : undefined;
            novyDil = new SpotrebniMaterial(id, nazev, cena, minimum, ziv, obj);
        }
        else {
            novyDil = new ElektroKomponent(id, nazev, cena, minimum, Number(getInp("form-kapacita").value) || 0, getInp("form-firmware").value || "1.0.0");
        }
        novyDil.skladoveMnozstvi = mnozstvi;
        novyDil.poznamka = poznamkaText; // Zápis poznámky do objektu
        skladCykloServisu.push(novyDil);
        formular.reset();
        selectTyp.dispatchEvent(new Event("change"));
        aktualizujWeboveRozhrani();
    }
    catch (e) {
        alert(`Chyba: ${e.message}`);
    }
});
// ==========================================
// 6. GLOBÁLNÍ FUNKCE (Tlačítka z tabulky)
// ==========================================
// Plus a Mínus
window.upravMnozstviNaWebu = (id, zmena) => {
    const d = skladCykloServisu.find(x => x.id === id);
    if (d) {
        d.skladoveMnozstvi += zmena;
        aktualizujWeboveRozhrani();
    }
};
// Funkce pro smazání dílu
window.smazatDilNaWebu = (id) => {
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
