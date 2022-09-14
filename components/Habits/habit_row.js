import { IconPickerItem } from 'react-fa-icon-picker';
import moment from 'moment';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase-client';
import Input from '@/components/ui/Input';
import ModalDQDetail from '../Modals/ModalDQDetail';
import { downloadImage } from '@/utils/downloadImage';

import { Popover } from '@mantine/core';

export function HabitInteraction({ date, habitState, habitCompletedToday, setHabitCompletedToday, insertedD, habit_id, habit_type, setPicture, handleHabitCompletionStatusChange, saving, day }) {
  const [opened, setOpened] = useState(false);
  const fileRef = useRef();

  const [details, setDetails] = useState(insertedDetails);

  const [hours, setHours] = useState(null);
  const [mins, setMins] = useState(null);
  
  const [habitCompleted, setHabitCompleted] = useState(habitState);
  const [insertedDetails, setInsertedDetails] = useState(insertedD);

  useEffect(() => {
    setDetails(insertedDetails);
  }, [insertedDetails]);

  
  useEffect(() => {
    if(habit_type == "Duration" && insertedDetails){
      setHours(Math.floor(insertedDetails/60))
      setMins(insertedDetails%60)
    }
  }, [habit_type]);

  function getTimeInMinutes(hours, mins) {
    var totalTime = (Number(hours) * 60) + Number(mins); 
    return totalTime;
  }

  return (
    <>
      {habit_type == 'Checkbox' ?
        <button className={`fas fa-check text-2xl sm:text-3xl font-semibold text-black hideLinkBorder opacity-10 hover:opacity-100 ${habitCompleted ? `opacity-100` : ``
          }`}
          disabled={saving}
          onClick={() => handleHabitCompletionStatusChange(habit_id, null, null, date, day, habitCompleted, setHabitCompleted, setHabitCompletedToday, setInsertedDetails)} />
        : null}
      {habit_type == 'Counter' ?
        <>
          <div className="">
            <div className="text-3xl mb-0.5 px-2 self-center font-semibold text-black">
              {details ? details : 0}
            </div>
            <div className='flex flex-row gap-2'>
              <button
                className={`text-2xl opacity-10 text-black hideLinkBorder far fa-minus-square ${details > 0 ? `hover:opacity-100` : ``
                  }`}
                onClick={() =>
                  handleHabitCompletionStatusChange(
                    habit_id,
                    'countdown',
                    Number(details) - 1, date, day, habitCompleted, setHabitCompleted, setHabitCompletedToday, setInsertedDetails
                  )
                }
                disabled={saving || !details}
              />
              <button
                className="text-2xl opacity-10 text-black hideLinkBorder far fa-plus-square hover:opacity-100"
                onClick={() =>
                  handleHabitCompletionStatusChange(
                    habit_id,
                    'countup',
                    Number(details) + 1, date, day, habitCompleted, setHabitCompleted, setHabitCompletedToday, setInsertedDetails
                  )
                }
                disabled={saving}
              />
            </div>

          </div>
        </>
        : null}
      {habit_type == 'Duration' ?
        <Popover
          opened={opened}
          onClose={() => setOpened(false)}
          target={
            <div className='flex flex-col'>
              <div className='w-16 truncate text-sm mb-2 self-center font-semibold text-black'>
                {details ? details : 0} MINS
              </div>
              <button className={`far fa-clock text-2xl self-center font-semibold text-black hideLinkBorder opacity-10 hover:opacity-100 ${details > 0 ? `opacity-100` : ``
                }`}
                disabled={saving}
                onClick={() => setOpened((o) => !o)} />
            </div>
          }
          position="bottom"
          withArrow
        >
          <form className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault()
              handleHabitCompletionStatusChange(
                habit_id,
                'Duration',
                getTimeInMinutes(hours, mins), 
                date, day, habitCompleted, setHabitCompleted, setHabitCompletedToday, setInsertedDetails
              )
            }}>
            <div className="flex flex-row align-middle items-center gap-2 mb-4 mt-2">
              <Input
                className="text-xs sm:text-sm font-semibold rounded"
                variant="dailies"
                id="Note"
                type="number"
                placeholder="Add duration here!"
                value={hours || ''}
                onChange={(v) => setHours(v)}
              />
              <div
                className={`font-semibold text-xs sm:text-sm text-black mr-1 opacity-30`}
              >
                HRS
              </div>
              <Input
                className="text-xs sm:text-sm font-semibold rounded"
                variant="dailies"
                id="Note"
                type="number"
                placeholder="Add duration here!"
                value={mins || ''}
                onChange={(v) => setMins(v)}
              />
              <div
                className={`font-semibold text-xs sm:text-sm text-black mr-1 opacity-30`}
              >
                MINS
              </div>
            </div>
            <button
              className="font-semibold text-sm text-black hideLinkBorder self-start sm:self-center"
              variant="slim"
              disabled={saving}
              onClick={() => setOpened((o) => !o)}
            >
              {habitCompleted ? 'Update' : 'Save'}
            </button>
          </form>
        </Popover>
        // need an if statement to show the time when it is done
        : null}
      {habit_type == 'Feeling' ?
        <Popover
          opened={opened}
          onClose={() => setOpened(false)}
          target={<button
            className={`text-4xl text-black hideLinkBorder opacity-10 hover:opacity-100 ${details ? `opacity-100` : ``
              } ${habitCompleted
                ? (details == 'happy' ? 'far fa-smile' : details == 'meh' ? 'far fa-meh' : details == 'unhappy' ? 'far fa-frown' : null) : 'far fa-meh'} `}
            onClick={() => setOpened((o) => !o)}
            disabled={saving}
          />}
          position="bottom"
          withArrow
        >
          <div className="flex-row flex gap-2 justify-center">
            <button
              className={`text-4xl text-black hideLinkBorder far fa-smile ${habitCompleted
                ? details == 'happy'
                  ? `opacity-100`
                  : `opacity-10 hover:opacity-100`
                : `hover:text-emerald-500`
                }`}
              onClick={() =>
              (handleHabitCompletionStatusChange(
                habit_id,
                'Feeling',
                `${details == 'happy' ? '' : 'happy'}`, date , day, habitCompleted, setHabitCompleted, setHabitCompletedToday, setInsertedDetails
              ), setOpened((o) => !o))
              }
              disabled={saving}
            />
            <button
              className={`text-4xl text-black hideLinkBorder far fa-meh ${habitCompleted
                ? details == 'meh'
                  ? `opacity-100`
                  : `opacity-10 hover:opacity-100`
                : `hover:text-yellow-500`
                }`}
              onClick={() =>
              (handleHabitCompletionStatusChange(
                habit_id,
                'Feeling',
                `${details == 'meh' ? '' : 'meh'}`, date , day, habitCompleted, setHabitCompleted, setHabitCompletedToday, setInsertedDetails
              ), setOpened((o) => !o))
              }
              disabled={saving}
            />
            <button
              className={`text-4xl text-black hideLinkBorder far fa-frown ${habitCompleted
                ? details == 'unhappy'
                  ? `opacity-100`
                  : `opacity-10 hover:opacity-100`
                : `hover:text-red-500`
                }`}
              onClick={() =>
              (handleHabitCompletionStatusChange(
                habit_id,
                'Feeling',
                `${details == 'unhappy' ? '' : 'unhappy'}`, date , day, habitCompleted, setHabitCompleted, setHabitCompletedToday, setInsertedDetails
              ), setOpened((o) => !o))
              }
              disabled={saving}
            />
          </div>
        </Popover>

        : null}
      {habit_type == 'Location' ?
        <Popover
          opened={opened}
          onClose={() => setOpened(false)}
          target={
            <div className='flex flex-col flex-wrap'>
              <div className='w-16 truncate text-sm mb-2 self-center font-semibold text-black'>
                {details ? details : null}
              </div>
              <button className={`fas fa-map-pin text-2xl self-center font-semibold text-black hideLinkBorder opacity-10 hover:opacity-100 ${details ? `opacity-100` : ``
                }`}
                disabled={saving}
                onClick={() => setOpened((o) => !o)} />
            </div>
          }
          position="bottom"
          withArrow
        >

          <form className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault()
              handleHabitCompletionStatusChange(
                habit_id,
                'Location',
                details, date , day, habitCompleted, setHabitCompleted, setHabitCompletedToday, setInsertedDetails
              )
            }}>
            <Input
              className="text-xs sm:text-sm mt-1 mb-2 sm:mb-4 font-semibold rounded"
              variant="dailies"
              id="Note"
              type="varchar"
              placeholder="Add location here!"
              value={details || ''}
              onChange={(v) => setDetails(v)}
            />
            <button
              className="font-semibold text-sm text-black hideLinkBorder self-start sm:self-center"
              variant="slim"
              disabled={saving}
              onClick={() => setOpened((o) => !o)}
            >
              {habitCompleted ? 'Update' : 'Save'}
            </button>
          </form>
        </Popover>
        : null}
      {habit_type == 'Note' ?
        <Popover
          opened={opened}
          onClose={() => setOpened(false)}
          target={
            <div className='flex flex-col flex-wrap'>
              <div className='w-16 truncate text-sm mb-2 self-center font-semibold text-black'>
                {details ? details : null}
              </div>
              <button className={`far fa-sticky-note text-2xl self-center font-semibold text-black hideLinkBorder opacity-10 hover:opacity-100 ${details ? `opacity-100` : ``
                }`}
                disabled={saving}
                onClick={() => setOpened((o) => !o)} />
            </div>
          }
          position="bottom"
          withArrow
        >
          <form className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault()
              handleHabitCompletionStatusChange(habit_id, 'Note', details, date , day, habitCompleted, setHabitCompleted, setHabitCompletedToday, setInsertedDetails)
            }}>
            <Input
              className="text-xs sm:text-sm mt-1 mb-2 sm:mb-4 font-semibold rounded"
              variant="dailies"
              id="Note"
              type="varchar"
              placeholder="Add your note here!"
              value={details || ''}
              onChange={(v) => setDetails(v)}
            />
            <button
              className="font-semibold text-sm text-black hideLinkBorder self-start sm:self-center"
              variant="slim"
              disabled={saving}
              onClick={() => setOpened((o) => !o)}
            >
              {habitCompleted ? 'Update' : 'Save'}
            </button>
          </form>
        </Popover>
        : null}

      {habit_type == 'Picture' ?
        <div className="relative">
          <button className={`fas fa-camera text-2xl sm:text-3xl self-center font-semibold text-black cursor-pointer hideLinkBorder opacity-10 hover:opacity-100 ${habitCompleted ? `opacity-100` : ``
            }`}
            htmlFor="single"
            onClick={() => fileRef.current.click()}>
          </button>
          <input
            ref={fileRef}
            style={{
              visibility: 'hidden',
              position: 'relative',
              display: 'none'
            }}
            hidden
            type="file"
            id="single"
            accept="image/*"
            onChange={(event) => {
              if (event.target.files && event.target.files.length > 0) {
                setPicture(URL.createObjectURL(event.target.files[0]))
                  , handleHabitCompletionStatusChange(habit_id, 'Picture', event, date , day, habitCompleted, setHabitCompleted, setHabitCompletedToday, setInsertedDetails)
              }
            }
            }
            disabled={saving}
          />
        </div>
        : null}
    </>
  );
}

export default function HabitRow({
  habit_id,
  habit_title,
  habit_type,
  habit_detail,
  habit_description,
  streak_duration,
  streak_start,
  streak_end,
  exp_reward,
  habit_icon,
  fetchDailies,
  fetchDailiesCompletedToday,
  habitCounter,
  setHabitCounter,
  displayMode,
  player, setHabits, setLevelUp, setDailiesCount,
  downstreamHabitRefresh,
  setDownstreamHabitRefresh
}) {
  const [saving, setSaving] = useState(false);
  const [habitCompletedToday, setHabitCompletedToday] = useState(false);

  const [showDailyQuestDetail, setShowDailyQuestDetail] = useState(false);

  const [picture, setPicture] = useState(false);

  const [todayHabit, setTodayHabit] = useState(null);
  const [yesterdayHabit, setYesterdayHabit] = useState(null);

  const [cardDetails, setCardDetails] = useState(null);
  const [habitDescription, setHabitDescription] = useState(habit_description);

  // useEffect(() => {
  //   if (streak_end) {
  //     wasHabitCompletedToday(streak_end);
  //     setCardDetails(habit_detail)
  //   } else {
  //     setHabitCompletedToday(false)
  //     // need something here to remove the habit counter if changed from elsewhere.
  //     // setHabitCounter((v) => v.splice(0, v.length - 1));
  //     setCardDetails(null);
  //   }
  // }, [streak_end, habit_detail]);

  useEffect(() => {
    if (downstreamHabitRefresh) {
      // fetch Habits
      setHabitCounter([]);
      fetchHabitState(habit_id, moment().startOf('day').format('yyyy-MM-DD'), setTodayHabit);
      fetchHabitState(habit_id, moment().startOf('day').subtract(1, "days").format('yyyy-MM-DD'), setYesterdayHabit);
      setDownstreamHabitRefresh(false)
    }
  }, [downstreamHabitRefresh]);


  useEffect(() => {
    if (todayHabit?.length > 0) {
      setHabitCompletedToday(true)
      setHabitCounter((v) => [...v, 'Complete']);
      setCardDetails(todayHabit[0].details)
    } else {
      setHabitCompletedToday(false)
      // need something here to remove the habit counter if changed from elsewhere.
      // setHabitCounter((v) => v.splice(0, v.length - 1));
      setCardDetails(null);
    }
  }, [todayHabit]);


  useEffect(() => {
    if (habit_type == "Picture" && habit_detail) {
      // console.log('habit picture detail: ', habit_detail)
      loadDailiesPicture(habit_detail);
    }
  }, [habit_type, habit_detail]);

  async function loadDailiesPicture(url) {
    setPicture(await downloadImage(url, 'dailies'))
  }


  // function wasHabitCompletedToday(streak_end) {
  //   const habitCompletedToday =
  //     moment(streak_end).format('yyyy-MM-DD') == moment().startOf('day').format('yyyy-MM-DD');
  //   setHabitCompletedToday(habitCompletedToday);

  //   if (habitCompletedToday) {
  //     // make sure the habit counter only adds if the habitcompleted today is tue
  //     setHabitCounter((v) => [...v, 'Complete']);
  //     // hacky way of not showing the previous time's habit_detail. 
  //     setCardDetails(habit_detail);
  //   } else {
  //     // I have an issue where removals of habits doesn't lower the count
  //     // setHabitCounter((v) => v.splice(0, v.length - 1));
  //   }
  // }

  function habit_progress_statement(streak_duration) {
    return (streak_duration != 0) & (streak_duration != null)
      ? '' +
      (streak_duration > 9 ? '9+ ' : streak_duration + ' day ') +
      'streak! 🔥'
      : 'You got this! ✊';
  }

  async function toggleHabitStatus(habit_id, type, inputDetails, date) {
    setSaving(true);
    try {
      // See if the habit has been completed today
      const { data, error } = await supabase
        .from('completed_habits')
        .select('*')
        .eq('player', player)
        .eq('habit', habit_id)
        .eq('completed_on', date);

      if (error && status !== 406) {
        throw error;
      }

      //console.log('toggleHabitStatus - data - ', data);

      const fetchData = data;

      if (fetchData.length == 0) {
        // if not completed, post to database (i.e. fetchData is an empty array)

        let testDateStr = new Date();
        // let testDate = moment().startOf('day').format('YYYY-MM-DD');
        // console.log('testDateStr: ' + testDateStr);
        /*
                Notes from us trying to resolve that timezone issue (supabase is still not saving the timezone)
      
                testDate.toLocaleDateString() + " " + testDate.toLocaleTimeString(); // doesn't give the timezone
                testDate.toString() // getting gmt 0700 not recognized
              */

        const { data, error } = await supabase.from('completed_habits').insert([
          {
            player: player,
            closing_date: testDateStr,
            completed_on: date,
            exp_reward: 25,
            details: inputDetails,
            habit: habit_id
          }
        ]);

        if (error && status !== 406) {
          throw error;
        }
      } else if (fetchData.length >= 1) {
        // console.log('fetchData - second condition');

        // if notes, just update
        if (inputDetails || inputDetails > 0) {
          const { data, error } = await supabase
            .from('completed_habits')
            .update({ details: inputDetails })
            .eq('id', fetchData[0].id);
        } else {
          // if completed, remove (i.e. fetchData is an array with one element)
          const { data, error } = await supabase
            .from('completed_habits')
            .delete()
            .match({ id: fetchData[0].id });

          // setHabitCompletedToday(false);

          if (error && status !== 406) {
            throw error;
          }
        }
      }

      // setLoading(true);
    } catch (e) {
      alert(e.message);
    } finally {
      setDailiesCount(await fetchDailiesCompletedToday(player));
      setSaving(false);
      // setLoading(false);
    }
  }

  useEffect(() => {
    if (displayMode == 'demo') {
      setTodayHabit([]);
      setYesterdayHabit([]);
    }
  }, [displayMode]);

  async function handleHabitCompletionStatusChange(habit_id, type, inputDetails, date, day, habitCompleted, setHabitCompleted, setHabitCompletedToday, setInsertedDetails){
    if (displayMode == 'demo') {
      console.log(inputDetails);
      setInsertedDetails(inputDetails);
      setHabitCompleted(inputDetails ? true : !habitCompleted);
      if(day=='today'){
        setHabitCompletedToday(inputDetails ? true : !habitCompleted);
        setCardDetails(inputDetails);
      }
    } else {
      if (type == 'Picture') {
        try {
          setSaving(true);

          const file = inputDetails.target.files[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          let { error: uploadError } = await supabase.storage
            .from('dailies')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          toggleHabitStatus(habit_id, type, filePath, date).then(() => {
            // may not be necessary in the future. Figure out how we can abstract out the click.
            fetchDailies(player, setHabits, setLevelUp, setDailiesCount, 'click');
          });

        } catch (error) {
          // alert(error.message);
          console.log(error.message);
        } finally {
        }

      } else {
        // setDetails(inputDetails);
        //console.log('handleHabitCompletionStatusChange');
        toggleHabitStatus(habit_id, type, inputDetails, date).then(() => {
          fetchDailies(player, setHabits, setLevelUp, setDailiesCount, 'click');
        });
      }
    }
  }

  async function fetchHabitState(habit_id, date, setHabit) {
    try {

      const { data, error } = await supabase
        .from('completed_habits')
        .select('*')
        .eq('habit', habit_id)
        .eq('completed_on', date)
        .limit(1);

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setHabit(data);
        // console.log(habit_id, data);
      }


    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
    }
  }

  return (<>
    <div
      key={habit_id}
      // onClick={
      //   habit_type == 'Checkbox'
      //     ? saving
      //       ? null
      //       : () => handleHabitCompletionStatusChange(habit_id)
      //     : null
      // }
      className={`overflow-x-hidden animate-fade-in-down w-full my-4 mb-0 relative bg-cover bg-center object-cover ${habitCompletedToday
        ? cardDetails == 'meh'
          ? `bg-yellow-500 border-yellow-700`
          : cardDetails == 'unhappy'
            ? `bg-red-500 border-red-700`
            : `bg-emerald-500 border-emerald-700`
        : `bg-dailies-light border-dailies-dark`
        } rounded z-10 square shadow-lg border-4 ${habit_type == 'Checkbox' ? null : null
        }`}
      style={{
        backgroundImage: `url(${picture})`
      }}
    >
      <div className={`p-4 h-full ${picture ? 'bg-white bg-opacity-75' : null}`}>
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
        {/* {saving ? <div className="relative"><div className="absolute right-0 top-0 text-xs font-semibold py-1 px-2 uppercase rounded text-gray-600 bg-gray-200">
                    Saving...
                  </div></div> : <div></div>} */}
        <div className='grid grid-cols-6 sm:grid-cols-5 lg:grid-cols-4'>
          <div className='col-span-4 sm:col-span-3 lg:col-span-2'>
            <div className="self-center flex flex-row align-center">
              <div className="flex flex-col justify-center mr-5 align-center">
                <div className="flex justify-center">
                  <IconPickerItem
                    className=""
                    icon={habit_icon}
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
              {/* <img className="mb-6 m-auto w-1/2" src="img/example_habit.png" /> */}
              <div className="text-left w-2/3 pr-5 self-center">
                <div className='flex gap-2 flex-row items-center mb-1'>
                  <h2 className="text-lg sm:text-xl font-bold leading-snug text-black truncate">
                    {habit_title}
                  </h2>
                  <div className='text-black fas fa-info-circle cursor-pointer ' onClick={() => setShowDailyQuestDetail(true)} />
                </div>
                {habit_type == 'Picture' ? (
                  <div>
                    <p className="text-sm sm:text-md mb-2 text-black">
                      Take A Picture!
                    </p>

                  </div>
                ) : null}
                {habit_type == 'Checkbox' ? (
                  <div>
                    <p className="text-sm sm:text-md mb-2  text-black">
                      {habit_progress_statement(streak_duration)}
                    </p>

                  </div>
                ) : null}
                {habit_type == 'Feeling' ? (
                  <div>
                    <p className="text-sm sm:text-md mb-2 text-black">
                      How are you feeling?
                    </p>

                  </div>
                ) : null}
                {habit_type == 'Note' ? (
                  <div className="flex flex-col">

                    <p className="text-sm sm:text-md mb-1 text-black">
                      Leave a note!
                    </p>
                  </div>
                ) : null}
                {habit_type == 'Counter' ? (
                  <div className="">
                    <p className="text-sm sm:text-md mb-1 text-black">
                      How many times?
                    </p>

                  </div>
                ) : null}
                {habit_type == 'Location' ? (
                  <div className="flex flex-col">
                    <p className="text-sm sm:text-md mb-1 text-black">
                      Where was it?
                    </p>
                  </div>
                ) : null}
                {habit_type == 'Duration' ? (
                  <div className="flex flex-col">

                    <p className="text-sm sm:text-md mb-1 text-black">
                      How long was it?
                    </p>
                  </div>
                ) : null}
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
          <div className='col-span-2'>
            <div className='grid grid-cols-2 justify-items-center items-center place-self-center self-center h-full'>
              {yesterdayHabit ?
                <HabitInteraction
                  date={moment().startOf('day').subtract(1, "days").format('yyyy-MM-DD')}
                  habitState={yesterdayHabit.length > 0 ? true : false}
                  setHabitCompletedToday={setHabitCompletedToday}
                  insertedD={yesterdayHabit[0]?.details ? yesterdayHabit[0].details : null}
                  habit_id={habit_id}
                  habit_type={habit_type}
                  setPicture={setPicture}
                  handleHabitCompletionStatusChange={handleHabitCompletionStatusChange}
                  saving={saving}
                />
                :
                <span className="text-sm font-semibold text-black">...</span>
              }
              {todayHabit ?
                <HabitInteraction
                  date={moment().startOf('day').format('yyyy-MM-DD')}
                  habitState={todayHabit.length > 0 ? true : false}
                  setHabitCompletedToday={setHabitCompletedToday}
                  insertedD={todayHabit[0]?.details ? todayHabit[0].details : null}
                  habit_id={habit_id}
                  habit_type={habit_type}
                  setPicture={setPicture}
                  handleHabitCompletionStatusChange={handleHabitCompletionStatusChange}
                  saving={saving}
                  day={'today'}
                />
                :
                <span className="text-sm font-semibold text-black">...</span>
              }
              {/* <HabitInteraction
                habitCompleted={habitCompletedToday}
                details={details}
                habit_id={habit_id}
                habit_type={habit_type}
                setPicture={setPicture}
                setDetails={setDetails}
                handleHabitCompletionStatusChange={handleHabitCompletionStatusChange}
                timeDenominator={timeDenominator}
                getTimeInHours={getTimeInHours}
                getTimeInMinutes={getTimeInMinutes}
                convertTime={convertTime}
                saving={saving}
              /> */}


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
          habit_title={habit_title}
        />
      </>
    ) : null}
  </>
  );
}
