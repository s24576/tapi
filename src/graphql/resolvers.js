import zleceniaData from "../../dane/zlecenia.json" assert { type: "json" };
import konteneryData from "../../dane/kontenery.json" assert { type: "json" };
import towaryData from "../../dane/towary.json" assert { type: "json" };
import {
  applyFilters,
  validateOrderNumber,
  validateContainerNumber,
  validateNIP,
  validateUNLOCODE
} from "./helpers.js";
import { PositiveInt } from "./scalars.js";

export const resolvers = {
  PositiveInt,
  Query: {
    zlecenia: (_, { filter, sort, page }) => {
      let result = zleceniaData.map(item => item.zlecenie);

      if (filter) {
        result = result.filter((item) => applyFilters(item, filter));
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

      return result;
    },

    kontenery: (_, { filter, sort, page }) => {
      let result = konteneryData.map(item => item.kontener);

      if (filter) {
        result = result.filter((item) => applyFilters(item, filter));
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

      return result;
    },

    towary: (_, { filter, sort, page }) => {
      let result = towaryData.map(item => item.towar);

      if (filter) {
        result = result.filter((item) => applyFilters(item, filter));
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

      return result;
    },

    zlecenie: (_, { numer_zlecenia }) => {
      if (!validateOrderNumber(numer_zlecenia)) {
        return {
          __typename: "ErrorResponse",
          message: "Nieprawidłowy format numeru zlecenia",
          code: "400"
        };
      }

      const zlecenie = zleceniaData
        .find(item => item.zlecenie.numer_zlecenia === numer_zlecenia)?.zlecenie;

      if (!zlecenie) {
        return {
          __typename: "ErrorResponse",
          message: "Nie znaleziono zlecenia",
          code: "404"
        };
      }

      return {
        __typename: "Zlecenie",
        ...zlecenie
      };
    },

    kontener: (_, { numer_kontenera }) => {
      if (!validateContainerNumber(numer_kontenera)) {
        return {
          __typename: "ErrorResponse",
          message: "Nieprawidłowy format numeru kontenera",
          code: "400"
        };
      }

      const kontener = konteneryData
        .find(item => item.kontener.numer_kontenera === numer_kontenera)?.kontener;

      if (!kontener) {
        return {
          __typename: "ErrorResponse",
          message: "Nie znaleziono kontenera",
          code: "404"
        };
      }

      return {
        __typename: "Kontener",
        ...kontener
      };
    },

    towar: (_, { numer_towaru }) => {
      const towar = towaryData
        .find(item => item.towar.numer_towaru === numer_towaru)?.towar;

      if (!towar) {
        return {
          __typename: "ErrorResponse",
          message: "Nie znaleziono towaru",
          code: "404"
        };
      }

      return {
        __typename: "Towar",
        ...towar
      };
    }
  },

  Mutation: {
    createZlecenie: (_, { zlecenie }) => {
      if (!validateOrderNumber(zlecenie.numer_zlecenia)) {
        return {
          __typename: "ErrorResponse",
          message: "Nieprawidłowy format numeru zlecenia",
          code: "400"
        };
      }
      if (!validateNIP(zlecenie.klient.nip)) {
        return {
          __typename: "ErrorResponse",
          message: "Nieprawidłowy format NIP",
          code: "400"
        };
      }
      if (!validateUNLOCODE(zlecenie.trasa.port_załadunku.kod_UNLOCODE) || 
          !validateUNLOCODE(zlecenie.trasa.port_docelowy.kod_UNLOCODE)) {
        return {
          __typename: "ErrorResponse",
          message: "Nieprawidłowy format kodu UNLOCODE",
          code: "400"
        };
      }

      const exists = zleceniaData.some(z => z.zlecenie.numer_zlecenia === zlecenie.numer_zlecenia);
      if (exists) {
        return {
          __typename: "ErrorResponse",
          message: "Zlecenie o podanym numerze już istnieje",
          code: "409"
        };
      }

      zleceniaData.push({ zlecenie });
      return {
        __typename: "Zlecenie",
        ...zlecenie
      };
    },

    updateZlecenie: (_, { numer_zlecenia, zlecenie }) => {
      if (!validateOrderNumber(numer_zlecenia)) {
        return {
          __typename: "ErrorResponse",
          message: "Nieprawidłowy format numeru zlecenia",
          code: "400"
        };
      }

      const index = zleceniaData.findIndex(z => z.zlecenie.numer_zlecenia === numer_zlecenia);
      if (index === -1) {
        return {
          __typename: "ErrorResponse",
          message: "Nie znaleziono zlecenia",
          code: "404"
        };
      }

      zleceniaData[index] = { zlecenie };
      return {
        __typename: "Zlecenie",
        ...zlecenie
      };
    },

    deleteZlecenie: (_, { numer_zlecenia }) => {
      if (!validateOrderNumber(numer_zlecenia)) {
        return {
          success: false,
          message: "Nieprawidłowy format numeru zlecenia",
          code: "400"
        };
      }

      const index = zleceniaData.findIndex(z => z.zlecenie.numer_zlecenia === numer_zlecenia);
      if (index === -1) {
        return {
          success: false,
          message: "Nie znaleziono zlecenia",
          code: "404"
        };
      }

      zleceniaData.splice(index, 1);
      return {
        success: true,
        message: "Zlecenie zostało usunięte",
        code: "200"
      };
    },

    createKontener: (_, { kontener }) => {
      if (!validateContainerNumber(kontener.numer_kontenera)) {
        return {
          __typename: "ErrorResponse",
          message: "Nieprawidłowy format numeru kontenera",
          code: "400"
        };
      }

      const exists = konteneryData.some(k => k.kontener.numer_kontenera === kontener.numer_kontenera);
      if (exists) {
        return {
          __typename: "ErrorResponse",
          message: "Kontener o podanym numerze już istnieje",
          code: "409"
        };
      }

      konteneryData.push({ kontener });
      return {
        __typename: "Kontener",
        ...kontener
      };
    },

    updateKontener: (_, { numer_kontenera, kontener }) => {
      if (!validateContainerNumber(numer_kontenera)) {
        return {
          __typename: "ErrorResponse",
          message: "Nieprawidłowy format numeru kontenera",
          code: "400"
        };
      }

      const index = konteneryData.findIndex(k => k.kontener.numer_kontenera === numer_kontenera);
      if (index === -1) {
        return {
          __typename: "ErrorResponse",
          message: "Nie znaleziono kontenera",
          code: "404"
        };
      }

      konteneryData[index] = { kontener };
      return {
        __typename: "Kontener",
        ...kontener
      };
    },

    deleteKontener: (_, { numer_kontenera }) => {
      if (!validateContainerNumber(numer_kontenera)) {
        return {
          success: false,
          message: "Nieprawidłowy format numeru kontenera",
          code: "400"
        };
      }

      const index = konteneryData.findIndex(k => k.kontener.numer_kontenera === numer_kontenera);
      if (index === -1) {
        return {
          success: false,
          message: "Nie znaleziono kontenera",
          code: "404"
        };
      }

      konteneryData.splice(index, 1);
      return {
        success: true,
        message: "Kontener został usunięty",
        code: "200"
      };
    },

    createTowar: (_, { towar }) => {
      const exists = towaryData.some(t => t.towar.numer_towaru === towar.numer_towaru);
      if (exists) {
        return {
          __typename: "ErrorResponse",
          message: "Towar o podanym numerze już istnieje",
          code: "409"
        };
      }

      towaryData.push({ towar });
      return {
        __typename: "Towar",
        ...towar
      };
    },

    updateTowar: (_, { numer_towaru, towar }) => {
      const index = towaryData.findIndex(t => t.towar.numer_towaru === numer_towaru);
      if (index === -1) {
        return {
          __typename: "ErrorResponse",
          message: "Nie znaleziono towaru",
          code: "404"
        };
      }

      towaryData[index] = { towar };
      return {
        __typename: "Towar",
        ...towar
      };
    },

    deleteTowar: (_, { numer_towaru }) => {
      const index = towaryData.findIndex(t => t.towar.numer_towaru === numer_towaru);
      if (index === -1) {
        return {
          success: false,
          message: "Nie znaleziono towaru",
          code: "404"
        };
      }

      towaryData.splice(index, 1);
      return {
        success: true,
        message: "Towar został usunięty",
        code: "200"
      };
    }
  }
};
