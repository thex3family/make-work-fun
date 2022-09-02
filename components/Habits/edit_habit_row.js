import { IconPicker } from 'react-fa-icon-picker';
import moment from 'moment';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase-client';
import Input from '@/components/ui/Input';
import ModalDQDetail from '../Modals/ModalDQDetail';
import { downloadImage } from '@/utils/downloadImage';

import { Switch, TextInput } from '@mantine/core';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function EditHabitRow({
  habit_id,
  habit_title,
  habit_type,
  habit_description,
  habit_group,
  habit_sort,
  habit_area,
  exp_reward,
  habit_icon,
  player
}) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: habit_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [saving, setSaving] = useState(false);

  const [showDailyQuestDetail, setShowDailyQuestDetail] = useState(false);


  return (
    <>
      <div
        ref={setNodeRef} style={style} {...attributes} {...listeners}
        key={habit_id}
        className={`overflow-x-hidden animate-fade-in-down w-full my-4 mb-0 relative bg-cover bg-center object-cover rounded z-10 square shadow-lg border-4 bg-dailies-light border-dailies-dark ${habit_type == 'Checkbox' ? null : null
          }`}
      >
        <div className={`p-4 h-full`}>
          {saving ? (
            <div className="inline-flex absolute top-0 right-0 mt-2 mr-2 text-xs font-semibold py-2 px-3 uppercase rounded text-white bg-gradient-to-r from-emerald-500 to-blue-500 border-emerald-500 z-50">
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </div>
          ) : (
            <div></div>
          )}
          <div className='grid grid-cols-6 sm:grid-cols-5 lg:grid-cols-4 gap-4'>
            <div className='col-span-4 sm:col-span-3 lg:col-span-2'>
              <div className="self-center flex flex-row align-center">
                <div className="flex flex-col justify-center mr-5 align-center">
                  <div className="flex justify-center">
                    <IconPicker
                      className=""
                      value={habit_icon}
                      size={35}
                      color="#000"
                    />
                  </div>

                  <p className="text-xs mt-3 mx-auto">
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200">
                      +{exp_reward} XP
                    </span>
                  </p>
                </div>
                <div className="text-left w-2/3 pr-5 self-center">
                  <div className='flex gap-2 flex-row items-center mb-1'>
                    <TextInput
                      placeholder={'Your Habit Name'}
                      value={habit_title || ''}
                      classNames={{
                        input: 'text-lg sm:text-xl font-bold leading-snug text-black'
                      }}
                    />
                    <div className='text-black fas fa-info-circle cursor-pointer ' onClick={() => setShowDailyQuestDetail(true)} />
                  </div>
                  <p className="text-sm sm:text-md mt-2 pl-3 text-black">
                    Type: {habit_type}
                  </p>
                  <div className="hidden sm:visible">
                    <p className="text-xs mt-3">
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200">
                        +{exp_reward} XP
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-span-2 flex flex-row self-center text-left gap-4 justify-end'>
              <TextInput
                placeholder={'What are you looking for?'}
                value={habit_area || ''}
                classNames={{
                  input: 'p-2 text-accents-1 font-semibold rounded'
                }}
              />
              <Switch onLabel='ON' offLabel='OFF' size="lg" color="teal" />;
            </div>
          </div>
        </div>
      </div>


      {showDailyQuestDetail ? (
        <>
          {/* <ModalDQDetail
          setShowDailyQuestDetail={setShowDailyQuestDetail}
          habit_id={habit_id}
          habit_description={habit_description}
          fetchDailies={fetchDailies}
          player={player}
          setHabits={setHabits}
          setLevelUp={setLevelUp}
          setDailiesCount={setDailiesCount}
          habit_title={habit_title}
        /> */}
        </>
      ) : null}
    </>
  );
}
