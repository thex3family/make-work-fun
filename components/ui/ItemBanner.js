import { useEffect, useState } from 'react';

const calculateTimeLeft = (expiry_time) => {

    let difference = +new Date(expiry_time) - +new Date();

    let timeLeft = {};

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }

    return timeLeft;
}

const ItemBanner = ({ index, activeTimeItem, setOverrideMetaTitle }) => {

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(activeTimeItem.expiry_time));
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft(activeTimeItem.expiry_time));
        }, 1000);

        updateMetaTitle();

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval]) {
            return;
        }

        timerComponents.push(
            <span>
                {timeLeft[interval]} {interval}{" "}
            </span>
        );

    });

    async function updateMetaTitle(){
        if (timerComponents.length && index == 0) {
            setOverrideMetaTitle((timeLeft.hours ? timeLeft.hours.toString() + ':' : '') + (timeLeft.minutes ? timeLeft.minutes.toString().padStart(2, '0') : '00') + ':' + (timeLeft.seconds.toString().padStart(2, '0')) + ' - ' + activeTimeItem.item.name)
        } else {
            // setOverrideMetaTitle(null)
        }
    }

    if (show) return (
        <div class={`${timerComponents.length ? 'bg-yellow-300 text-yellow-800' : 'bg-red-600 text-white'} border-b-2 border-dark`}>
            <div class="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
                <div class="flex items-center justify-center">
                    <div class="flex items-center py-1.5">
                        {/* <i class="flex p-2 rounded-lg bg-yellow-400 text-xl fas fa-coins text-yellow-800">
                        </i> */}
                        <div class="ml-3 font-medium flex flex-col sm:flex-row items-center gap-1">
                            You Purchased An Item! Finish <div className="flex flex-col sm:flex-row gap-1 items-center"><div className="bg-dark bg-opacity-80 px-2 py-1 text-white rounded">{activeTimeItem.item.name}</div> In <div className="bg-dark bg-opacity-80 px-2 py-1 text-white rounded">{timerComponents.length ? timerComponents : <span>0 seconds</span>}</div></div>
                        </div>
                    </div>
                    <i className='ml-4 p-2 rounded text-sm fas fa-check text-white bg-emerald-600 hover:bg-dark cursor-pointer' onClick={() => setShow(false)} />
                </div>
            </div>
        </div>
    );

    return null;
}


export default ItemBanner;