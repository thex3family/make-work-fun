import Draggable from "react-draggable"
import { useState, useEffect } from 'react';

export default function ModalPomo({ visibility, setVisibility, mobileDevice, userID }) {
  const [size, setSize] = useState('small');
  const [pomoURL, setPomoURL] = useState(`https://cuckoo.team/` + userID);
  const [pomoType, setPomoType] = useState('solo');

  async function changePomo(type) {
    setPomoType(type);
    if (type == 'solo') {
      setPomoURL(`https://cuckoo.team/` + userID)
    } else {
      setPomoURL('https://cuckoo.team/thex3family')
    }
  }


  return (
    <div className={`w-screen ${visibility ? '' : 'hidden'}`}>
      <div className="fixed z-50 w-full h-0 px-5">
        <Draggable
          handle=".handle"
          defaultPosition={{ x: 0, y: 25 }}
          scale={1}>
          <div className={`${mobileDevice ? 'opacity-100' : 'opacity-20'} hover:opacity-100 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle ${size == 'large' ? 'w-1/2' : size == 'medium' ? 'w-1/3' : 'w-full md:w-1/4'}`}>
            <div className="handle bg-gradient-to-r from-emerald-500 to-blue-500 h-5 cursor-move" />
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center flex-row">
              <div>
                <button type="button" onClick={() => changePomo('solo')} className={`inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 ${pomoType == 'solo' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 w-auto sm:text-sm`}
                >Solo</button>
                <button type="button" onClick={() => changePomo('group')} className={`inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 ${pomoType == 'group' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 ml-3 sm:w-auto sm:text-sm`}
                >Group </button>
              </div>
              <div className="flex flex-row items-center">
                <div className={`${mobileDevice ? 'hidden' : ''}`}>

                  <button type="button" onClick={() => setSize('small')} className="fas fa-mobile-alt mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />
                  <button type="button" onClick={() => setSize('medium')} className="fas fa-tablet-alt mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />
                  <button type="button" onClick={() => setSize('large')} className="fas fa-laptop mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />

                </div>
                <button onClick={() => setVisibility(false)} type="button" className="fas fa-minus inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-3 w-auto text-sm"/>
              </div>
            </div>
            <iframe
              className="w-full"
              height="350"
              src={pomoURL}
            />
          </div>
        </Draggable>
      </div></div>

  );
}
