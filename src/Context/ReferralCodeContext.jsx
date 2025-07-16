import React, {createContext, useContext, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

const ReferralCodeContext = createContext();

export const ReferralCodeProvider = ({children}) => {
  const [referralCode, setReferralCode] = useState('');
  const [whatTriggered, setWhatTriggered] = useState('');
  const dispatch = useDispatch();
  return (
    <ReferralCodeContext.Provider
      value={{referralCode, setReferralCode, whatTriggered, setWhatTriggered}}>
      {children}
    </ReferralCodeContext.Provider>
  );
};

export const useReferralCode = () => {
  const context = useContext(ReferralCodeContext);
  if (!context) {
    throw new Error(
      'useReferralCode must be used within a ReferralCodeProvider',
    );
  }
  return context;
};
export default ReferralCodeContext;
