import { useState, useEffect } from 'react';
import { CAFE_DETAILS } from '../data/cafeData';
import { publicApi } from './publicApi';

export interface PublicCafeSettings {
  cafeName: string;
  address: string;
  phone: string;
  email?: string;
  hours: string;
  googleMapsUrl?: string;
  instagram?: string;
  instagramUrl?: string;
  maxPartySize?: number;
  defaultSlotCapacity?: number;
}

let cachedSettings: PublicCafeSettings = {
  cafeName: CAFE_DETAILS.name || 'MRDĀ',
  address: CAFE_DETAILS.address,
  phone: CAFE_DETAILS.phone,
  email: CAFE_DETAILS.email || 'hello@atmrda.com',
  hours: CAFE_DETAILS.hours,
  googleMapsUrl: CAFE_DETAILS.googleMapsUrl,
  instagram: CAFE_DETAILS.instagram || 'at.mrda',
  instagramUrl: 'https://www.instagram.com/at.mrda/',
};
let hasFetched = false;
let isFetching = false;
const listeners = new Set<(s: PublicCafeSettings) => void>();

export function getCachedCafeSettings(): PublicCafeSettings {
  return cachedSettings;
}

export function useCafeSettings(): PublicCafeSettings {
  const [settings, setSettings] = useState<PublicCafeSettings>(cachedSettings);

  useEffect(() => {
    listeners.add(setSettings);

    if (!hasFetched && !isFetching) {
      isFetching = true;
      publicApi
        .fetchSettings()
        .then((data) => {
          if (data && data.phone) {
            cachedSettings = {
              ...CAFE_DETAILS,
              ...data,
              googleMapsUrl: CAFE_DETAILS.googleMapsUrl,
              instagram: CAFE_DETAILS.instagram,
            };
            hasFetched = true;
            listeners.forEach((listener) => listener(cachedSettings));
          }
        })
        .catch(() => {})
        .finally(() => {
          isFetching = false;
        });
    }

    return () => {
      listeners.delete(setSettings);
    };
  }, []);

  return settings;
}
