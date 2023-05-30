import { Client } from '@notionhq/client';
import { supabase } from '@/utils/supabase-client';
import TaskGroups from '@/components/Tasks/tasks_groups';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function TaskList({ impact_tasks, all_personal_tasks }) {

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function loadAndRefresh() {
    setLoading(true);
    router.reload(window.location.pathname);
  }

  return (
    <div className='py-6 px-10'>
      <div className="max-w-6xl mx-auto pt-8 pb-8 px-4">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Active Quests
          </h1>
          <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            Quests in progress or scheduled to do today. <i className={`ml-1 fas fa-sync-alt cursor-pointer ${loading ? 'animate-spin' : ''}`} onClick={() => loadAndRefresh()}/>
          </p>
         
        </div>
      </div>
      <TaskGroups tasks={all_personal_tasks} name='Personal Tasks' />
      <TaskGroups tasks={impact_tasks.results} name='Impact Tasks' />
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

    const { data: userData } = await supabase
      .from('users')
      .select('notion_user_id')
      .eq('id', user.id)
      .single();

    const notion_user_id = userData.notion_user_id;

    let all_personal_tasks = [];

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

      impact_tasks.results = impact_tasks.results.map(task => ({ ...task, api_secret_key: process.env.IMPACT_SECRET_KEY }));

      const { data: notionDatabases } = await supabase
        .from('notion_credentials')
        .select('nickname, api_secret_key, database_id')
        .eq('player', user.id);

      if (notionDatabases) {
        try {

          const dataPromises = notionDatabases.map(async (database) => {
            const notion_personal = new Client({ auth: database.api_secret_key });
            const personal_tasks = await notion_personal.databases.query({
              database_id: database.database_id,
              filter: {
                and: [
                  {
                    property: 'Type',
                    select: {
                      equals: 'Task',
                    },
                  },
                  {
                    property: 'Status',
                    select: {
                      does_not_equal: 'Complete',
                    },
                  },
                  {
                    or: [
                      {
                        property: 'Status',
                        select: {
                          equals: 'In Progress',
                        },
                      },
                      {
                        property: 'Do Date',
                        date: {
                          before: new Date().toISOString(),
                        },
                      },
                    ]
                  },
                  {
                    or: [
                      {
                        property: 'Collaborators',
                        people: {
                          contains: notion_user_id,
                        },
                      },
                      {
                        property: 'Collaborators',
                        people: {
                          is_empty: true,
                        },
                      },
                    ]
                  }

                ],
              },
              sorts: [
                {
                  property: 'Do Date',
                  direction: 'ascending',
                },
                {
                  property: 'Impact',
                  direction: 'ascending',
                },
              ],
            });
            return { 
              tasks: personal_tasks, 
              api_secret_key: database.api_secret_key 
            }; // return object with tasks and key
          });

          // wait for all promises to resolve
          const promise = await Promise.allSettled(dataPromises);

          // You can then filter for fulfilled promises and their values like this:
          all_personal_tasks = promise
            .filter(promise => promise.status === 'fulfilled')
            .flatMap(promise => 
              promise.value.tasks.results.map(task => ({ ...task, api_secret_key: promise.value.api_secret_key }))
            );


          // Sort all_personal_tasks
          all_personal_tasks.sort((a, b) => {
            // Convert 'Do Date' strings to Date objects
            let dateA = new Date(a['Do Date']);
            let dateB = new Date(b['Do Date']);

            // Sort by 'Do Date' first
            if (dateA < dateB) {
              return -1;
            }
            if (dateA > dateB) {
              return 1;
            }

            // If 'Do Date' is the same, sort by 'Impact'
            if (a.Impact < b.Impact) {
              return -1;
            }
            if (a.Impact > b.Impact) {
              return 1;
            }

            // If both 'Do Date' and 'Impact' are the same, do not change order
            return 0;
          });


        } catch (error) {
          console.log(error);
        }
      }


      return { props: { user, impact_tasks, all_personal_tasks } };
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
