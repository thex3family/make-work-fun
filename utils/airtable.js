const airtable = require('airtable');

const base = new airtable({apiKey: `${process.env.AIRTABLE_API_KEY}`}).base(`${process.env.AIRTABLE_BASE_ID}`);
const product_table = base(`Purchases`);
const subscription_table = base(`Subscriptions`);

const minifyRecords = (records) => {
    return records.map((record) => getMinifiedRecord(record));
};
const getMinifiedRecord = (record) => {
    return {
        id: record.id,
        fields: record.fields,
    };
};

export { subscription_table, product_table, getMinifiedRecord, minifyRecords };