import { Client } from '@notionhq/client';
import { supabase } from '@/utils/supabase-client';
import Button from '@/components/ui/Button/Button';
import Link from 'next/link';

export default function TaskList({ impact_tasks }) {

  return (
    <div className='py-6 px-10'>
      <h2 className='text-xl font-semibold mb-3'>Impact Tasks</h2>
      <div className='flex flex-col gap-3'>
        {impact_tasks ?
          impact_tasks.results.map((task) => (

            <a className={`w-full hideLinkBorder shadow-lg rounded cursor-pointer  
              bg-primary-3 bg-cover bg-center object-cover transition duration-500 ease-out transform hover:scale-105 ${task.properties.Status?.select?.name == "In Progress" ? 'scale-105' : ''}`} href={task.url} target="_blank"
              style={{
                backgroundImage: `url(${task.properties.Priority?.select?.name.includes("Ice Cream")
                  ? '/challenge/ice_cream.png'
                  : task.properties.Priority?.select?.name.includes("Eat The Frog")
                  ? '/challenge/eat_the_frog.png'
                  : task.properties.Priority?.select?.name.includes("Priority")
                  ? '/challenge/priority.png'
                  : '/challenge/bonus.png'
                  })`
              }}>
              <div className={`bg-dark bg-opacity-70 p-4 flex flex-col sm:flex-row justify-between align-middle items-center ${task.properties.Status?.select?.name == "In Progress" ? 'ring-yellow-400 ring-2 rounded' : ''} `}>
                <div className='w-full sm:w-3/5 text-center sm:text-left'>
                  <p className="font-semibold truncate mb-1">{task.properties.Name.title[0].plain_text}</p>
                  <p className="font-normal">{task.properties["Upstream (Sum)"].formula.string}</p>
                  <p className="font-normal">{task.properties.Details.formula.string}</p>
                  {/* <p className="font-normal">{task.properties.Priority?.select?.name}</p> */}
                </div>
                <div className='w-3/4 sm:w-0.5 m-4 bg-white opacity-60 h-0.5 sm:h-20 rounded'></div>
                <div className='text-center'>
                  <p className="font-normal">{task.properties.Punctuality.formula.string}</p>
                  <p className="text-xs mt-3 mx-auto font-semibold py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200">
                      {task.properties.Reward.formula.string}
                  </p>
                </div>
              </div>
            </a>
          )) : 
          <a href="/missions" target="_blank">
            <Button
              className="mr-auto"
              variant="prominent"
            >
              Pick Up A Mission
            </Button>
          </a>}
      </div>
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
          destination: '/signin?redirect=task-list',
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

    if (notion_user_id) {
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
            property: 'Priority',
            direction: 'ascending',
          },
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
