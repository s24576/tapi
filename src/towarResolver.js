import towaryData from "../dane/towary.json" assert { type: "json" };
import { applyFilters } from "./helper.js";

const mapTowar = (towar) => {
    return {
        numer_towaru: towar.numer_towaru,
        nazwa: towar.nazwa,
        ilosc: towar.ilosc,
        jednostka: towar.jednostka,
        wartosc: towar.wartosc
    };
};

export const towarResolvers = {
    GetTowar: (req, res) => {
        const numerTowaru = req.request.numer_towaru;

        const towar = towaryData
            .find(item => item.towar.numer_towaru === numerTowaru)?.towar;

        if (!towar) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nie znaleziono towaru",
                code: "404"
            });
            return;
        }

        res(null, {
            __typename: "Towar",
            ...mapTowar(towar)
        });
    },

    ListTowary: (req, res) => {
        const { filter, sort, page } = req.request || {};
        let result = towaryData.map(item => item.towar);

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

        const towary = result.map(towar => mapTowar(towar));
        res(null, { towary, total_count: towary.length });
    },

    CreateTowar: (req, res) => {
        const newTowar = { ...req.request.towar };

        const exists = towaryData.some(t => 
            t.towar.numer_towaru === newTowar.numer_towaru
        );

        if (exists) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Towar o podanym numerze już istnieje",
                code: "409"
            });
            return;
        }

        towaryData.push({ towar: newTowar });
        res(null, {
            __typename: "Towar",
            ...mapTowar(newTowar)
        });
    },

    UpdateTowar: (req, res) => {
        const { numer_towaru, towar: updateData } = req.request;

        const index = towaryData.findIndex(t => 
            t.towar.numer_towaru === numer_towaru
        );

        if (index === -1) {
            res(null, {
                __typename: "ErrorResponse",
                message: "Nie znaleziono towaru",
                code: "404"
            });
            return;
        }

        towaryData[index] = { towar: { ...towaryData[index].towar, ...updateData }};
        res(null, {
            __typename: "Towar",
            ...mapTowar(towaryData[index].towar)
        });
    },

    DeleteTowar: (req, res) => {
        const numerTowaru = req.request.numer_towaru;

        const index = towaryData.findIndex(t => 
            t.towar.numer_towaru === numerTowaru
        );

        if (index === -1) {
            res(null, {
                success: false,
                message: "Nie znaleziono towaru",
                code: "404"
            });
            return;
        }

        towaryData.splice(index, 1);
        res(null, {
            success: true,
            message: "Towar został usunięty",
            code: "200"
        });
    }
};
