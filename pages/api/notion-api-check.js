const { Client } = require('@notionhq/client');

const NOTION_API_KEY = ""
const NOTION_DATABASE_ID= ""
                          

const notion = new Client({ auth: NOTION_API_KEY })

export default async (req, res) => {
    const response = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID,
    });
  
    res.status(200).json({ response });
    return(response.properties);
  };