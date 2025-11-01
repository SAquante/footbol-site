'use client';

import { useState, useEffect } from 'react';

interface LocationPickerProps {
  value: string;
  onChange: (location: string, address: string) => void;
}

const defaultLocation = "Стадион Локомотив";
const defaultAddress = "ул. Константина Заслонова, 23 корпус 4, Санкт-Петербург, Россия, 191119";

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [location, setLocation] = useState(defaultLocation);
  const [address, setAddress] = useState(defaultAddress);

  useEffect(() => {
    if (!value) {
      onChange(defaultLocation, defaultAddress);
    }
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    onChange(newLocation, address);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    onChange(location, newAddress);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">
          📍 Название стадиона
        </label>
        <input
          type="text"
          value={location}
          onChange={handleLocationChange}
          placeholder="Введите название стадиона..."
          className="input-field w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          🏠 Адрес стадиона
        </label>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Введите адрес стадиона..."
          className="input-field w-full"
        />
      </div>

      <div className="p-4 bg-dark-accent rounded-lg border border-white/10">
        <div className="text-sm text-gray-400 mb-1">Место проведения:</div>
        <div className="text-real-gold font-semibold">{location}</div>
        <div className="text-xs text-gray-400 mt-1">{address}</div>
      </div>
    </div>
  );
}
