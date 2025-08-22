import { getRandomId } from "./text";

export const hasRepeatedIds = (array) => {
  const ids = new Set();
  for (const item of array) {
    if (ids.has(item._id)) {
      return true; // Se repite
    }
    ids.add(item._id);
  }
  return false; // Todos son únicos
};

export const splitByCurrency = (
  array: any[],
  currencyField: string = "currency"
) => {
  const itemsInUSD = [];
  const items = [];
  for (const item of array) {
    if (item[currencyField] === "usd") {
      itemsInUSD.push(item);
    } else {
      items.push(item);
    }
  }
  return [items, itemsInUSD];
};

export const addUUIDtoFields = (array: any[], fields: string[]) => {
  return array.map((item) => {
    const newItem = { ...item };
    fields.forEach((field) => {
      if (newItem[field]) {
        newItem[field] = newItem[field].map((el) => ({
          ...el,
          uuid: getRandomId(),
        }));
      }
    });
    return newItem;
  });
};
