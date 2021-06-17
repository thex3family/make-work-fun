const { Client } = require('@notionhq/client');

const NOTION_API_KEY = "secret_jr38i4L1ATeCygduJo0M85VwGxMhHGZyE4RvCYLRpHh"
const NOTION_DATABASE_ID="7ad4f08b-b662-46d1-a58d-854d42c5b2f8"
                          

const notion = new Client({ auth: NOTION_API_KEY })

export default async (req, res) => {
    const response = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID,
    });
  
    res.status(200).json({ response });
    return(response.properties);
  };