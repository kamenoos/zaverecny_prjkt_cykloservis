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
        this.nakupniCena = nakupniCena;
    }
    //Getter, setter a metoda pro kontrolu skladu
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
    //Zjistí, zda aktuální stav klesl pod minimum
    jePotrebaObjednat() {
        return this._skladoveMnozstvi < this.minimalniStav;
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
// ==========================================
// 4. INICIALIZACE A OŽIVENÍ DAT Z ČÍSELNÍKU
// ==========================================
const skladCykloServisu = [];
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
        console.error("Chyba při naskladnění z číselníku:", error);
    }
});
// ==========================================
// 5. DOM ELEMENTY A GLOBÁLNÍ STAV FILTRU
// ==========================================
let aktualniFiltr = "vse"; // Tady si pamatujeme, co má tabulka zrovna ukazovat
const htmlTabulkaBody = document.getElementById("sklad-tabulka-body");
const htmlStatsHodnota = document.getElementById("stats-celkova-hodnota");
const htmlStatsKriticke = document.getElementById("stats-pocet-kritickych");
const formular = document.getElementById("sklad-form");
const selectTyp = document.getElementById("form-typ");
// Políčka formuláře
const inputNazev = document.getElementById("form-nazev");
const inputCena = document.getElementById("form-cena");
const inputMinimum = document.getElementById("form-minimum");
const inputMnozstvi = document.getElementById("form-mnozstvi");
// Specifické boxy pro skrývání
const boxMaterial = document.getElementById("box-material");
const boxHmotnost = document.getElementById("box-hmotnost");
const boxZivotnost = document.getElementById("box-zivotnost");
const boxObjem = document.getElementById("box-objem");
const boxKapacita = document.getElementById("box-kapacita");
const boxFirmware = document.getElementById("box-firmware");
// ==========================================
// 6. LOGIKA FORMULÁŘE (Skrývání políček podle typu)
// ==========================================
selectTyp.addEventListener("change", () => {
    const zvolenyTyp = selectTyp.value;
    boxMaterial.style.display = "none";
    boxHmotnost.style.display = "none";
    boxZivotnost.style.display = "none";
    boxObjem.style.display = "none";
    boxKapacita.style.display = "none";
    boxFirmware.style.display = "none";
    if (zvolenyTyp === "mechanicky") {
        boxMaterial.style.display = "block";
        boxHmotnost.style.display = "block";
    }
    else if (zvolenyTyp === "spotrebni") {
        boxZivotnost.style.display = "block";
        boxObjem.style.display = "block";
    }
    else if (zvolenyTyp === "elektro") {
        boxKapacita.style.display = "block";
        boxFirmware.style.display = "block";
    }
});
// ==========================================
// 7. OŽIVENÍ FILTRŮ (To, co minule chybělo!)
// ==========================================
const tlacitkaFiltru = document.querySelectorAll(".btn-filtr");
tlacitkaFiltru.forEach(tlacitko => {
    tlacitko.addEventListener("click", () => {
        // Aktivní vizuální třídu vezmeme všem a dáme ji jen tomu, na které se kliklo
        tlacitkaFiltru.forEach(btn => btn.classList.remove("aktivni"));
        tlacitko.classList.add("aktivni");
        // Uložíme si hodnotu filtru (vse, mechanicky, spotrebni, elektro, kriticke)
        aktualniFiltr = tlacitko.getAttribute("data-filtr") || "vse";
        // Překreslíme tabulku podle nového filtru
        aktualizujWeboveRozhrani();
    });
});
// ==========================================
// 8. VYKRESLENÍ INTERFACOVÉHO UI (S podporou filtrů)
// ==========================================
function aktualizujWeboveRozhrani() {
    htmlTabulkaBody.innerHTML = "";
    let celkovaHodnotaSkladu = 0;
    let pocetKritickychDilu = 0;
    skladCykloServisu.forEach(dil => {
        const rizikovyStav = dil.jePotrebaObjednat();
        // Statistiky počítáme VŽDY z celého skladu, bez ohledu na zapnutý filtr
        if (rizikovyStav)
            pocetKritickychDilu++;
        celkovaHodnotaSkladu += dil.skladoveMnozstvi * dil.vypocitejKoncovouCenu();
        // KROK FILTROVÁNÍ: Pokud položka neodpovídá filtru, přeskočíme ji a nevykreslíme
        if (aktualniFiltr !== "vse") {
            if (aktualniFiltr === "kriticke" && !rizikovyStav)
                return;
            if (aktualniFiltr === "mechanicky" && !(dil instanceof MechanickyDil))
                return;
            if (aktualniFiltr === "spotrebni" && !(dil instanceof SpotrebniMaterial))
                return;
            if (aktualniFiltr === "elektro" && !(dil instanceof ElektroKomponent))
                return;
        }
        let specifickyText = "";
        if (dil instanceof MechanickyDil) {
            specifickyText = `Mat: ${dil.material}, Váha: ${dil.hmotnost}g`;
        }
        else if (dil instanceof SpotrebniMaterial) {
            const ziv = dil.zivotnostKm ? `${dil.zivotnostKm}km` : "-";
            const obj = dil.objemMl ? `${dil.objemMl}ml` : "-";
            specifickyText = `Životnost: ${ziv}, Obj: ${obj}`;
        }
        else if (dil instanceof ElektroKomponent) {
            specifickyText = `Kapacita: ${dil.kapacitaWh}Wh, FW: ${dil.verzeFirmwaru}`;
        }
        const radek = document.createElement("tr");
        if (rizikovyStav) {
            radek.style.backgroundColor = "#ffdddd"; // Červený řádek pro kritické zboží
        }
        radek.innerHTML = `
            <td><strong>${dil.constructor.name.replace("Dil", "").replace("Komponent", "")}</strong></td>
            <td>${dil.nazev}</td>
            <td>${dil.skladoveMnozstvi} ks</td>
            <td>${dil.minimalniStav} ks</td>
            <td>${dil.vypocitejKoncovouCenu()} Kč</td>
            <td><small>${specifickyText}</small></td>
            <td>
                <button class="btn-akce" onclick="upravMnozstviNaWebu(${dil.id}, 1)">+</button>
                <button class="btn-akce" onclick="upravMnozstviNaWebu(${dil.id}, -1)">-</button>
            </td>
        `;
        htmlTabulkaBody.appendChild(radek);
    });
    htmlStatsHodnota.innerText = `${celkovaHodnotaSkladu.toLocaleString()} Kč`;
    htmlStatsKriticke.innerText = `${pocetKritickychDilu} ks`;
}
// ==========================================
// 9. ZPRACOVÁNÍ FORMULÁŘE (Bezpečně s try-catch)
// ==========================================
formular.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
        const id = Date.now();
        const typ = selectTyp.value;
        const nazev = inputNazev.value;
        const cena = Number(inputCena.value);
        const minimum = Number(inputMinimum.value);
        const mnozstvi = Number(inputMnozstvi.value);
        let novyDil;
        if (typ === "mechanicky") {
            const mat = document.getElementById("form-material").value || "neurčeno";
            const vah = Number(document.getElementById("form-hmotnost").value) || 0;
            novyDil = new MechanickyDil(id, nazev, cena, minimum, mat, vah);
        }
        else if (typ === "spotrebni") {
            const ziv = document.getElementById("form-zivotnost").value ? Number(document.getElementById("form-zivotnost").value) : undefined;
            const obj = document.getElementById("form-objem").value ? Number(document.getElementById("form-objem").value) : undefined;
            novyDil = new SpotrebniMaterial(id, nazev, cena, minimum, ziv, obj);
        }
        else {
            const kap = Number(document.getElementById("form-kapacita").value) || 0;
            const fmw = document.getElementById("form-firmware").value || "1.0.0";
            novyDil = new ElektroKomponent(id, nazev, cena, minimum, kap, fmw);
        }
        novyDil.pridatNaSklad(mnozstvi);
        skladCykloServisu.push(novyDil);
        // Reset a vyčištění formuláře po úspěšném přidání
        formular.reset();
        selectTyp.dispatchEvent(new Event("change"));
        // Okamžité překreslení
        aktualizujWeboveRozhrani();
    }
    catch (error) {
        // Pokud například zadáš prázdný název, chytí se to tady a vyskočí alert, takže uživatel ví, co se děje
        alert(`Chyba při přidávání dílu: ${error.message}`);
    }
});
// Globální ovládání pro tlačíka přímo v tabulce
window.upravMnozstviNaWebu = (id, zmena) => {
    const nalezenyDil = skladCykloServisu.find(d => d.id === id);
    if (nalezenyDil) {
        nalezenyDil.skladoveMnozstvi += zmena;
        aktualizujWeboveRozhrani();
    }
};
// PRVNÍ SPUŠTĚNÍ WEBU
aktualizujWeboveRozhrani();
