import konteneryData from "../dane/kontenery.json" assert { type: "json" };
import { applyFilters, validateContainerNumber } from "./helper.js";

const mapKontener = (kontener) => {
    return {
        numer_zlecenia: kontener.numer_zlecenia,
        numer_kontenera: kontener.numer_kontenera,
        typ: kontener.typ,
        waga: {
            brutto: kontener.waga.brutto,
            netto: kontener.waga.netto,
            jednostka: kontener.waga.jednostka
        },
        numer_towaru: kontener.numer_towaru,
        ladunek: {
            opis: kontener.ladunek.opis,
            ilosc_palet: kontener.ladunek.ilosc_palet,
            opakowanie: {
                rodzaj: kontener.ladunek.opakowanie.rodzaj,
                wymiary: {
                    dlugosc: kontener.ladunek.opakowanie.wymiary.dlugosc,
                    szerokosc: kontener.ladunek.opakowanie.wymiary.szerokosc,
                    wysokosc: kontener.ladunek.opakowanie.wymiary.wysokosc,
                    jednostka: kontener.ladunek.opakowanie.wymiary.jednostka
                }
            }
        }
    };
};

export const kontenerResolvers = {
    GetKontener: (req, res) => {
        const numerKontenera = req.request.numer_kontenera;

        if (!validateContainerNumber(numerKontenera)) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nieprawidłowy format numeru kontenera",
                code: "400"
            });
            return;
        }

        const kontener = konteneryData
            .find(item => item.kontener.numer_kontenera === numerKontenera)?.kontener;

        if (!kontener) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nie znaleziono kontenera",
                code: "404"
            });
            return;
        }

        res(null, {
            __typename: "Kontener",
            ...mapKontener(kontener)
        });
    },

    ListKontenery: (req, res) => {
        const { filter, sort, page } = req.request || {};
        let result = konteneryData.map(item => item.kontener);

        if (filter) {
            result = result.filter(item => applyFilters(item, filter));
        }

        if (sort) {
            const { field, order } = sort;
            result = result.sort((a, b) => {
                const aValue = field.split('.').reduce((obj, key) => obj?.[key], a);
                const bValue = field.split('.').reduce((obj, key) => obj?.[key], b);
                if (aValue < bValue) return order === "ASC" ? -1 : 1;
                if (aValue > bValue) return order === "ASC" ? 1 : -1;
                return 0;
            });
        }

        if (page) {
            const { limit, offset } = page;
            result = result.slice(offset, offset + limit);
        }

        const kontenery = result.map(kontener => mapKontener(kontener));
        res(null, { kontenery, total_count: kontenery.length });
    },

    CreateKontener: (req, res) => {
        const newKontener = { ...req.request.kontener };

        if (!validateContainerNumber(newKontener.numer_kontenera)) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nieprawidłowy format numeru kontenera",
                code: "400"
            });
            return;
        }

        const exists = konteneryData.some(k => 
            k.kontener.numer_kontenera === newKontener.numer_kontenera
        );

        if (exists) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Kontener o podanym numerze już istnieje",
                code: "409"
            });
            return;
        }

        konteneryData.push({ kontener: newKontener });
        res(null, {
            __typename: "Kontener",
            ...mapKontener(newKontener)
        });
    },

    UpdateKontener: (req, res) => {
        const { numer_kontenera, kontener: updateData } = req.request;

        if (!validateContainerNumber(numer_kontenera)) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nieprawidłowy format numeru kontenera",
                code: "400"
            });
            return;
        }

        const index = konteneryData.findIndex(k => 
            k.kontener.numer_kontenera === numer_kontenera
        );

        if (index === -1) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nie znaleziono kontenera",
                code: "404"
            });
            return;
        }

        konteneryData[index] = { kontener: { ...konteneryData[index].kontener, ...updateData }};
        res(null, {
            __typename: "Kontener",
            ...mapKontener(konteneryData[index].kontener)
        });
    },

    DeleteKontener: (req, res) => {
        const numerKontenera = req.request.numer_kontenera;

        if (!validateContainerNumber(numerKontenera)) {
            res(null, {
                success: false,
                message: "Nieprawidłowy format numeru kontenera",
                code: "400"
            });
            return;
        }

        const index = konteneryData.findIndex(k => 
            k.kontener.numer_kontenera === numerKontenera
        );

        if (index === -1) {
            res(null, {
                success: false,
                message: "Nie znaleziono kontenera",
                code: "404"
            });
            return;
        }

        konteneryData.splice(index, 1);
        res(null, {
            success: true,
            message: "Kontener został usunięty",
            code: "200"
        });
    }
};
