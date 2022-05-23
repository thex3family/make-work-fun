import React from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { createPopper } from '@popperjs/core';
import { useEffect, useState, createRef } from 'react';
import { Tooltip, Slider, Drawer, Card, Text, Group, useMantineTheme, NumberInput, Modal, Select, TextInput } from '@mantine/core';
import { supabase } from '@/utils/supabase-client';
import { fetchItemShop } from '../Fetch/fetchMaster';
import { map } from 'next-pwa/cache';
import Input from '@/components/ui/Input';

export default function CardStats({
  statTitle,
  statName,
  statLevel,
  statMaxLevel,
  statEXP,
  statEXPProgress,
  statLevelEXP,
  statEXPPercent,
  statGold,
  statArrow,
  statPercent,
  statPercentColor,
  statDescription,
  statIconName,
  statIconColor,
  setShowTitleModal,
  statPlayer,
  displayMode,
  statEnergy,
  user_id
}) {
  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
  const btnDropdownRef = createRef();
  const popoverDropdownRef = createRef();
  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: 'bottom-start'
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  // Slider
  const [energyValue, setEnergyValue] = useState(statEnergy);
  const [initialEnergyValue, setInitialEnergyValue] = useState(statEnergy);
  const [saveEnergy, setSaveEnergy] = useState(null);

  const [itemShopOpen, setItemShopOpen] = useState(false);
  const [items, setItems] = useState(null);


  const [activeItem, setActiveItem] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState(1);
  const [purchaseTime, setPurchaseTime] = useState(5);
  const [itemEdit, setItemEdit] = useState(false);

  const [activeItemName, setActiveItemName] = useState(null);
  const [activeItemType, setActiveItemType] = useState(null);
  const [activeItemGold, setActiveItemGold] = useState(null);
  const [activeItemDesc, setActiveItemDesc] = useState(null);

  const [saveItem, setSaveItem] = useState(null);


  useEffect(() => {
    if (itemShopOpen) fetchItems();
  }, [itemShopOpen]);

  useEffect(() => {
    if (activeItem) {
      setActiveItemName(activeItem.name)
      setActiveItemDesc(activeItem.description)
      setActiveItemType(activeItem.type)
      setActiveItemGold(activeItem.gold_cost)
    } else {
      setActiveItemName(null)
      setActiveItemDesc(null)
      setActiveItemType(null)
      setActiveItemGold(null)
    }
  }, [activeItem]);

  async function fetchItems() {
    setItems(await fetchItemShop(user_id));
    console.log(user_id)
  }

  // handle energy update
  async function updateEnergy(energy) {
    setSaveEnergy(true);
    try {
      const { data, error } = await supabase.from('energy').insert([
        {
          player: user_id,
          energy_level: energy
        }
      ]);
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message);
      console.log(error.message);
    } finally {
      setInitialEnergyValue(energy)
      setSaveEnergy(false);
    }
  }

  async function upsertItem() {
    setSaveItem(true);
    if (activeItem) {
      try {
        const { data, error } = await supabase.from('item_shop').update(
          {
            name: activeItemName,
            description: activeItemDesc,
            type: activeItemType,
            gold_cost: activeItemGold,
          }
        ).match({ id: activeItem.id });
        if (error && status !== 406) {
          throw error;
        }
      } catch (error) {
        // alert(error.message);
        console.log(error.message);
      } finally {
        fetchItems();
        setItemEdit(false);
        setActiveItem(null);
        setSaveItem(false);
      }
    } else {
      try {
        const { data, error } = await supabase.from('item_shop').insert(
          [{
            name: activeItemName,
            description: activeItemDesc,
            type: activeItemType,
            gold_cost: activeItemGold,
            player: user_id
          }]
        );
        if (error && status !== 406) {
          throw error;
        }
      } catch (error) {
        // alert(error.message);
        console.log(error.message);
      } finally {
        fetchItems();
        setItemEdit(false);
        setActiveItem(null);
        setSaveItem(false);
      }
    }
  }

  const theme = useMantineTheme();

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words rounded mb-6 shadow-lg bg-primary-2">
        <div className="flex-auto p-4">
          <div className="flex flex-wrap">
            <div className="relative w-full pr-4 max-w-full flex-grow flex-1">

              <Tooltip
                placement="start"
                label="Click me to update your title!"
                withArrow
                arrowSize={3}
              >
                <button
                  className="text-emerald-400 uppercase font-bold text-xs hideLinkBorder"
                  onClick={() => {
                    setShowTitleModal ? setShowTitleModal(true) : null;
                  }}
                >
                  {statTitle ? statTitle : 'Newbie'}
                </button>
              </Tooltip>
              <p className="font-semibold text-xl text-white-700 cursor-pointer">
                <Tooltip
                  placement="start"
                  label="Click me to change your name!"
                  withArrow
                  arrowSize={3}
                >
                  <Link href="/account?tab=profile" >
                    <a className='hideLinkBorder'>
                      {statName ? statName : 'Anonymous Adventurer'}
                    </a>
                  </Link>
                </Tooltip>
              </p>
              <span className="font-semibold text-l text-white-700">
                Level {statLevel}
              </span>
              <span className="font-semibold text-l text-blueGray-700">
                &nbsp;/ {statMaxLevel}
              </span>
            </div>
            {displayMode !== 'demo' ?
              <div className="relative w-auto pl-4 flex-initial">
                <button
                  ref={btnDropdownRef}
                  onClick={() => {
                    dropdownPopoverShow
                      ? closeDropdownPopover()
                      : openDropdownPopover();
                  }}
                  className={
                    'cursor-pointer text-white p-3 text-center inline-flex items-center justify-center w-10 h-10 border shadow-lg rounded-full ' +
                    statIconColor
                  }
                >
                  <i className={statIconName}></i>
                </button>

                <div
                  ref={popoverDropdownRef}
                  className={
                    (dropdownPopoverShow ? 'block ' : 'hidden ') +
                    'bg-blueGray-900 text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1 w-36 '
                  }
                >
                  <Link href="/embed" target="_blank">
                    <a
                      target="_blank"
                      className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                    >
                      Get Embed
                    </a>
                  </Link>
                  <Link href="/account?tab=profile" target="_blank">
                    <a
                      target="_blank"
                      className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                    >
                      Edit Profile
                    </a>
                  </Link>
                  <Link href="/account?tab=connect" target="_blank">
                    <a
                      target="_blank"
                      className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                    >
                      Connect Apps
                    </a>
                  </Link>
                </div>
              </div> : null}
          </div>
          <div className="font-semibold text-sm text-right -mt-3">
            {statEXP} / {statLevelEXP - statEXPProgress + statEXP} XP
          </div>
          <div className="flex flex-wrap">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <div className="flex items-center">
                <span className="mr-2 text-emerald-500 ">
                  {statEXPPercent}%
                </span>
                <div className="relative w-full">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-emerald-200">
                    <div
                      style={{ width: `${statEXPPercent}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
                    ></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div className="flex flex-row flex-nowrap items-center gap-4">

            <Tooltip
              className="mt-4 w-full text-center font-semibold border py-2 rounded hover:bg-yellow-400"
              label="Spend Your Gold!"
              withArrow
              arrowSize={3}
            >
              <div
                onClick={() => setItemShopOpen(true)}
                variant="slim"
                className="cursor-pointer "
              >
                {statGold} 💰
              </div>
            </Tooltip>
            <Tooltip
              className="mt-4 w-full text-center font-semibold border py-2 rounded"
              label="Life Points Coming Soon!"
              withArrow
              arrowSize={3}
            >
              <div
                variant="slim"
              >
                0 💖
              </div>
            </Tooltip>
            {/* <Button disabled={true} variant="slim" className="mt-4 w-full sm:w-3/5">
              <span className={statPercentColor + " mr-2"}>
                <i
                  className={
                    statArrow === "up"
                      ? "fas fa-arrow-up"
                      : statArrow === "down"
                      ? "fas fa-arrow-down"
                      : ""
                  }
                ></i>{" "}
                {statPercent}%
              </span>
              <span className="whitespace-nowrap">{statDescription}</span>
            </Button> */}
          </div>
          <Slider
            value={energyValue} onChange={setEnergyValue}
            className='hideLinkBorder my-5'
            color="yellow"
            size="md"
            radius="md"
            showLabelOnHover={true}
            step={25}
            label={(value) => `Energy: ${value}`}
            marks={[
              { value: 0, label: '☠️' },
              { value: 25, label: '25%' },
              { value: 50, label: '50%' },
              { value: 75, label: '75%' },
              { value: 100, label: '💛' },
            ]}
          />
          {(initialEnergyValue !== energyValue) && displayMode != 'demo' ?

            <div className='flex justify-end mt-8'>
              {!saveEnergy ?
                <button className='hideLinkBorder text-yellow-500 background-transparent font-bold uppercase text-xs ease-linear transition-all duration-150'
                  onClick={() => updateEnergy(energyValue)}>Update Energy</button>
                : <div className='hideLinkBorder text-yellow-500 background-transparent font-bold uppercase text-xs ease-linear transition-all duration-150'>Saving...</div>}
            </div>
            : null}
        </div>
      </div>
      <Drawer
        classNames={{
          root: '',
          overlay: 'your-overlay-class',
          noOverlay: 'your-noOverlay-class',
          drawer: 'bg-fixed bg-cover bg-center overflow-auto hideLinkBorder',
          header: 'p-3 rounded',
          title: 'text-white text-2xl font-bold',
          close: 'text-white hover:bg-gray-800',
        }}
        styles={{ drawer: { backgroundImage: `url(/background/item-shop.jpg)` } }}
        opened={itemShopOpen}
        onClose={() => setItemShopOpen(false)}
        padding="xl"
        size="96"
        position="bottom"
      >
        <div className='max-w-6xl flex flex-col justify-center rounded m-auto bg-dark bg-opacity-90 p-6 relative'>
          <div className='text-white mb-4 flex align-middle justify-between'>
            <h1 className='text-2xl font-bold'>Item Shop 🛒</h1>
            <Tooltip
              className="p-4 text-center font-semibold border py-2 rounded"
              label="Your current gold balance."
              withArrow
              arrowSize={3}
              placement={'end'}
            >
              <div
                onClick={() => setItemShopOpen(true)}
                variant="slim"
                className="cursor-pointer"
              >
                {statGold} 💰
              </div>
            </Tooltip>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-3 text-white grid-col-gap h-auto'>
            <div className='grid col-span-2 grid-cols-1 h-96 overflow-auto sm:grid-cols-3 gap-8 pr-6'>
              <div className='cursor-pointer'
                onClick={() => { setItemEdit(true), setActiveItem(null) }}
              >
                <div style={{ height: 160 }} className="w-full h-full bg-gray-600 rounded flex algin-middle p-4">
                  <div className="w-full m-auto text-xl font-semibold text-center">
                    Add Item +
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1 mt-4">
                  <div className="row-start-1 col-span-2 h-4 rounded-sm bg-gray-600 mb-2"></div>
                  <div className="row-start-2 col-span-3 h-4 rounded-sm bg-gray-600"></div>
                </div>
              </div>
              {items ? items.map((item, i) =>
                <div className={`hover:bg-gray-600 p-2 rounded ${activeItem == item ? 'bg-gray-600' : null}`}>
                  <Card className='cursor-pointer bg-transparent'
                    onClick={() => setActiveItem(item)}
                  >
                    <Card.Section>
                      <div className='relative'>
                        <i className={`absolute top-2 right-2 text-white ${item.type == 'time' ? 'fas fa-stopwatch' : null} ${item.type == 'consumable' ? 'fas fa-pills' : null}`} />
                        <div className='px-2 py-1 text-center text-md font-semibold bg-yellow-400 text-white rounded absolute bottom-2 right-2'>
                          {item.gold_cost} <i className='ml-2 fas fa-coins' />
                        </div>
                        <img src="https://media.karousell.com/media/photos/products/2018/05/05/mystery_gift_2__30_1525512267_c0a1e40b.jpg" style={{ height: 160 }} alt="Twitter" className='w-full object-cover'></img>
                      </div>
                    </Card.Section>

                    <Group position="apart" style={{ marginBottom: 5, marginTop: theme.spacing.sm }}>
                      <Text className="text-white truncate" weight={500}>{item.name}</Text>
                    </Group>

                    <Text size="sm" className="text-accents-5 truncate" style={{ lineHeight: 1.5 }}>
                      {item.description}
                    </Text>
                    {/* 
                  <Button variant="prominent" fullWidth style={{ marginTop: 14 }} className="w-full">
                    Buy Now
                  </Button> */}
                  </Card>
                </div>) : null
              }


            </div>
            <div className='flex justify-center align-middle relative'>
              {activeItem ?
                <div className='absolute bottom-0 w-full px-6'>
                  <div className='bg-opacity-90 rounded p-4 relative speech-bubble'>
                    <i className='fas fa-pen top-4 right-4 absolute cursor-pointer hover:text-emerald-500' onClick={() => setItemEdit(true)} />
                    <div className='font-semibold'>{activeItem.name}</div>
                    {activeItem.type == 'consumable' ?
                      <>
                        <NumberInput
                          defaultValue={purchaseAmount}
                          label="How many do you want?"
                          required
                          min={0}
                          classNames={{
                            label: 'text-white text-lg mb-2'
                          }}
                          onChange={setPurchaseAmount}
                        />
                        <div className='mt-4 px-2 py-1 text-center text-lg font-semibold bg-yellow-400 text-white rounded'>
                          {activeItem.gold_cost * purchaseAmount} <i className='ml-2 fas fa-coins' />
                        </div>
                        <Button variant="prominent" className="w-full mt-4" disabled={purchaseAmount == 0}>Buy</Button>
                      </>
                      : null}
                    {activeItem.type == 'time' ?
                      <>
                        <NumberInput
                          defaultValue={purchaseTime}
                          label="How much time do you need?"
                          required
                          step={5}
                          min={0}
                          classNames={{
                            label: 'text-white text-lg mb-2'
                          }}
                          formatter={(value) =>
                            value + ' min'
                          }
                          onChange={setPurchaseTime}
                        />
                        <div className='mt-4 px-2 py-1 text-center text-lg font-semibold bg-yellow-400 text-white rounded'>
                          {activeItem.gold_cost / 5 * purchaseTime} <i className='ml-2 fas fa-coins' />
                        </div>
                        <Button variant="prominent" className="w-full mt-4" disabled={purchaseTime == 0}>Buy</Button>
                      </>
                      : null}
                  </div>
                </div>
                :
                <div className='absolute bottom-0 w-full px-6'>
                  <div className='bg-opacity-90 rounded p-4 relative speech-bubble'>
                    <i className='fas fa-pen top-4 right-4 absolute hover:text-emerald-500 cursor-pointer' />
                    <div className='font-semibold'>What do you want?</div>
                    <div className='mt-2 text-md'>Buy anything you want from the shop. Add your own if you'd like!</div>
                  </div>
                </div>}
              <img
                className="avatar image h-3/4"
                src="https://www.clipstudio.net/wp-content/uploads/2020/01/0050_016.jpg"
                alt="Avatar"
              />
            </div>
          </div>
        </div>
        <Modal
          centered
          opened={itemEdit}
          onClose={() => setItemEdit(false)}
          title={activeItem ? "Edit Item" : "Add Item"}
          classNames={{
            modal: 'text-white bg-dark hideLinkBorder',
            title: 'text-xl font-semibold',
            close: 'text-white hover:bg-gray-800',
          }}
        >
          <form onSubmit={(e) => {e.preventDefault(), upsertItem()}}>
            <TextInput
              className="text-xl mb-2 font-semibold rounded"
              placeholder="Your item name here..."
              value={activeItemName || ''}
              onChange={(event) => setActiveItemName(event.currentTarget.value)}
              disabled={saveItem}
              required
              label="Name"
              classNames={{
                input: 'border-accents-3 bg-black text-white text-xl font-semibold rounded h-12',
                label: 'text-white text-lg mt-3 mb-2 font-semibold'
              }}
            />
            <TextInput
              className="text-xl mb-2 font-semibold rounded"
              type="varchar"
              placeholder="Short description here..."
              value={activeItemDesc || ''}
              onChange={(event) => setActiveItemDesc(event.currentTarget.value)}
              disabled={saveItem}
              required
              label="Description"
              classNames={{
                input: 'border-accents-3 bg-black text-white text-xl font-semibold rounded h-12',
                label: 'text-white text-lg mt-3 mb-2 font-semibold'
              }}
            />
            <Select
              value={activeItemType}
              onChange={setActiveItemType || ''}
              disabled={saveItem}
              data={[{ value: 'consumable', label: 'Consumable' }, { value: 'time', label: 'Time' }]}
              required
              label="Type"
              classNames={{
                dropdown: 'bg-black',
                item: 'text-white text-xl font-semibold',
                hovered: 'bg-gray-800',
                selected: 'bg-gray-800',
                input: 'border-accents-3 bg-black text-white text-xl font-semibold rounded h-12 mb-2',
                label: 'text-white text-lg mt-3 mb-2 font-semibold'
              }}
            />
            <NumberInput
              defaultValue={activeItemGold}
              step={5}
              min={0}
              disabled={saveItem}
              required
              label="Gold Cost"
              classNames={{
                controlUp: 'bg-white rounded-r-none',
                controlDown: 'bg-white rounded-r-none',
                input: 'text-xl mb-4 h-12 font-semibold bg-black text-white border-accents-3',
                label: 'text-white text-lg mt-3 mb-2 font-semibold'
              }}
              onChange={setActiveItemGold}
            />
            <Button variant="prominent" className="w-full mt-4"
              disabled={saveItem || !activeItemName || !activeItemDesc || !activeItemGold || !activeItemType }>{activeItem ? "Save" : "Add"}</Button>
          </form>
        </Modal>
        {/* Drawer content */}
      </Drawer>
    </>
  );
}

CardStats.defaultProps = {
  statTitle: 'Newbie',
  statName: 'No Name!',
  statLevel: '0',
  statMaxLevel: '100',
  statEXP: '0',
  statEXPToLevel: '100',
  statGold: '0',
  statArrow: 'up',
  statEXPPercent: '0',
  statPercent: 'Some',
  statPercentColor: 'text-emerald-500',
  statDescription: 'Since last month',
  statIconName: 'far fa-exclamation',
  statIconColor: 'bg-red-500'
};

CardStats.propTypes = {
  statTitle: PropTypes.string,
  statMaxLevel: PropTypes.number,
  statLevelEXP: PropTypes.number,
  statArrow: PropTypes.oneOf(['up', 'down']),
  statEXPPercent: PropTypes.number,
  statPercent: PropTypes.string,
  // can be any of the text color utilities
  // from tailwindcss
  statPercentColor: PropTypes.string,
  statDescription: PropTypes.string,
  statIconName: PropTypes.string,
  // can be any of the background color utilities
  // from tailwindcss
  statIconColor: PropTypes.string
};
