import { IconPickerItem } from 'react-fa-icon-picker';
import moment from 'moment';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase-client';
import Input from '@/components/ui/Input';
import ModalDQDetail from '../Modals/ModalDQDetail';
import { downloadImage } from '@/utils/downloadImage';

export default function HabitSquare({
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
  player, setHabits, setLevelUp, setDailiesCount
}) {
  const [saving, setSaving] = useState(false);
  const [habitCompletedToday, setHabitCompletedToday] = useState(false);
  const [details, setDetails] = useState(null);
  const [timeDenominator, setTimeDenominator] = useState('MINS');

  const [showDailyQuestDetail, setShowDailyQuestDetail] = useState(false);

  const [picture, setPicture] = useState(false);

  useEffect(() => {
    if (streak_end) wasHabitCompletedToday(streak_end);
  }, [streak_end]);


  useEffect(() => {
    if (habit_type == "Picture") loadDailiesPicture(habit_detail);
  }, [habit_type]);

  async function loadDailiesPicture(url) {
    setPicture(await downloadImage(url, 'dailies'))
  }


  function wasHabitCompletedToday(streak_end) {
    const habitCompletedToday =
      moment(streak_end).format('yyyy-MM-DD') == moment().startOf('day').format('yyyy-MM-DD');
    setHabitCompletedToday(habitCompletedToday);

    if (habitCompletedToday) {
      // make sure the habit counter only adds if the habitcompleted today is tue
      setHabitCounter((v) => [...v, 'Complete']);
      // hacky way of not showing the previous time's habit_detail. 
      setDetails(habit_detail);
    }
  }

  function habit_progress_statement(streak_duration) {
    return (streak_duration != 0) & (streak_duration != null)
      ? '' +
      (streak_duration > 9 ? '9+ ' : streak_duration + ' day ') +
      'streak! 🔥'
      : 'You got this! ✊';
  }

  async function toggleHabitStatus(habit_id, type, inputDetails) {
    setSaving(true);
    try {
      // See if the habit has been completed today
      const { data, error } = await supabase
        .from('completed_habits')
        .select('*')
        .eq('player', player)
        .eq('habit', habit_id)
        .gte('closing_date', moment().startOf('day').utc().format());

      if (error && status !== 406) {
        throw error;
      }

      //console.log('toggleHabitStatus - data - ', data);

      const fetchData = data;

      if (fetchData.length == 0) {
        // if not completed, post to database (i.e. fetchData is an empty array)

        let testDateStr = new Date();
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

          setHabitCompletedToday(false);
          setHabitCounter((v) => v.splice(0, v.length - 1));

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

  async function handleHabitCompletionStatusChange(habit_id, type, inputDetails) {
    if (displayMode == 'demo') {
      setDetails(inputDetails);
      setHabitCompletedToday(inputDetails ? true : !habitCompletedToday)
      console.log('Demo Pressed')
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

          toggleHabitStatus(habit_id, type, filePath).then(() => {
            fetchDailies(player, setHabits, setLevelUp, setDailiesCount, 'click');
          });

        } catch (error) {
          // alert(error.message);
          console.log(error.message);
        } finally {
        }

      } else {
        setDetails(inputDetails);
        //console.log('handleHabitCompletionStatusChange');
        toggleHabitStatus(habit_id, type, inputDetails).then(() => {
          fetchDailies(player, setHabits, setLevelUp, setDailiesCount, 'click');
        });
      }
    }
  }

  function getTimeInMinutes(time) {
    setTimeDenominator('MINS');
    return time * 60;
  }

  function getTimeInHours(time) {
    setTimeDenominator('HRS');
    return time / 60;
  }

  function convertTime(denomination, time) {
    if (denomination == 'HRS') {
      setDetails(getTimeInHours(time));
    } else if (denomination == 'MINS') {
      setDetails(getTimeInMinutes(time));
    }
  }

  const fileRef = useRef();

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
      className={`animate-fade-in-down w-full my-4 mb-0 sm:mb-8 sm:w-64 relative bg-cover bg-center object-cover ${habitCompletedToday
        ? details == 'meh'
          ? `bg-yellow-500 border-yellow-700`
          : details == 'unhappy'
            ? `bg-red-500 border-red-700`
            : `bg-emerald-500 border-emerald-700`
        : `bg-dailies-light border-dailies-dark`
        } rounded z-10 square shadow-lg border-4 ${habit_type == 'Checkbox' ? null : null
        }`}
      style={{
        backgroundImage: `url(${picture})`
      }}
    >
      <div className={`p-4 sm:p-6 h-full ${picture ? 'bg-white bg-opacity-75' : null}`}>
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
        <div className="self-center flex flex-row sm:flex-none sm:flex-col">
          <div className="flex flex-col justify-center sm:mb-4 m-auto w-1/3 sm:w-full mr-3 sm:mr-0">
            <div className="flex justify-center">
              <IconPickerItem
                className=""
                icon={habit_icon}
                size={45}
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
          <div className="flex-col text-left sm:text-center w-2/3 sm:w-full">
            <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-3 leading-snug text-black">
              {habit_title}<span className='z-50 ml-2 fas fa-info-circle cursor-pointer' onClick={() => setShowDailyQuestDetail(true)} />
            </h2>
            {habit_type == 'Picture' ? (
              <div>
                <p className="text-sm sm:text-md mb-2 sm:mb-2 text-black">
                  Take A Picture!
                </p>
                <div className="relative mb-4">
                  <button className="fas fa-camera text-2xl sm:text-3xl self-center font-semibold text-black cursor-pointer hideLinkBorder" htmlFor="single"
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
                          , handleHabitCompletionStatusChange(habit_id, 'Picture', event)
                      }
                    }
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            ) : null}
            {habit_type == 'Checkbox' ? (
              <div>
                <p className="text-sm sm:text-md mb-2 sm:mb-2 text-black">
                  {habit_progress_statement(streak_duration)}
                </p>
                <div className="flex justify-start sm:justify-center">
                  <button className="fas fa-check text-2xl sm:text-3xl self-center font-semibold text-black"
                    disabled={saving}
                    onClick={() => handleHabitCompletionStatusChange(habit_id)} />
                </div>
              </div>
            ) : null}
            {habit_type == 'Feeling' ? (
              <div>
                <p className="text-sm sm:text-md mb-2 text-black">
                  How are you feeling?
                </p>
                <div className="flex-row flex gap-2 justify-start sm:justify-center mb-4">
                  <button
                    className={`text-4xl text-black far fa-smile ${habitCompletedToday
                      ? details == 'happy'
                        ? `opacity-100`
                        : `opacity-10 hover:opacity-100`
                      : `hover:text-emerald-500`
                      }`}
                    onClick={() =>
                      handleHabitCompletionStatusChange(
                        habit_id,
                        'Feeling',
                        `${details == 'happy' ? '' : 'happy'}`
                      )
                    }
                    disabled={saving}
                  />
                  <button
                    className={`text-4xl text-black far fa-meh ${habitCompletedToday
                      ? details == 'meh'
                        ? `opacity-100`
                        : `opacity-10 hover:opacity-100`
                      : `hover:text-yellow-500`
                      }`}
                    onClick={() =>
                      handleHabitCompletionStatusChange(
                        habit_id,
                        'Feeling',
                        `${details == 'meh' ? '' : 'meh'}`
                      )
                    }
                    disabled={saving}
                  />
                  <button
                    className={`text-4xl text-black far fa-frown ${habitCompletedToday
                      ? details == 'unhappy'
                        ? `opacity-100`
                        : `opacity-10 hover:opacity-100`
                      : `hover:text-red-500`
                      }`}
                    onClick={() =>
                      handleHabitCompletionStatusChange(
                        habit_id,
                        'Feeling',
                        `${details == 'unhappy' ? '' : 'unhappy'}`
                      )
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            ) : null}
            {habit_type == 'Note' ? (
              <div className="flex flex-col">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleHabitCompletionStatusChange(habit_id, 'Note', details)
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
                    className="font-semibold text-sm text-black self-start sm:self-center"
                    variant="slim"
                    disabled={saving}

                  >
                    {habitCompletedToday ? 'Update' : 'Save'}
                  </button>
                </form>
              </div>
            ) : null}
            {habit_type == 'Counter' ? (
              <div className="">
                <p className="text-sm sm:text-md mb-1 sm:mb-2 text-black">
                  How many times?
                </p>
                <div className="flex-row flex gap-2 justify-start sm:justify-center mb-4">
                  <button
                    className={`text-4xl opacity-10 text-black far fa-minus-square ${details > 0 ? `hover:opacity-100` : ``
                      }`}
                    disabled={details > 0 ? false : true}
                    onClick={() =>
                      handleHabitCompletionStatusChange(
                        habit_id,
                        'countdown',
                        Number(details) - 1
                      )
                    }
                    disabled={saving}
                  />
                  <div className="text-3xl mb-0.5 px-2 self-center font-semibold text-black">
                    {details ? details : 0}
                  </div>
                  <button
                    className="text-4xl opacity-10 text-black far fa-plus-square hover:opacity-100"
                    onClick={() =>
                      handleHabitCompletionStatusChange(
                        habit_id,
                        'countup',
                        Number(details) + 1
                      )
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            ) : null}
            {habit_type == 'Location' ? (
              <div className="flex flex-col">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleHabitCompletionStatusChange(
                      habit_id,
                      'Location',
                      details
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
                    className="font-semibold text-sm text-black self-start sm:self-center"
                    variant="slim"
                    disabled={saving}
                  >
                    {habitCompletedToday ? 'Update' : 'Save'}
                  </button>
                </form>
              </div>
            ) : null}
            {habit_type == 'Duration' ? (
              <div className="flex flex-col">
                <form className="flex flex-row align-middle"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleHabitCompletionStatusChange(
                      habit_id,
                      'Duration',
                      timeDenominator === 'HRS'
                        ? getTimeInMinutes(details)
                        : details
                    )
                  }}>
                  <Input
                    className="text-xs sm:text-sm mt-0.5 sm:mt-1 mb-2 sm:mb-4 font-semibold rounded"
                    variant="dailies"
                    id="Note"
                    type="number"
                    placeholder="Add duration here!"
                    value={details || ''}
                    onChange={(v) => setDetails(v)}
                  />
                  <div className="flex flex-col">
                    <button
                      className={`font-semibold text-xs sm:text-sm text-black ml-2 text-left ${timeDenominator == 'HRS' ? `opacity-100` : `opacity-30`
                        }`}
                      variant="slim"
                      type="button"
                      disabled={timeDenominator == 'HRS'}
                      onClick={() => convertTime('HRS', details)}
                    >
                      HRS
                    </button>
                    <button
                      className={`font-semibold text-xs sm:text-sm text-black ml-2 text-left ${timeDenominator == 'MINS' ? `opacity-100` : `opacity-30`
                        }`}
                      variant="slim"
                      type="button"
                      disabled={timeDenominator == 'MINS'}
                      onClick={() => convertTime('MINS', details)}
                    >
                      MINS
                    </button>
                  </div>
                </form>
                <button
                  className="font-semibold text-sm text-black self-start sm:self-center"
                  variant="slim"
                  disabled={saving}
                >
                  {habitCompletedToday ? 'Update' : 'Save'}
                </button>
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
    </div>


    {showDailyQuestDetail ? (
      <>
        <ModalDQDetail
          setShowDailyQuestDetail={setShowDailyQuestDetail}
          habit_id={habit_id}
          habit_description={habit_description}
          fetchDailies={fetchDailies}
          player={player}
          setHabits={setHabits}
          setLevelUp={setLevelUp}
          setDailiesCount={setDailiesCount}
        />
      </>
    ) : null}
  </>
  );
}
