// const wins = [
//     {
//       name: 'My first quest',
//       type: 'Task',
//       closing_date: '2021-06-17',
//       trend: 'check',
//       gold_reward: '50',
//       exp_reward:  '30',
//     },
//     // More wins...
//   ]
  
  export default function TailwindTable({wins}) {
    return (
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg ">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-emerald-500 to-blue-500">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                    >
                      Recent Win
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                    >
                      Completed
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                    >
                      Trend
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider"
                    >
                      Rewards
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-primary-2 divide-y divide-gray-200 ">
                  {wins.map((win) => (
                    <tr key={win.name} className="hover:bg-gray-900 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src='/img' alt="" />
                          </div> */}
                          <div className="">
                            <div className="text-sm font-medium text-white">{win.name}</div>
                            <div className="text-sm px-2 inline-flex font-semibold rounded bg-emerald-100 text-emerald-800">{win.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{win.closing_date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        <i
                          className={
                            win.trend === "up" ? "fas fa-arrow-up text-emerald-600"
                              : win.trend === "down" ? "fas fa-arrow-down text-red-600"
                              : win.trend === "check" ? "fas fa-check text-emerald-600"
                              : ""
                          }
                            />
                            </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src='/img' alt="" />
                          </div> */}
                          <div className="">
                            <div className="text-sm font-medium text-white">+{win.gold_reward} 💰</div>
                            <div className="text-sm text-gray-400">+{win.exp_reward} XP</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
  