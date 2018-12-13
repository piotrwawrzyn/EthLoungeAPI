const _ = require('lodash');

const isArrayOfIds = items => {
  for (let i = 0; i < items.length; i++) {
    if (typeof items[i] !== 'number') return false;
  }

  return true;
};

const fillInfo = (items, itemsFromDb) => {
  if (typeof items === 'number') {
    const itemFromDb = _.find(itemsFromDb, { _id: items });

    return itemFromDb;
  }

  if (typeof items.length !== 'number') {
    // Not an array

    const filledItem = { ...items, ...itemsFromDb, _id: undefined };
    return filledItem;
  }

  let id;

  items = items.map(item => {
    if (isArrayOfIds(items)) id = item;
    else id = item.id;

    const itemFromDb = _.find(itemsFromDb, { _id: id });

    return { ...item, ...itemFromDb, id, _id: undefined };
  });

  return items;
};

module.exports = fillInfo;
