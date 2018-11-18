const _ = require('lodash');

const fillInfo = (items, itemsFromDb) => {
  if (typeof items === 'number') {
    const itemFromDb = _.find(itemsFromDb, { _id: items });

    return itemFromDb;
  }

  if (!items.length) {
    // Not an array

    const filledItem = { ...items, ...itemsFromDb, _id: undefined };
    return filledItem;
  }

  items = items.map(item => {
    const itemFromDb = _.find(itemsFromDb, { _id: item.id });

    return { ...item, ...itemFromDb, _id: undefined };
  });

  return items;
};

module.exports = fillInfo;
