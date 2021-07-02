import { table, minifyRecords } from '@/utils/airtable';

export default async (req, res) => {
  try {
    const records = await table
      .select({
        filterByFormula: "{customer_email} = 'knamnguyen.work@gmail.com'",
        view: "App - Purchase List"
      })
      .eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
    
        records.forEach(function(record) {
            console.log('Retrieved', record.get('product_name'));
        });
    
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
    
    }, function done(err) {
        if (err) { console.error(err); return; }
    });
    const minifiedRecords = minifyRecords(records);
    res.statusCode = 200;
    res.json(minifiedRecords);
  } catch (err) {
    res.statusCode = 500;
    res.json({ msg: 'Something went wrong' });
  }
};
