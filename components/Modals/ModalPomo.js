import Draggable from "react-draggable"
import { useState, useEffect } from 'react';

export default function ModalPomo({visibility, setVisibility}) {
  const [size, setSize] = useState('small');

  return (
    <div className={`w-screen ${visibility ? '' : 'hidden'}`}> 
    <div className="fixed z-50 w-full h-0 px-5">
      <Draggable
        handle=".handle"
        defaultPosition={{x: 50, y: 25}}
        scale={1}>
          <div className={`opacity-20 hover:opacity-100 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle ${size == 'large' ? 'w-1/2' : size == 'medium' ? 'w-1/3' : 'w-full md:w-1/4'}`}>

            <div className="handle bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse cursor-move">
              <button onClick={() => setVisibility(false)} type="button" className="w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                Close
              </button>
              <div className="hidden sm:visible">
              <button type="button" onClick={() => setSize('large')} className="fas fa-laptop mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />
              <button type="button" onClick={() => setSize('medium')} className="fas fa-tablet-alt mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />
              <button type="button" onClick={() => setSize('small')} className="fas fa-mobile-alt mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />
              </div>
            </div>
            <iframe
              className="w-full"
              height="350"
              src="https://cuckoo.team/thex3family"
            />
          </div>
      </Draggable>
    </div></div>

  );
}
