const { Client } = require('@notionhq/client');


export default async (req, res) => {
  const {
    query: { page_id },
    body,
  } = req;

  // Get secret key from request headers
  const api_secret_key = req.headers.authorization?.split(' ')[1];

  const notion = new Client({ auth: api_secret_key });

  try {
    const response = await notion.pages.update({
      page_id: page_id,
      properties: body.properties,  // Use properties from request body
    });

    // res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};