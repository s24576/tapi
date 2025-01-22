export const applyFilters = (item, filters) => {
  for (const { field, operation, value } of filters) {
    const itemValue = field.split('.').reduce((obj, key) => obj?.[key], item);
    if (itemValue === undefined) return false;

    let compareValue = value;
    let compareItemValue = itemValue;
    
    if (
      field.includes("ilość") ||
      field.includes("wartość") ||
      field.includes("waga.brutto") ||
      field.includes("waga.netto") ||
      field.includes("ilość_palet") ||
      field.includes("wymiary")
    ) {
      compareValue = parseFloat(value);
      compareItemValue = parseFloat(itemValue);
    }

    if (
      field === "data_utworzenia" ||
      field.includes("terminy.załadunek") ||
      field.includes("terminy.wyjście_statku") ||
      field.includes("terminy.przewidywane_dostarczenie")
    ) {
      compareValue = new Date(value);
      compareItemValue = new Date(itemValue);
    }

    switch (operation) {
      case "EQUAL":
        if (compareItemValue !== compareValue) return false;
        break;
      case "NOT_EQUAL":
        if (compareItemValue === compareValue) return false;
        break;
      case "CONTAINS":
        if (!String(itemValue).toLowerCase().includes(String(value).toLowerCase()))
          return false;
        break;
      case "NOT_CONTAINS":
        if (String(itemValue).toLowerCase().includes(String(value).toLowerCase()))
          return false;
        break;
      case "GREATER":
        if (compareItemValue <= compareValue) return false;
        break;
      case "GREATER_OR_EQUAL":
        if (compareItemValue < compareValue) return false;
        break;
      case "LESS":
        if (compareItemValue >= compareValue) return false;
        break;
      case "LESS_OR_EQUAL":
        if (compareItemValue > compareValue) return false;
        break;
      case "STARTS_WITH":
        if (!String(itemValue).toLowerCase().startsWith(String(value).toLowerCase()))
          return false;
        break;
      case "ENDS_WITH":
        if (!String(itemValue).toLowerCase().endsWith(String(value).toLowerCase()))
          return false;
        break;
      default:
        throw new Error(`Unsupported filter operation: ${operation}`);
    }
  }
  return true;
};

export const validateOrderNumber = (orderNumber) => {
  return /^\d{6}-\d{4}$/.test(orderNumber);
};

export const validateContainerNumber = (containerNumber) => {
  return /^[A-Za-z]{4}\d{7}$/.test(containerNumber);
};

export const validateNIP = (nip) => {
  return /^\d{3}-\d{3}-\d{2}-\d{2}$/.test(nip);
};

export const validateUNLOCODE = (unlocode) => {
  return /^[A-Z]{2}[A-Z0-9]{3}$/.test(unlocode);
};
