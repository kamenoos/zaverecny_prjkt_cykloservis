import { ZakladniDil, MechanickyDil, SpotrebniMaterial, ElektroKomponent } from '../../models.js';

// ==========================================
// VYKRESLOVANI TABULKY
// ==========================================

// tato funkce vytvori obsah tabulky z dat skladu a zaktualizuje statistiky

export function aktualizujWeboveRozhrani(
    skladCykloServisu: ZakladniDil[],
    htmlTabulkaBody: HTMLTableSectionElement,
    htmlStatsHodnota: HTMLParagraphElement,
    htmlStatsKriticke: HTMLParagraphElement,
    aktualniFiltr: string,
    editovaneId: number | null
): void {
    htmlTabulkaBody.innerHTML = "";
    let celkovaHodnota = 0;
    let pocetKritickych = 0;

    skladCykloServisu.forEach(dil => {
        const jeKriticky = dil.jePotrebaObjednat();
        if (jeKriticky) pocetKritickych++;
        celkovaHodnota += dil.skladoveMnozstvi * dil.vypocitejKoncovouCenu();

        if (aktualniFiltr !== "vse") {
            if (aktualniFiltr === "kriticke"   && !jeKriticky)                       return;
            if (aktualniFiltr === "mechanicky" && !(dil instanceof MechanickyDil))   return;
            if (aktualniFiltr === "spotrebni"  && !(dil instanceof SpotrebniMaterial)) return;
            if (aktualniFiltr === "elektro"    && !(dil instanceof ElektroKomponent)) return;
        }

        let spec = "";
        if (dil instanceof MechanickyDil)    spec = `Mat: ${dil.material}, Váha: ${dil.hmotnost}g`;
        else if (dil instanceof SpotrebniMaterial) spec = `Životnost: ${dil.zivotnostKm ?? '-'}km, Obj: ${dil.objemMl ?? '-'}ml`;
        else if (dil instanceof ElektroKomponent)  spec = `Kap: ${dil.kapacitaWh}Wh, FW: ${dil.verzeFirmwaru}`;

        const radek = document.createElement("tr");
        if (jeKriticky) radek.style.backgroundColor = "#ffdddd";

        // pokud je tento dil prave editovany, zobrazime inline formular
        if (editovaneId === dil.id) {
            radek.innerHTML = `
                <td><strong>${dil.constructor.name.replace("Dil","").replace("Material","")}</strong></td>
                <td><input class="edit-input" id="edit-nazev"    value="${dil.nazev}"             /></td>
                <td><input class="edit-input" id="edit-mnozstvi" value="${dil.skladoveMnozstvi}"  type="number" min="0" style="width:60px"/></td>
                <td><input class="edit-input" id="edit-minimum"  value="${dil.minimalniStav}"     type="number" min="1" style="width:60px"/></td>
                <td><input class="edit-input" id="edit-cena"     value="${dil.nakupniCena}"       type="number" min="1" style="width:80px"/></td>
                <td><small>${spec}</small></td>
                <td><input class="edit-input" id="edit-poznamka" value="${dil.poznamka}"          /></td>
                <td>
                    <button class="btn-akce btn-ulozit" onclick="ulozitEditaci(${dil.id})">💾</button>
                    <button class="btn-akce" onclick="zrusitEditaci()">✖</button>
                </td>
            `;
        } else {
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

    htmlStatsHodnota.innerText  = `${celkovaHodnota.toLocaleString()} Kč`;
    htmlStatsKriticke.innerText = `${pocetKritickych} ks`;
}
