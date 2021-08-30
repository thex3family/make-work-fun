import React from 'react';

export default function CardParty({ party, avatar_urls }) {
  
  avatar_urls.then((result) => { // TODO: Use these results to populate the list of member avatars (Reuse the member avatar component that is used for cards in the kanban board)
    console.log("CardParty -", result);
  });

  var start_date = new Date(party.start_date);
  var due_date = new Date(party.due_date);

  // get the number of days between the start date and due date
  var num_of_days = due_date.getDate() - start_date.getDate();

  // get the number of days from the start date and today
  var num_of_days_passed = (new Date()).getDate() - start_date.getDate(); 

  // divide this number by the number of days and convert the result into a percentage
  var deadline_completion_percentage = (num_of_days_passed / num_of_days) * 100;

  const health = 75;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mx-auto mt-2 text-left cursor-pointer">
      <div className="py-4 px-8 mt-3">
        <div className="grid grid-cols-4 mb-4">
          <h2 className="col-span-3 text-gray-700 font-semibold text-2xl tracking-wide mb-2">
            { party.name }
          </h2>
          <div className="flex flex-wrap pt-2">
              <div className="relative w-full max-w-full flex-grow flex-1">
                <div className="flex items-center">
                  <i
                    className={`mr-2 fas fa-heart ${
                      health >= 75
                        ? 'text-emerald-500'
                        : health >= 50
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  />
                  <div className="relative w-full">
                    <div
                      className={`overflow-hidden h-2 text-xs flex rounded ${
                        health >= 75
                          ? 'bg-emerald-200'
                          : health >= 50
                          ? 'bg-yellow-200'
                          : 'bg-red-200'
                      }`}
                    >
                      <div
                        style={{ width: `${health}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          health >= 75
                            ? 'bg-emerald-500'
                            : health >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <p className="row-start-2 col-span-3 text-black">{ party.description }</p>
          
          
        </div>
        <div className="w-full mb-4">
            <div className="shadow w-full bg-gray-200 mt-2 rounded-full">
              <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-xs leading-none py-1 text-center text-white w-3/4 h-4 rounded-full " style={{ width: deadline_completion_percentage + '%' }}></div>
            </div>
          </div>
      </div>
    </div>
  );
}
