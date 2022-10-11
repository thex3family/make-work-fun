import React from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { createPopper } from '@popperjs/core';
import { useEffect, useState, createRef } from 'react';
import { Tooltip, Slider, Drawer, Card, Text, Group, useMantineTheme, NumberInput, Modal, Select, TextInput, Textarea, Skeleton } from '@mantine/core';
import { supabase } from '@/utils/supabase-client';
import { fetchItemShop, fetchShopkeeper } from '../Fetch/fetchMaster';
import { map } from 'next-pwa/cache';
import Confetti from '@/components/Widgets/confetti';
import { downloadImage } from '@/utils/downloadImage';
import useSound from 'use-sound';

import { useRouter } from 'next/router';

function ItemCard({ item, activeItem, setActiveItem }) {

  const [itemImg, setItemImg] = useState(null);

  useEffect(() => {
    if (item.img_url) {
      fetchImage();
    } else {
      setItemImg('missing');
    }
  }, [item.img_url]);

  async function fetchImage() {
    setItemImg(await downloadImage(item.img_url, 'items'));
  }

  return (
    <div>
      <div className={`cursor-pointer bg-transparent flex flex-row sm:flex-col gap-4 sm:gap-0 hover:bg-gray-600 p-2 rounded ${activeItem == item ? 'bg-gray-600' : null}`}
        onClick={() => setActiveItem(item)}
      >
        <Card.Section className='w-1/3 sm:w-full relative'>
          <i className={`absolute top-1 sm:top-2 right-1 sm:right-2 p-2 rounded text-white bg-gray-700 ${item.type == 'timer' ? 'fas fa-stopwatch' : null} ${item.type == 'consumable' ? 'fas fa-pills' : null}`} />
          <div className='px-2 py-1 text-center text-md font-semibold bg-yellow-400 text-white rounded absolute bottom-2 right-2 hidden sm:inline-block'>
            {item.gold_cost} <i className='ml-2 fas fa-coins' />
          </div>
          {
            itemImg == 'missing' ?
              <img
                src={'https://media.karousell.com/media/photos/products/2018/05/05/mystery_gift_2__30_1525512267_c0a1e40b.jpg'}
                className='w-full object-cover h-24 sm:h-40 rounded'
              />
              :
              itemImg ?
                <img
                  src={itemImg}
                  className='w-full object-cover h-24 sm:h-40 rounded'
                />
                :
                <div className="w-full object-cover h-24 sm:h-40 rounded">
                  <div className="h-full w-full bg-gray-600 rounded animate-pulse" />
                </div>
          }


        </Card.Section>
        <div className='w-full p-0 sm:p-2'>
          <Text className="text-white truncate" weight={500}>{item.name}</Text>
          <Text size="sm" className="text-accents-5 truncate" style={{ lineHeight: 1.5 }}>
            {item.description}
          </Text>
          <div className='px-2 py-1 mt-2 text-center text-md font-semibold bg-yellow-400 text-white rounded w-auto sm:hidden inline-block'>
            {item.gold_cost} <i className='ml-2 fas fa-coins' />
          </div>
        </div>
      </div>
    </div>
  );
}

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
  displayMode,
  statEnergy,
  user_id,
  refreshStats,
  hideManageTitle,
  hideEnergy,
  hideItemShop,
  hideChangeName
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
  const [activeItemImgUrl, setActiveItemImgUrl] = useState(null);
  const [saveActiveItemImg, setSaveActiveItemImg] = useState(null);

  const [saveItem, setSaveItem] = useState(null);

  const [shopEdit, setShopEdit] = useState(false);
  const [ShopkeeperIntro, setShopKeeperIntro] = useState(null);
  const [ShopkeeperTagline, setShopKeeperTagline] = useState(null);
  const [shopkeeperImage, setShopkeeperImage] = useState(null);
  const [saveShopkeeperImage, setSaveShopkeeperImage] = useState(null);

  const [buyItemConfirmation, setBuyItemConfirmation] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

  const [buySFX] = useSound('/sounds/super_mario_coin.mp3');

  const router = useRouter();

  const { itemshop } = router.query;

  useEffect(() => {
    if (itemshop) setItemShopOpen(true);
  }, [itemshop]);


  useEffect(() => {
    if (itemShopOpen) fetchItems();
  }, [itemShopOpen]);

  useEffect(() => {
    if (activeItem) {
      updateActiveItem();
    } else {
      setActiveItemName(null)
      setActiveItemDesc(null)
      setActiveItemType(null)
      setActiveItemGold(null)
    }
  }, [activeItem]);

  async function updateActiveItem() {
    setActiveItemName(activeItem.name)
    setActiveItemDesc(activeItem.description)
    setActiveItemType(activeItem.type)
    setActiveItemGold(activeItem.gold_cost)
    if (activeItem.img_url) {
      setActiveItemImgUrl(await downloadImage(activeItem.img_url, 'items'))
    } else {
      setActiveItemImgUrl(null);
    }
    setShopEdit(false);
  }

  async function fetchItems() {
    fetchShopkeeper(user_id, setShopKeeperIntro, setShopKeeperTagline, setShopkeeperImage);
    setItems(await fetchItemShop(user_id));
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

  async function upsertItem(event) {
    setSaveItem(true);
    if (activeItem) {
      // if there is an image upload
      if (event) {
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        let { error: uploadError } = await supabase.storage
          .from('items')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        try {
          const { data, error } = await supabase.from('item_shop').update(
            {
              name: activeItemName,
              description: activeItemDesc,
              type: activeItemType,
              gold_cost: activeItemGold,
              img_url: filePath
            }
          ).match({ id: activeItem.id });
          if (error && status !== 406) {
            throw error;
          }
        } catch (error) {
          // alert(error.message);
          console.log(error.message);
        } finally {
          setSaveActiveItemImg(null);
        }

      } else {
        try {
          const { data, error } = await supabase.from('item_shop').update(
            {
              name: activeItemName,
              description: activeItemDesc,
              type: activeItemType,
              gold_cost: activeItemGold
            }
          ).match({ id: activeItem.id });
          if (error && status !== 406) {
            throw error;
          }
        } catch (error) {
          // alert(error.message);
          console.log(error.message);
        } finally {
        }
      }

      fetchItems();
      setItemEdit(false);
      setActiveItem(null);
      setSaveItem(false);

    } else {

      // if there is an image upload
      if (event) {
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        let { error: uploadError } = await supabase.storage
          .from('items')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }


        try {
          const { data, error } = await supabase.from('item_shop').insert(
            [{
              name: activeItemName,
              description: activeItemDesc,
              type: activeItemType,
              gold_cost: activeItemGold,
              player: user_id,
              img_url: filePath
            }]
          );
          if (error && status !== 406) {
            throw error;
          }
        } catch (error) {
          // alert(error.message);
          console.log(error.message);
        } finally {
          setSaveActiveItemImg(null);
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
        }
      }
      fetchItems();
      setItemEdit(false);
      setActiveItem(null);
      setSaveItem(false);
    }
  }

  async function saveShopInfo(event) {
    // setSaveItem(true);
    setShopEdit(false);

    // if there is an image upload
    if (event) {
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('shopkeepers')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      try {
        const { data, error } = await supabase.from('users').update(
          {
            shopkeeper_intro: ShopkeeperIntro,
            shopkeeper_tagline: ShopkeeperTagline,
            shopkeeper_url: filePath,
          }
        ).match({ id: user_id });
        if (error && status !== 406) {
          throw error;
        }
      } catch (error) {
        // alert(error.message);
        console.log(error.message);
      } finally {
        setSaveShopkeeperImage(null);
      }

    } else {

      try {
        const { data, error } = await supabase.from('users').update(
          {
            shopkeeper_intro: ShopkeeperIntro,
            shopkeeper_tagline: ShopkeeperTagline,
          }
        ).match({ id: user_id });
        if (error && status !== 406) {
          throw error;
        }
      } catch (error) {
        // alert(error.message);
        console.log(error.message);
      } finally {
      }
    }
    // setShopEdit(false);
    // setSaveItem(false);
    // setSaveShopkeeperImage(null);
  }

  async function buyItem(gold_spent) {
    setSaveItem(true);

    if (activeItem.type == 'timer') {
      var dt = new Date();
      dt.setMinutes(dt.getMinutes() + purchaseTime);
    }

    try {
      const { data, error } = await supabase.from('item_purchases').insert(
        [{
          item_id: activeItem.id,
          gold_spent: gold_spent,
          expiry_time: dt,
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
      buySFX();
      refreshStats();
      setBuyItemConfirmation(false);
      setItemShopOpen(false);
      setBuySuccess(true);
      setItemEdit(false);
      setActiveItem(null);
      setSaveItem(false);
    }
  }

  const theme = useMantineTheme();

  // async function uploadShopkeeper(event) {
  //   try {
  //     setSaveItem(true);

  //     if (!event.target.files || event.target.files.length === 0) {
  //       throw new Error('You must select an image to upload.');
  //     }

  //     const file = event.target.files[0];
  //     const fileExt = file.name.split('.').pop();
  //     const fileName = `${Math.random()}.${fileExt}`;
  //     const filePath = `${fileName}`;

  //     let { error: uploadError } = await supabase.storage
  //       .from('shopkeepers')
  //       .upload(filePath, file);

  //     if (uploadError) {
  //       throw uploadError;
  //     }

  //     // update database immediately...

  //     let { error } = await supabase
  //       .from('users')
  //       .update({
  //         shopkeeper_url: filePath,
  //         shopkeeper_intro: ShopkeeperIntro,
  //         shopkeeper_tagline: ShopkeeperTagline
  //       })
  //       .eq('id', user_id);


  //     if (error) {
  //       throw error;
  //     }

  //     // refresh shopkeeper image (and everything else)
  //     fetchShopkeeper(user_id, setShopKeeperIntro, setShopKeeperTagline, setShopkeeperImage);

  //   } catch (error) {
  //     // alert(error.message);
  //     console.log(error.message);
  //   } finally {
  //     setSaveItem(false);
  //   }
  // }

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words rounded mb-6 shadow-lg bg-primary-2">
        <div className="flex-auto p-4">
          <div className="flex flex-wrap">
            <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
              {
                !hideManageTitle ? <Tooltip
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
                  : <button
                    className="text-emerald-400 uppercase font-bold text-xs hideLinkBorder"
                  // onClick={() => {
                  //   setShowTitleModal ? setShowTitleModal(true) : null;
                  // }}
                  >
                    {statTitle ? statTitle : 'Newbie'}
                  </button>
              }
              {!hideChangeName ?
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
                </p> : <p className="font-semibold text-xl text-white-700">
                  <a className='hideLinkBorder'>
                    {statName ? statName : 'Anonymous Adventurer'}
                  </a>
                </p>}
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
          {!hideItemShop ? 
            <Tooltip
              className="mt-4 w-full text-center font-semibold border py-2 rounded hover:bg-yellow-400 hover:text-yellow-800"
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
            :  <Tooltip
            className="mt-4 w-full text-center font-semibold border py-2 rounded"
            label="Spend Your Gold!"
            withArrow
            arrowSize={3}
          >
            <div
              variant="slim"
              className="cursor-pointer "
            >
              {statGold} 💰
            </div>
          </Tooltip>}
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
          {!hideEnergy ? <><Slider
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
              : null}</> : null}

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
        onClose={() => { setItemShopOpen(false), setShopEdit(false) }}
        padding="sm:xl"
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
            <div className='grid col-span-2 grid-cols-1 h-48 sm:h-96 overflow-auto sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 pr-6 order-last sm:order-1'>
              <div className='cursor-pointer flex flex-row gap-4 sm:flex-col p-2'
                onClick={() => { setItemEdit(true), setActiveItem(null) }}
              >
                <div className="w-1/3 sm:w-full h-24 sm:h-40 bg-gray-600 rounded flex align-middle">
                  <p className="w-full m-auto text-xs sm:text-sm md:text-lg font-semibold text-center">
                    Add Item <br />+
                  </p>
                </div>
                <div className="grid grid-cols-4 h-24 sm:h-auto w-full gap-1">
                  <div className="row-start-1 col-span-3 h-6 sm:h-4 rounded-sm bg-gray-600"></div>
                  <div className="row-start-2 col-span-4 h-8 sm:h-4 rounded-sm bg-gray-600"></div>
                  <div className="row-start-3 col-span-2 h-8 sm:h-0 rounded-sm bg-gray-600"></div>
                </div>
              </div>
              {items ? items.map((item, i) =>
                <ItemCard item={item} activeItem={activeItem} setActiveItem={setActiveItem} />
              ) :
                <>
                  <div className='cursor-pointer flex flex-row gap-4 sm:flex-col p-2 animate-pulse'>
                    <div className="w-1/3 sm:w-full h-24 sm:h-40 bg-gray-600 rounded flex align-middle" />
                    <div className="grid grid-cols-4 h-24 sm:h-auto w-full gap-1">
                      <div className="row-start-1 col-span-3 h-6 sm:h-4 rounded-sm bg-gray-600"></div>
                      <div className="row-start-2 col-span-4 h-8 sm:h-4 rounded-sm bg-gray-600"></div>
                      <div className="row-start-3 col-span-2 h-8 sm:h-0 rounded-sm bg-gray-600"></div>
                    </div>
                  </div>
                  <div className='cursor-pointer flex flex-row gap-4 sm:flex-col p-2 animate-pulse'>
                    <div className="w-1/3 sm:w-full h-24 sm:h-40 bg-gray-600 rounded flex align-middle" />
                    <div className="grid grid-cols-4 h-24 sm:h-auto w-full gap-1">
                      <div className="row-start-1 col-span-3 h-6 sm:h-4 rounded-sm bg-gray-600"></div>
                      <div className="row-start-2 col-span-4 h-8 sm:h-4 rounded-sm bg-gray-600"></div>
                      <div className="row-start-3 col-span-2 h-8 sm:h-0 rounded-sm bg-gray-600"></div>
                    </div>
                  </div>
                  <div className='cursor-pointer flex flex-row gap-4 sm:flex-col p-2 animate-pulse'>
                    <div className="w-1/3 sm:w-full h-24 sm:h-40 bg-gray-600 rounded flex align-middle" />
                    <div className="grid grid-cols-4 h-24 sm:h-auto w-full gap-1">
                      <div className="row-start-1 col-span-3 h-6 sm:h-4 rounded-sm bg-gray-600"></div>
                      <div className="row-start-2 col-span-4 h-8 sm:h-4 rounded-sm bg-gray-600"></div>
                      <div className="row-start-3 col-span-2 h-8 sm:h-0 rounded-sm bg-gray-600"></div>
                    </div>
                  </div>
                  <div className='cursor-pointer flex flex-row gap-4 sm:flex-col p-2 animate-pulse'>
                    <div className="w-1/3 sm:w-full h-24 sm:h-40 bg-gray-600 rounded flex align-middle" />
                    <div className="grid grid-cols-4 h-24 sm:h-auto w-full gap-1">
                      <div className="row-start-1 col-span-3 h-6 sm:h-4 rounded-sm bg-gray-600"></div>
                      <div className="row-start-2 col-span-4 h-8 sm:h-4 rounded-sm bg-gray-600"></div>
                      <div className="row-start-3 col-span-2 h-8 sm:h-0 rounded-sm bg-gray-600"></div>
                    </div>
                  </div>
                  <div className='cursor-pointer flex flex-row gap-4 sm:flex-col p-2 animate-pulse'>
                    <div className="w-1/3 sm:w-full h-24 sm:h-40 bg-gray-600 rounded flex align-middle" />
                    <div className="grid grid-cols-4 h-24 sm:h-auto w-full gap-1">
                      <div className="row-start-1 col-span-3 h-6 sm:h-4 rounded-sm bg-gray-600"></div>
                      <div className="row-start-2 col-span-4 h-8 sm:h-4 rounded-sm bg-gray-600"></div>
                      <div className="row-start-3 col-span-2 h-8 sm:h-0 rounded-sm bg-gray-600"></div>
                    </div>
                  </div>
                </>
              }


            </div>
            <div className='flex justify-center align-middle relative order-1 sm:order-last'>
              {activeItem ?
                <div className='absolute bottom-0 w-full px-6 z-10'>
                  <div className='bg-opacity-90 rounded p-4 relative speech-bubble'>
                    <i className='fas fa-pen top-4 right-4 absolute cursor-pointer hover:text-emerald-500' onClick={() => setItemEdit(true)} />
                    <div className='font-semibold w-11/12'>{activeItem.name}</div>
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
                          {purchaseAmount ? activeItem.gold_cost * purchaseAmount : 0} <i className='ml-2 fas fa-coins' />
                        </div>
                        <Button variant="prominent" className="w-full mt-4" disabled={purchaseAmount == 0 || !purchaseAmount || activeItem.gold_cost * purchaseAmount > statGold} onClick={() => setBuyItemConfirmation(activeItem.gold_cost * purchaseAmount)}>Buy</Button>
                      </>
                      : null}
                    {activeItem.type == 'timer' ?
                      <>
                        <NumberInput
                          defaultValue={purchaseTime}
                          label="How much time do you need?"
                          description="In Minutes"
                          required
                          step={5}
                          min={0}
                          classNames={{
                            label: 'text-white text-lg mb-2'
                          }}
                          // formatter={(value) =>
                          //   !Number.isNaN(parseFloat(value)) ? value + ' min' 
                          //   : null
                          // }
                          onChange={setPurchaseTime}
                        />
                        <div className='mt-4 px-2 py-1 text-center text-lg font-semibold bg-yellow-400 text-white rounded'>
                          {purchaseTime ? activeItem.gold_cost / 5 * purchaseTime : 0} <i className='ml-2 fas fa-coins' />
                        </div>
                        <Button variant="prominent" className="w-full mt-4" disabled={purchaseTime == 0 || !purchaseTime || activeItem.gold_cost / 5 * purchaseTime > statGold} onClick={() => setBuyItemConfirmation(activeItem.gold_cost / 5 * purchaseTime)}>Buy</Button>
                      </>
                      : null}
                  </div>
                </div>
                :
                <div className='absolute bottom-0 w-full px-6 z-10'>
                  <div className='bg-opacity-90 rounded p-4 relative speech-bubble'>
                    {
                      shopEdit ?
                        <>
                          <TextInput
                            placeholder={'What are you looking for?'}
                            value={ShopkeeperIntro || ''}
                            onChange={(event) => setShopKeeperIntro(event.currentTarget.value)}
                            disabled={saveItem}
                            required
                            classNames={{
                              input: 'p-2 bg-transparent text-white font-semibold rounded text-xl'
                            }}
                          />
                          <Textarea
                            placeholder={`Buy anything you want. Add your own items if you'd like!`}
                            value={ShopkeeperTagline || ''}
                            onChange={(event) => setShopKeeperTagline(event.currentTarget.value)}
                            disabled={saveItem}
                            required
                            classNames={{
                              input: 'mt-2 p-2 bg-transparent text-white font-semibold rounded text-sm'
                            }}
                          />
                          <Button variant="prominent" className='text-base mt-3' onClick={() => saveShopInfo(saveShopkeeperImage)}
                            disabled={saveItem} >Save</Button>
                        </>
                        :
                        <>
                          <i className='fas fa-pen top-4 right-4 absolute hover:text-emerald-500 cursor-pointer' onClick={() => setShopEdit(true)} />
                          <div className='font-semibold w-11/12 text-xl'>{ShopkeeperIntro ? ShopkeeperIntro : 'What are you looking for?'}</div>
                          <div className='mt-2 text-sm'>{ShopkeeperTagline ? ShopkeeperTagline : `Buy anything you want. Add your own items if you'd like!`}</div>
                        </>
                    }

                  </div>
                </div>}

              <div >
                {shopEdit ?
                  <>
                    <label className="fas fa-image text-7xl absolute bg-dark p-4 rounded-xl opacity-80 top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" htmlFor="single">
                    </label>
                    <input
                      style={{
                        visibility: 'hidden',
                        position: 'relative',
                      }}
                      type="file"
                      id="single"
                      accept="image/*"
                      onChange={(event) => {
                        if (event.target.files && event.target.files.length > 0) {
                          setShopkeeperImage(URL.createObjectURL(event.target.files[0])), setSaveShopkeeperImage(event)
                        }
                      }
                      }
                      disabled={saveItem}
                    />
                  </>
                  : null}
                {
                  shopkeeperImage == 'missing' ?
                    <img
                      className="avatar image h-3/4 object-contain w-full sm:w-11/12 mx-auto"
                      src={`${'https://www.clipstudio.net/wp-content/uploads/2020/01/0050_016.jpg'}`}
                      alt="Avatar"
                      htmlFor="single"
                    />
                    :
                    shopkeeperImage ?
                      <img
                        className="avatar image h-3/4 object-contain w-11/12 mx-auto"
                        src={`${shopkeeperImage}`}
                        alt="Avatar"
                        htmlFor="single"
                      />
                      :
                      <div className="h-96 flex justify-center w-60 md:w-40 lg:w-60">
                        <div className="h-2/3 w-full bg-gray-600 rounded animate-pulse" />
                      </div>
                }

              </div>
            </div>
          </div>

        </div>
        <Modal
          centered
          opened={buyItemConfirmation}
          onClose={() => setBuyItemConfirmation(false)}
          classNames={{
            modal: 'text-white bg-dark hideLinkBorder',
            title: 'hidden',
            close: 'hidden',
          }}
        >
          <div class="relative rounded-lg text-left ">
            <div class="">
              <div class="sm:flex sm:items-center sm:gap-2">
                <img src={`${activeItemImgUrl ? activeItemImgUrl : 'https://media.karousell.com/media/photos/products/2018/05/05/mystery_gift_2__30_1525512267_c0a1e40b.jpg'}`} className='w-1/4 object-contain mx-auto rounded'></img>

                {/* <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">

                  <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div> */}
                <div class="text-center m-2 sm:text-left">
                  {activeItem?.type == 'consumable' ?
                    <h3 class="text-lg leading-6 font-medium text-white" id="modal-title">{activeItemName} x {purchaseAmount}</h3>
                    : null
                  }
                  {activeItem?.type == 'timer' ?
                    <h3 class="text-lg leading-6 font-medium text-white" id="modal-title">{activeItemName} x {purchaseTime} mins</h3>
                    : null
                  }
                  <div class="mt-2">
                    <p class="text-sm text-white-500">Are you sure you want to buy this item? Your gold balance will immediately be deducted by {buyItemConfirmation} <i className='ml-1 fas fa-coins' /></p>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div class="mt-4 mb-5 sm:flex sm:flex-row-reverse">
            <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => buyItem(buyItemConfirmation)}
              disabled={saveItem}
            >Buy Item</button>
            <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-dark text-base font-medium text-gray-700 hover:bg-black focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => setBuyItemConfirmation(false)}>Cancel</button>
          </div>

        </Modal>
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
          <form onSubmit={(e) => { e.preventDefault(), upsertItem(saveActiveItemImg) }}>
            <div className='relative'>
              <img src={`${activeItemImgUrl ? activeItemImgUrl : 'https://media.karousell.com/media/photos/products/2018/05/05/mystery_gift_2__30_1525512267_c0a1e40b.jpg'}`} className='w-full object-contain h-24 sm:h-40 rounded'></img>
              <label className="fas fa-image text-7xl absolute bg-dark p-4 rounded-xl opacity-80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" htmlFor="single">
              </label>
              <input
                style={{
                  visibility: 'hidden',
                  position: 'absolute',
                }}
                type="file"
                id="single"
                accept="image/*"
                onChange={(event) => setActiveItemImgUrl(URL.createObjectURL(event.target.files[0]), setSaveActiveItemImg(event))}
                disabled={saveItem}
              />
            </div>
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
              data={[{ value: 'consumable', label: 'Consumable' }
                , { value: 'timer', label: 'Timer' }
              ]}
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
              label={`Gold Cost ${activeItemType == 'timer' ? '(Every 5 mins)' : ''}`}
              classNames={{
                controlUp: 'bg-white rounded-r-none',
                controlDown: 'bg-white rounded-r-none',
                input: 'text-xl mb-4 h-12 font-semibold bg-black text-white border-accents-3',
                label: 'text-white text-lg mt-3 mb-2 font-semibold'
              }}
              onChange={setActiveItemGold}
            />
            <Button variant="prominent" className="w-full mt-4"
              disabled={saveItem || !activeItemName || !activeItemDesc || !activeItemGold || !activeItemType}>{activeItem ? "Save" : "Add"}</Button>
          </form>
        </Modal>
        {/* Drawer content */}
      </Drawer>
      {
        buySuccess ?
          <div className="confetti">
            <Confetti />
          </div>
          : null
      }
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
