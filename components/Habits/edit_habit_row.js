import { IconPicker } from 'react-fa-icon-picker';
import moment from 'moment';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase-client';
import Input from '@/components/ui/Input';
import ModalDQDetail from '../Modals/ModalDQDetail';
import { downloadImage } from '@/utils/downloadImage';

import { MultiSelect, Switch, TextInput } from '@mantine/core';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from '../ui/Button';

export function SimpleOverlay(props) {
  const { id } = props;

  return <div className={`animate-pulse h-28 w-full my-4 mb-0 relative bg-cover bg-center object-cover rounded z-10 square shadow-lg border-4 bg-dailies-light border-dailies-dark flex justify-center`}>
    <div className='text-dailies text-lg font-bold m-auto'>Drag me around!</div>
  </div>;
}

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
  habit_active,
  items,
  setItems,
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

  const [habitTitle, setHabitTitle] = useState(habit_title);
  const [habitDescription, setHabitDescription] = useState(habit_description);
  const [habitArea, setHabitArea] = useState(habit_area);
  const [habitIcon, setHabitIcon] = useState(habit_icon);
  const [habitActive, setHabitActive] = useState(habit_active);


  async function editMaster(value, column) {
    setSaving(true);

    const newData = items[habit_group]
    const index = (newData.findIndex((item) => habit_id === item.id));
    const item = newData[index];
    newData.splice(index, 1, { ...item, [`${column}`]: value });


    // reinsert this object back into the big array. apparently no need, since it is already updated.

    console.log('Updating Master', items);
    // items[habit_group] = newData;
    // setItems(items); 


    // need to update the database

    const updatedData = {
      [column]: value
    }

    try {
      const { data, error } = await supabase.from('habits')
        .update(updatedData)
        .match({ id: habit_id });

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        ref={setNodeRef} style={style}
        className={`animate-fade-in-down w-full my-4 mb-0 relative bg-cover bg-center object-cover rounded square shadow-lg border-4 bg-dailies-light border-dailies-dark`}
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
          <div className='flex flex-col md:flex-row justify-between gap-4'>
            <div className='flex md:flex-row flex-row-reverse gap-6'>
              <div className="flex flex-col justify-center align-center">
                <div className="flex justify-center">
                  <IconPicker
                    className=""
                    value={habitIcon}
                    onChange={(v) => (setHabitIcon(v), editMaster(v, 'icon'))}
                    size={35}
                    color="#000"
                  />
                </div>

                <p className="text-xs mt-3 mx-auto w-14 font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200">
                  +{exp_reward} XP
                </p>
              </div>
              <div className="flex flex-row w-full align-center gap-2">
                <div className="text-left self-center w-full flex flex-col gap-2">
                  <div className='grid grid-cols-5 gap-2 items-center'>
                    <div className='col-span-1 text-black font-semibold'>
                      Name:
                    </div>
                    <TextInput
                      placeholder={'Your Habit Name'}
                      value={habitTitle || ''}
                      onChange={(event) => (setHabitTitle(event.currentTarget.value))}
                      onBlur={() => editMaster(habitTitle, 'name')}
                      className='w-full col-span-4'
                      classNames={{
                        input: 'font-semibold leading-snug text-black'
                      }}
                    />
                    <div className='col-span-1 text-black font-semibold'>
                      Type:
                    </div>
                    <TextInput
                      value={habit_type || ''}
                      disabled={true}
                      className='w-full col-span-4'
                      classNames={{
                        input: 'font-semibold'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-row gap-6 m-auto'>
              <div className='flex flex-col w-full text-left gap-2'>
                <div className='flex flex-row gap-2 items-center'>
                  <div className='text-black font-semibold'>
                    Description:
                  </div>
                  <div className='text-black fas fa-info-circle cursor-pointer' onClick={() => setShowDailyQuestDetail(true)} />
                </div>
                <div className='flex flex-row gap-2 items-center'>
                  <div className='text-black font-semibold'>
                  Recurrence: Daily
                  </div>
                  {/* <div className='text-black fas fa-sync-alt cursor-pointer' onClick={() => setShowDailyQuestDetail(true)} /> */}
                </div>
              </div>
            </div>
            <div className='flex flex-row gap-6'>
              <div className='flex flex-col w-full text-left gap-2'>
                <div className='grid grid-cols-5 gap-2 items-center'>
                  <div className='col-span-1 text-black font-semibold'>
                    Area:
                  </div>
                  <TextInput
                    placeholder={'What are you looking for?'}
                    value={habitArea || ''}
                    onChange={(event) => setHabitArea(event.currentTarget.value)}
                    onBlur={() => editMaster(habitArea, 'area')}
                    className='w-full col-span-4'
                    classNames={{
                      input: 'p-2 text-black font-semibold rounded'
                    }}
                  />
                  <div className='col-span-1 text-black font-semibold'>
                    Goal:
                  </div>
                  <TextInput
                    value={'Coming Soon'}
                    disabled={true}
                    className='w-full col-span-4'
                    classNames={{
                      input: 'p-2 text-black font-semibold rounded'
                    }}
                  />
                </div>
              </div>
              <div className='flex flex-col md:flex-row self-center text-left gap-0 md:gap-2 justify-end items-center'>
                <Switch onLabel='ON' offLabel='OFF' size="lg" color="teal" checked={habitActive} onChange={(event) => (setHabitActive(event.currentTarget.checked), editMaster(event.currentTarget.checked, 'is_active'))} />;
                <i className='fas fa-bars text-black text-xl mt-auto mb-auto hideLinkBorder' {...attributes} {...listeners} />
              </div>
            </div>
          </div>

        </div>
      </div>


      {showDailyQuestDetail ? (
        <>
          <ModalDQDetail
            setShowDailyQuestDetail={setShowDailyQuestDetail}
            habit_id={habit_id}
            habitDescription={habitDescription}
            setHabitDescription={setHabitDescription}
            habit_title={habitTitle}
          />
        </>
      ) : null}
    </>
  );
}
