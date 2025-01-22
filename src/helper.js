const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const applyFilters = (item, filters) => {
  for (const { field, operation, value } of filters) {
    const itemValue = getNestedValue(item, field);
    if (itemValue === undefined) return false;

    let compareValue = value;
    let compareItemValue = itemValue;

    if (
      field.includes("ilosc") ||
      field.includes("wartosc") ||
      field.includes("waga.brutto") ||
      field.includes("waga.netto") ||
      field.includes("ilosc_palet") ||
      field.includes("wymiary")
    ) {
      compareValue = parseFloat(value);
      compareItemValue = parseFloat(itemValue);
    }

    if (
      field === "data_utworzenia" ||
      field.includes("terminy.zaladunek") ||
      field.includes("terminy.wyjscie_statku") ||
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
  return orderNumber && orderNumber.length > 0;
};

export const validateContainerNumber = (containerNumber) => {
  return containerNumber && containerNumber.length > 0;
};

export const validateNIP = (nip) => {
  return nip && nip.length > 0;
};

export const validateUNLOCODE = (unlocode) => {
  return unlocode && unlocode.length > 0;
};

export const sortByField = (array, field, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aValue = getNestedValue(a, field);
    const bValue = getNestedValue(b, field);
    
    if (aValue === bValue) return 0;
    
    const multiplier = order.toLowerCase() === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * multiplier;
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return (aValue.getTime() - bValue.getTime()) * multiplier;
    }
    
    return String(aValue).localeCompare(String(bValue)) * multiplier;
  });
};

export const paginateResults = (array, pageSize = 10, pageNumber = 1) => {
  const startIndex = (pageNumber - 1) * pageSize;
  return array.slice(startIndex, startIndex + pageSize);
};
