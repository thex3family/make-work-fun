import React from 'react';

export default function CardParty({ party }) {
  var start_date = new Date(party.start_date);
  var due_date = new Date(party.due_date);

  // get the number of days between the start date and due date
  var num_of_days = due_date.getDate() - start_date.getDate();

  // get the number of days from the start date and today
  var num_of_days_passed = (new Date()).getDate() - start_date.getDate(); 

  // divide this number by the number of days and convert the result into a percentage
  var deadline_completion_percentage = (num_of_days_passed / num_of_days) * 100;

  return (
    <div className="max-w-lg bg-white shadow-md rounded-lg overflow-hidden mx-auto mt-2">
      <div className="py-4 px-8 mt-3">
        <div className="flex flex-col mb-8">
          <h2 className="text-gray-700 font-semibold text-2xl tracking-wide mb-2">
            { party.name }
          </h2>
          <p className="text-black">{ party.description }</p>
          <p className="text-black">
            memberAvatar1 memberAvatar2 memberAvatar3
          </p>
          <div className="w-full">
            <div className="shadow w-full bg-grey-light mt-2">
              <div className="bg-green text-xs leading-none py-1 text-center text-white w-3/4 h-4" style={{ width: deadline_completion_percentage + '%' }}></div>
            </div>
          </div>
          <p className="text-black">Metrics</p>
        </div>
        <div className="mt-1">
          <a
            href="#"
            className="block tracking-widest uppercase text-center shadow bg-indigo-600 hover:bg-indigo-700 focus:shadow-outline focus:outline-none text-white text-xs py-3 px-10 rounded"
          >
            View Party
          </a>
        </div>
      </div>
    </div>
  );
}
