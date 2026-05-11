// ==========================================
// KATALOG DÍLŮ PRO CYKLO SERVIS
// ==========================================

export const KATALOG_DILU = [
    // Mechanické díly
    {
        id: 1,
        typ: "mechanicky",
        nazev: "Řetězová převodovka Shimano",
        nakupniCena: 1200,
        minimalniStav: 2,
        material: "ocel",
        hmotnost: 150
    },
    {
        id: 2,
        typ: "mechanicky",
        nazev: "Kliková soustava FSA",
        nakupniCena: 800,
        minimalniStav: 1,
        material: "hliník",
        hmotnost: 200
    },
    // Spotřební materiály
    {
        id: 3,
        typ: "spotrebni",
        nazev: "Brzdové destičky Shimano",
        nakupniCena: 150,
        minimalniStav: 5,
        zivotnostKm: 2000
    },
    {
        id: 4,
        typ: "spotrebni",
        nazev: "Vnitřní duše Continental",
        nakupniCena: 80,
        minimalniStav: 10,
        zivotnostKm: 5000
    },
    // Elektro komponenty
    {
        id: 5,
        typ: "elektro",
        nazev: "Baterie Bosch PowerTube",
        nakupniCena: 2500,
        minimalniStav: 1,
        kapacitaWh: 625,
        verzeFirmwaru: "1.2.3"
    },
    {
        id: 6,
        typ: "elektro",
        nazev: "Motor Shimano Steps",
        nakupniCena: 4500,
        minimalniStav: 1,
        kapacitaWh: 418,
        verzeFirmwaru: "2.1.0"
    }
];
