import { Client } from "@notionhq/client";

export const getDatabaseProperties = async (notion_api_secret, notion_success_plan) => {
    const notion = new Client({ auth: notion_api_secret })
    const response = await notion.databases.retrieve({
      database_id: notion_success_plan,
    });
    return response.results;
  };