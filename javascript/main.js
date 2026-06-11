// @ts-ignore
import { KATALOG_DILU } from '../data.js';
import { MechanickyDil, SpotrebniMaterial, ElektroKomponent } from './models.js';
import { vytvorDilZDat } from './factory.js';
import { ulozSklad, nactiSkladZLocalStorage } from './storage.js';
// ==========================================
// hlavni soubor aplikace
// ze zacatku se stara o nacitani, uklizeni na strance a reagovani na akcni tlacitka
// ==========================================
// 1. INICIALIZACE SKLADU
// ==========================================
// tady se vytvari hlavni pole dilu pro aplikaci
// prvne se pokusime nacist ulozena data, jinak vezmeme zakladni katalog
const skladCykloServisu = [];
let aktualniFiltr = "vse";
let editovaneId = null; // promenna pro id aktualne editovaneho dilu
// nacteni dat (nejdriv zkousime localstorage, pokud nema nic, vezmeme data.js)
const ulozene = nactiSkladZLocalStorage();
if (ulozene.length > 0) {
    skladCykloServisu.push(...ulozene);
}
else {
    KATALOG_DILU.forEach(surovaData => {
        const dil = vytvorDilZDat({ ...surovaData, skladoveMnozstvi: 5 });
        if (dil) {
            skladCykloServisu.push(dil);
        }
    });
    ulozSklad(skladCykloServisu);
}
// ==========================================
// 2. DOM ELEMENTY
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
// ==========================================
// 3. logika formularu (schovavani policek)
// ==========================================
selectTyp.addEventListener("change", () => {
    const t = selectTyp.value;
    boxMaterial.style.display = t === "mechanicky" ? "block" : "none";
    boxHmotnost.style.display = t === "mechanicky" ? "block" : "none";
    boxZivotnost.style.display = t === "spotrebni" ? "block" : "none";
    boxObjem.style.display = t === "spotrebni" ? "block" : "none";
    boxKapacita.style.display = t === "elektro" ? "block" : "none";
    boxFirmware.style.display = t === "elektro" ? "block" : "none";
});
// ==========================================
// 4. filtrovani tabulky
// ==========================================
// tlacitka, ktera prepina zobrazeni vsech, kritickych a tipu dilu
document.querySelectorAll(".btn-filtr").forEach(tlacitko => {
    tlacitko.addEventListener("click", () => {
        document.querySelectorAll(".btn-filtr").forEach(b => b.classList.remove("aktivni"));
        tlacitko.classList.add("aktivni");
        aktualniFiltr = tlacitko.getAttribute("data-filtr") || "vse";
        aktualizujWeboveRozhrani();
    });
});
// ==========================================
// 5. vykreslovani ui (tabulka a statistiky)
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
        if (jeKriticky && editovaneId !== dil.id)
            radek.style.backgroundColor = "#ffdddd";
        // pokud dil prave editujeme, zobrazime inputy, jinak normalni radek s textem
        if (editovaneId === dil.id) {
            radek.innerHTML = `
                <td><strong>${dil.constructor.name.replace("Dil", "").replace("Material", "")}</strong></td>
                <td><input class="edit-input" id="edit-nazev" value="${dil.nazev}" /></td>
                <td><input class="edit-input" id="edit-mnozstvi" value="${dil.skladoveMnozstvi}" type="number" min="0" style="width:60px"/></td>
                <td><input class="edit-input" id="edit-minimum" value="${dil.minimalniStav}" type="number" min="1" style="width:60px"/></td>
                <td><input class="edit-input" id="edit-cena" value="${dil.nakupniCena}" type="number" min="1" style="width:80px"/></td>
                <td>${dil.vypocitejKoncovouCenu()} Kč</td>
                <td><small>${spec}</small></td>
                <td><input class="edit-input" id="edit-poznamka" value="${dil.poznamka || ""}" /></td>
                <td>
                    <button class="btn-akce btn-ulozit" style="background-color: #d4edda;" onclick="ulozitEditaci(${dil.id})">💾</button>
                    <button class="btn-akce" style="background-color: #f8d7da;" onclick="zrusitEditaci()">✖</button>
                </td>
            `;
        }
        else {
            radek.innerHTML = `
                <td><strong>${dil.constructor.name.replace("Dil", "").replace("Material", "")}</strong></td>
                <td>${dil.nazev}</td>
                <td>${dil.skladoveMnozstvi} ks</td>
                <td>${dil.minimalniStav} ks</td>
                <td>${dil.nakupniCena} Kč</td>
                <td>${dil.vypocitejKoncovouCenu()} Kč</td>
                <td><small>${spec}</small></td>
                <td><small>${dil.poznamka || "-"}</small></td>
                <td>
                    <button class="btn-akce" onclick="upravMnozstviNaWebu(${dil.id}, 1)">+</button>
                    <button class="btn-akce" onclick="upravMnozstviNaWebu(${dil.id}, -1)">-</button>
                    <button class="btn-akce" style="background-color: #fff9c4;" onclick="spustitEditaci(${dil.id})">✏️</button>
                    <button class="btn-akce" style="background-color: #ffeaea; color: red;" onclick="smazatDilNaWebu(${dil.id})">❌</button>
                </td>
            `;
        }
        htmlTabulkaBody.appendChild(radek);
    });
    htmlStatsHodnota.innerText = `${celkovaHodnota.toLocaleString()} Kč`;
    htmlStatsKriticke.innerText = `${pocetKritickych} ks`;
    ulozSklad(skladCykloServisu); // po kazdem prekresleni ulozime data
}
// ==========================================
// 6. odeslani formularu (pridani dilu)
// ==========================================
formular.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
        // ziskat input element podle id, jinak hodit chybu
        const getInp = (id) => {
            const el = document.getElementById(id);
            if (!el)
                throw new Error(`nenalezeno pole: ${id}`);
            return el;
        };
        const nazev = getInp("form-nazev").value;
        const cena = Number(getInp("form-cena").value);
        const minimum = Number(getInp("form-minimum").value);
        const mnozstvi = Number(getInp("form-mnozstvi").value);
        const poznamkaText = getInp("form-poznamka").value;
        const typ = selectTyp.value;
        const id = Date.now();
        let novyDil;
        // vytvoreni spravne tridy podle vybraneho typu dilu
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
        novyDil.poznamka = poznamkaText;
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
// 7. globalni funkce (tlacitka v tabulce)
// ==========================================
// globalni funkce se zavazuji na globalni okno a pouzivaji se v tlacitkach v tabulce
window.upravMnozstviNaWebu = (id, zmena) => {
    const d = skladCykloServisu.find(x => x.id === id);
    if (d) {
        d.skladoveMnozstvi += zmena;
        aktualizujWeboveRozhrani();
    }
};
window.smazatDilNaWebu = (id) => {
    if (confirm("opravdu chcete tento dil trvale smazat?")) {
        const index = skladCykloServisu.findIndex(d => d.id === id);
        if (index !== -1) {
            skladCykloServisu.splice(index, 1);
            aktualizujWeboveRozhrani();
        }
    }
};
window.spustitEditaci = (id) => {
    editovaneId = id;
    aktualizujWeboveRozhrani();
};
window.zrusitEditaci = () => {
    editovaneId = null;
    aktualizujWeboveRozhrani();
};
window.ulozitEditaci = (id) => {
    const d = skladCykloServisu.find(x => x.id === id);
    if (d) {
        // tady obejsme readonly ochranu, protoze chceme editaci pres ui
        d.nazev = document.getElementById("edit-nazev").value;
        d.skladoveMnozstvi = Number(document.getElementById("edit-mnozstvi").value);
        d.minimalniStav = Number(document.getElementById("edit-minimum").value);
        d.nakupniCena = Number(document.getElementById("edit-cena").value);
        d.poznamka = document.getElementById("edit-poznamka").value;
    }
    editovaneId = null;
    aktualizujWeboveRozhrani();
};
// export do json
document.getElementById("btn-export")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(skladCykloServisu.map(d => d.serializuj()), null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "sklad_zaloha.json";
    a.click();
});
// prvni spusteni
selectTyp.dispatchEvent(new Event("change"));
aktualizujWeboveRozhrani();
