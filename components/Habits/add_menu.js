import Button from "../ui/Button";
import { useState, createRef, useEffect } from 'react';

import { createPopper } from '@popperjs/core';


export default function AddMenu({ habitTypes, insertNewHabit, group_name, group_id }) {
    const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
    const btnDropdownRef = createRef();
    const popoverDropdownRef = createRef();
    const openDropdownPopover = () => {
        createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
            placement: 'bottom-end'
        });
        setDropdownPopoverShow(true);
    };
    const closeDropdownPopover = () => {
        setDropdownPopoverShow(false);
    };

    return (
        <>
            <div className="relative w-auto pl-4 flex-initial">
                <Button
                    ref={btnDropdownRef}
                    onClick={() => {
                        dropdownPopoverShow
                            ? closeDropdownPopover()
                            : openDropdownPopover();
                    }}
                    className='m-auto' variant='prominent'>Add New Quest</Button>
                <div
                    ref={popoverDropdownRef}
                    className={
                        (dropdownPopoverShow ? 'block ' : 'hidden ') +
                        'bg-blueGray-900 text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1 w-36 '
                    }
                >
                    {habitTypes.map((e) =>
                        <>
                            <div
                                onClick={()=>(insertNewHabit(e.name, e.id, group_name, group_id), closeDropdownPopover())} 
                                className="flex flex-row gap-3 items-center content-center cursor-pointer text-sm py-2 px-4 font-semibold w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600">
                                <div className={`${e.icon}`}/>{e.name}
                            </div>
                        </>
                    )}

                </div>
            </div >
        </>
    );
}