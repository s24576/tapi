import zleceniaData from "../dane/zlecenia.json" assert { type: "json" };
import { applyFilters, validateOrderNumber } from "./helper.js";

const mapZlecenie = (zlecenie) => {
    return {
        numer_zlecenia: zlecenie.numer_zlecenia,
        data_utworzenia: zlecenie.data_utworzenia,
        status: zlecenie.status,
        klient: {
            nazwa: zlecenie.klient.nazwa,
            nip: zlecenie.klient.nip,
            adres: {
                ulica: zlecenie.klient.adres.ulica,
                miasto: zlecenie.klient.adres.miasto,
                kod_pocztowy: zlecenie.klient.adres.kod_pocztowy,
                kraj: zlecenie.klient.adres.kraj
            }
        },
        trasa: {
            port_zaladunku: {
                nazwa: zlecenie.trasa.port_zaladunku.nazwa,
                kod_UNLOCODE: zlecenie.trasa.port_zaladunku.kod_UNLOCODE
            },
            port_docelowy: {
                nazwa: zlecenie.trasa.port_docelowy.nazwa,
                kod_UNLOCODE: zlecenie.trasa.port_docelowy.kod_UNLOCODE
            },
            terminy: {
                zaladunek: zlecenie.trasa.terminy.zaladunek,
                wyjscie_statku: zlecenie.trasa.terminy.wyjscie_statku,
                przewidywane_dostarczenie: zlecenie.trasa.terminy.przewidywane_dostarczenie
            }
        }
    };
};

export const zlecenieResolvers = {
    GetZlecenie: (req, res) => {
        const numerZlecenia = req.request.numer_zlecenia;

        if (!validateOrderNumber(numerZlecenia)) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nieprawidłowy format numeru zlecenia",
                code: "400"
            });
            return;
        }

        const zlecenie = zleceniaData
            .find(item => item.zlecenie.numer_zlecenia === numerZlecenia)?.zlecenie;

        if (!zlecenie) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nie znaleziono zlecenia",
                code: "404"
            });
            return;
        }

        res(null, {
            __typename: "Zlecenie",
            ...mapZlecenie(zlecenie)
        });
    },

    ListZlecenia: (req, res) => {
        const { filter, sort, page } = req.request || {};
        let result = zleceniaData.map(item => item.zlecenie);

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

        const zlecenia = result.map(zlecenie => mapZlecenie(zlecenie));
        res(null, { zlecenia, total_count: zlecenia.length });
    },

    CreateZlecenie: (req, res) => {
        const newZlecenie = { ...req.request.zlecenie };

        if (!validateOrderNumber(newZlecenie.numer_zlecenia)) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nieprawidłowy format numeru zlecenia",
                code: "400"
            });
            return;
        }

        const exists = zleceniaData.some(z => 
            z.zlecenie.numer_zlecenia === newZlecenie.numer_zlecenia
        );

        if (exists) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Zlecenie o podanym numerze już istnieje",
                code: "409"
            });
            return;
        }

        zleceniaData.push({ zlecenie: newZlecenie });
        res(null, {
            __typename: "Zlecenie",
            ...mapZlecenie(newZlecenie)
        });
    },

    UpdateZlecenie: (req, res) => {
        const { numer_zlecenia, zlecenie: updateData } = req.request;

        if (!validateOrderNumber(numer_zlecenia)) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nieprawidłowy format numeru zlecenia",
                code: "400"
            });
            return;
        }

        const index = zleceniaData.findIndex(z => 
            z.zlecenie.numer_zlecenia === numer_zlecenia
        );

        if (index === -1) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nie znaleziono zlecenia",
                code: "404"
            });
            return;
        }

        zleceniaData[index] = { zlecenie: { ...zleceniaData[index].zlecenie, ...updateData }};
        res(null, {
            __typename: "Zlecenie",
            ...mapZlecenie(zleceniaData[index].zlecenie)
        });
    },

    DeleteZlecenie: (req, res) => {
        const numerZlecenia = req.request.numer_zlecenia;

        if (!validateOrderNumber(numerZlecenia)) {
            res(null, {
                success: false,
                message: "Nieprawidłowy format numeru zlecenia",
                code: "400"
            });
            return;
        }

        const index = zleceniaData.findIndex(z => 
            z.zlecenie.numer_zlecenia === numerZlecenia
        );

        if (index === -1) {
            res(null, {
                success: false,
                message: "Nie znaleziono zlecenia",
                code: "404"
            });
            return;
        }

        zleceniaData.splice(index, 1);
        res(null, {
            success: true,
            message: "Zlecenie zostało usunięte",
            code: "200"
        });
    }
};
