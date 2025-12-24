import React, {createContext, useEffect, useState} from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import duration from 'dayjs/plugin/duration';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [roomDetails, setRoomDetails] = useState();
  const [destinationInfo, setDestinationInfo] = useState(null);
  const [selectedCityIndex, setSelectedCityIndex] = useState();
  const [showFlatList, setShowFlatList] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [roomTypeId, setRoomTypeId] = useState(null);
  const roomState = useSelector(state => state?.rooms);

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [
          startDate,
          endDate,
          persistedRooms,
          persistedAdults,
          persistedChildren,
          persistedDestination,
          persistedDestinationInfo,
          persistedCityIndex,
        ] = await Promise.all([
          AsyncStorage.getItem('@roomContext:startDate'),
          AsyncStorage.getItem('@roomContext:endDate'),
          AsyncStorage.getItem('@roomContext:rooms'),
          AsyncStorage.getItem('@roomContext:adults'),
          AsyncStorage.getItem('@roomContext:children'),
          AsyncStorage.getItem('@roomContext:destination'),
          AsyncStorage.getItem('@roomContext:destinationInfo'),
          AsyncStorage.getItem('@roomContext:cityIndex'),
        ]);

        // Check if dates are in the past and reset if needed
        if (startDate && endDate) {
          const parsedStartDate = dayjs(startDate);
          const parsedEndDate = dayjs(endDate);
          const today = dayjs().startOf('day');

          // If start date is in the past, clear the dates
          if (parsedStartDate.isBefore(today)) {
            console.log('Persisted dates are stale, clearing them');
            await AsyncStorage.multiRemove([
              '@roomContext:startDate',
              '@roomContext:endDate',
            ]);
            setHotelStayStartDate(null);
            setHotelStayEndDate(null);
          } else {
            setHotelStayStartDate(parsedStartDate);
            setHotelStayEndDate(parsedEndDate);
          }
        }

        if (persistedRooms) setRooms(parseInt(persistedRooms, 10));
        if (persistedAdults) setAdults(parseInt(persistedAdults, 10));
        if (persistedChildren) setChildren(parseInt(persistedChildren, 10));
        if (persistedDestination) setDestination(persistedDestination);
        if (persistedDestinationInfo)
          setDestinationInfo(JSON.parse(persistedDestinationInfo));
        if (persistedCityIndex)
          setSelectedCityIndex(parseInt(persistedCityIndex, 10));
      } catch (error) {
        console.error('Error loading persisted data:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadPersistedData();
  }, []);

  // Persist critical state to AsyncStorage
  useEffect(() => {
    if (!isLoaded) return;
    if (hotelStayStartDate) {
      const dateStr = dayjs.isDayjs(hotelStayStartDate)
        ? hotelStayStartDate.toISOString()
        : hotelStayStartDate;
      AsyncStorage.setItem('@roomContext:startDate', dateStr);
    }
  }, [hotelStayStartDate, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (hotelStayEndDate) {
      const dateStr = dayjs.isDayjs(hotelStayEndDate)
        ? hotelStayEndDate.toISOString()
        : hotelStayEndDate;
      AsyncStorage.setItem('@roomContext:endDate', dateStr);
    }
  }, [hotelStayEndDate, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('@roomContext:rooms', rooms.toString());
  }, [rooms, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('@roomContext:adults', adults.toString());
  }, [adults, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('@roomContext:children', pluaralChild.toString());
  }, [pluaralChild, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (destination) {
      AsyncStorage.setItem('@roomContext:destination', destination);
    }
  }, [destination, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (destinationInfo) {
      AsyncStorage.setItem(
        '@roomContext:destinationInfo',
        JSON.stringify(destinationInfo),
      );
    }
  }, [destinationInfo, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (selectedCityIndex !== undefined) {
      AsyncStorage.setItem(
        '@roomContext:cityIndex',
        selectedCityIndex.toString(),
      );
    }
  }, [selectedCityIndex, isLoaded]);

  // Function to set default dates (2 days from now to 4 days from now)
  const setDefaultDates = () => {
    const startDate = dayjs().add(2, 'day');
    const endDate = dayjs().add(4, 'day');
    console.log(
      'setDefaultDates called - Start:',
      startDate.format('YYYY-MM-DD'),
      'End:',
      endDate.format('YYYY-MM-DD'),
    );
    setHotelStayStartDate(startDate);
    setHotelStayEndDate(endDate);
    // Immediately persist to AsyncStorage
    AsyncStorage.setItem('@roomContext:startDate', startDate.toISOString());
    AsyncStorage.setItem('@roomContext:endDate', endDate.toISOString());
  };
  useEffect(() => {
    if (roomState?.rooms?.length > 0 && !selectedRoomId) {
      console.log('inside');
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
      console.log('Cleared selectedRoom');
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
        setPage,
        guests,
        setGuests,
        rooms,
        setRooms,
        adults,
        setAdults,
        pluaralChild,
        setChildren,
        pets,
        page,
        setPets,
        showGuestsModal,
        setShowGuestsModal,
        destination,
        setDestination,
        destinationInfo,
        setDestinationInfo,
        selectedCityIndex,
        setSelectedCityIndex,
        showFlatList,
        setShowFlatList,
        setDefaultDates,
        roomDetails,
        setRoomDetails,
        roomTypeId,
        setRoomTypeId,
      }}>
      {children}
    </RoomContext.Provider>
  );
};
