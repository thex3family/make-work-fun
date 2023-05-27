import { Client } from '@notionhq/client';
import { supabase } from '@/utils/supabase-client';

export default function TaskList({impact_tasks}) {

  return (
    <div>
    {impact_tasks ?
      impact_tasks.results.map((task) => (
          <p className="font-semibold truncate mb-1">{task.properties.Name.title[0].plain_text}</p>
      )) : null}
      </div>
  );
}

export async function getServerSideProps({ req }) {
  try {
    // Get the user's session based on the request
    const { user } = await supabase.auth.api.getUserByCookie(req);

    if (!user) {
      return {
        redirect: {
          destination: '/signin?redirect=player',
          permanent: false
        }
      };
    }

    console.log(user.id);

    const { data } = await supabase
      .from('users')
      .select('notion_user_id')
      .eq('id', user.id)
      .single();

    const notion_user_id = data.notion_user_id;

    if(notion_user_id){
      // Send credentials to Notion API
      const notion = new Client({ auth: process.env.IMPACT_SECRET_KEY });

      const impact_tasks = await notion.databases.query({
        database_id: process.env.IMPACT_DATABASE_ID,
        filter: {
          and: [
            {
              property: 'Type',
              select: {
                equals: 'Task',
              },
            },
            {
              property: 'Upstream Sub-Type',
              rollup: {
                any: {
                  multi_select: {
                    contains: "World Boss"
                  }
                }
              },
            },
            {
              property: 'Status',
              select: {
                does_not_equal: 'Complete',
              },
            },
            {
              property: 'Collaborators',
              people: {
                contains: notion_user_id,
              },
            },
          ],
        },
        sorts: [
          {
            property: 'Days To Go',
            direction: 'ascending',
          },
          {
            property: 'Impact',
            direction: 'ascending',
          },
        ],
      });

      return { props: { user, impact_tasks } };
    }


  } catch (error) {
    console.log(error);
    return {
      redirect: {
        destination: '/credentials-invalid',
        permanent: false
      }
    };
  }
}
