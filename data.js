// ==========================================
// KATALOG DILU
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
    {
        id: 3,
        typ: "mechanicky",
        nazev: "",  // chyba: prázdný název
        nakupniCena: 500,
        minimalniStav: 3,
        material: "plast",
        hmotnost: 50
    },

    // Spotřební materiály
    {
        id: 4,
        typ: "spotrebni",
        nazev: "Brzdové destičky Shimano",
        nakupniCena: 150,
        minimalniStav: 5,
        zivotnostKm: 2000
    },
    {
        id: 5,
        typ: "spotrebni",
        nazev: "Řetězový olej Finish Line",
        nakupniCena: 200,
        minimalniStav: 3,
        objemMl: 120
    },
    {
        id: 6,
        typ: "spotrebni",
        nazev: "Vnitřní duše Continental",
        nakupniCena: -50,  // chyba: záporná cena
        minimalniStav: 10,
        zivotnostKm: 5000
    },

    // Elektro komponenty
    {
        id: 7,
        typ: "elektro",
        nazev: "Baterie Bosch PowerTube",
        nakupniCena: 2500,
        minimalniStav: 1,
        kapacitaWh: 625,
        verzeFirmwaru: "1.2.3"
    },
    {
        id: 8,
        typ: "elektro",
        nazev: "Motor Shimano Steps",
        nakupniCena: 1800,
        minimalniStav: 1,
        kapacitaWh: 250,
        verzeFirmwaru: "2.0.1"
    },
    {
        id: 9,
        typ: "elektro",
        nazev: "Displej Garmin Edge",
        nakupniCena: 1200,
        minimalniStav: 2,
        kapacitaWh: 0,  // chyba: kapacita 0 (možná neplatná, ale kód to nevaliduje přímo)
        verzeFirmwaru: ""  // chyba: prázdná verze
    }
]
