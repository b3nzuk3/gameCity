import React, { createContext, useContext, useState, useEffect } from 'react'
import storeInfoConfig from '@/config/storeInfo'

export type StoreInfo = {
  name: string
  email: string
  phone: string
  currency: string
}

const StoreInfoContext = createContext<
  | {
      storeInfo: StoreInfo
      setStoreInfo: React.Dispatch<React.SetStateAction<StoreInfo>>
    }
  | undefined
>(undefined)

export const StoreInfoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    const saved = localStorage.getItem('storeInfo')
    return saved ? JSON.parse(saved) : storeInfoConfig
  })

  useEffect(() => {
    localStorage.setItem('storeInfo', JSON.stringify(storeInfo))
  }, [storeInfo])

  return (
    <StoreInfoContext.Provider value={{ storeInfo, setStoreInfo }}>
      {children}
    </StoreInfoContext.Provider>
  )
}

export const useStoreInfo = () => {
  const ctx = useContext(StoreInfoContext)
  if (!ctx)
    throw new Error('useStoreInfo must be used within StoreInfoProvider')
  return ctx
}
