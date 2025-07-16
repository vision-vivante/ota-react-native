import React, {createContext, useEffect, useState} from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import duration from 'dayjs/plugin/duration';
import {useSelector} from 'react-redux';
dayjs.extend(isSameOrBefore);
dayjs.extend(duration);
export const RoomContext = createContext();

export const RoomProvider = ({children}) => {
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCheckoutToast, setShowCheckoutToast] = useState(false);
  const [ratePlanId, setRatePlanId] = useState('');
  const [hotelStayStartDate, setHotelStayStartDate] = useState(null);
  const [hotelStayEndDate, setHotelStayEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [pluaralChild, setChildren] = useState(0);
  const [pets, setPets] = useState(0);
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [destination, setDestination] = useState('');
  const [selectedCityIndex, setSelectedCityIndex] = useState();
  const [showFlatList, setShowFlatList] = useState(false);
  const roomState = useSelector(state => state?.rooms);
  useEffect(() => {
    if (roomState?.rooms?.length > 0 && !selectedRoomId) {
      console.log('inside', roomState);
      const firstRoom = roomState?.rooms[0];
      setSelectedRoomId(firstRoom.RatePlanID);
      setRatePlanId(firstRoom.RatePlanID);
      setShowCheckoutToast(true);
    }
  }, [roomState?.rooms, selectedRoomId]);
  useEffect(() => {
    if (selectedRoomId) {
      const room = roomState?.rooms?.find(r => r.RatePlanID === selectedRoomId);
      if (room) {
        setSelectedRoom(room);
        console.log('Synced selectedRoom:', room);
      } else {
        setSelectedRoom(null);
        console.log('No room found for selectedRoomId:', selectedRoomId);
      }
    } else {
      setSelectedRoom(null);
    }
  }, [selectedRoomId, roomState?.rooms]);

  return (
    <RoomContext.Provider
      value={{
        selectedRoom,
        setSelectedRoom,
        selectedRoomId,
        setSelectedRoomId,
        showCheckoutToast,
        setShowCheckoutToast,
        ratePlanId,
        setRatePlanId,
        hotelStayStartDate,
        setHotelStayStartDate,
        hotelStayEndDate,
        setHotelStayEndDate,
        showDatePicker,
        setShowDatePicker,
        guests,
        setGuests,
        rooms,
        setRooms,
        adults,
        setAdults,
        pluaralChild,
        setChildren,
        pets,
        setPets,
        showGuestsModal,
        setShowGuestsModal,
        destination,
        setDestination,
        selectedCityIndex,
        setSelectedCityIndex,
        showFlatList,
        setShowFlatList,
      }}>
      {children}
    </RoomContext.Provider>
  );
};
