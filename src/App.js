import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const cities = [
  { id: 1, name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { id: 2, name: 'Ankara', lat: 39.9334, lng: 32.8597 },
  { id: 3, name: 'İzmir', lat: 38.4237, lng: 27.1428 },
  { id: 4, name: 'Antalya', lat: 36.8841, lng: 30.7056 },
  { id: 5, name: 'Bursa', lat: 40.1885, lng: 29.0610 },
  { id: 6, name: 'Adana', lat: 37.0000, lng: 35.3213 },
  { id: 7, name: 'Konya', lat: 37.8667, lng: 32.4833 },
  { id: 8, name: 'Trabzon', lat: 41.0015, lng: 39.7178 },
  { id: 9, name: 'Kütahya', lat: 39.4167, lng: 29.9833 },
];

const options = [
  { 
    id: 1, 
    name: 'Tatlı', 
    icon: '🍰', 
    type: 'bakery', 
    tags: [
      'amenity=bakery',
      'shop=bakery',
      'shop=confectionery',
      'amenity=cafe',
      'cuisine=dessert'
    ] 
  },
  { 
    id: 2, 
    name: 'Oyun', 
    icon: '🎮', 
    type: 'leisure', 
    tags: [
      'leisure=amusement_arcade',
      'leisure=playground',
      'amenity=internet_cafe'
    ] 
  },
  { 
    id: 3, 
    name: 'Çay', 
    icon: '☕', 
    type: 'cafe', 
    tags: [
      'amenity=cafe',
      'cuisine=tea'
    ] 
  },
  { 
    id: 4, 
    name: 'Kahve', 
    icon: '☕', 
    type: 'cafe', 
    tags: [
      'amenity=cafe',
      'cuisine=coffee_shop'
    ] 
  },
  { 
    id: 5, 
    name: 'VR', 
    icon: '🎮', 
    type: 'leisure', 
    tags: [
      'leisure=amusement_arcade',
      'amenity=internet_cafe'
    ] 
  },
  { 
    id: 6, 
    name: 'Kokpit', 
    icon: '🎮', 
    type: 'leisure', 
    tags: [
      'leisure=amusement_arcade',
      'amenity=internet_cafe'
    ] 
  },
  { 
    id: 7, 
    name: 'Manzara', 
    icon: '🌅', 
    type: 'tourism', 
    tags: [
      'tourism=viewpoint',
      'tourism=attraction',
      'leisure=park'
    ] 
  },
  { 
    id: 8, 
    name: 'Güzel Mekan', 
    icon: '🏠', 
    type: 'restaurant', 
    tags: [
      'amenity=restaurant',
      'amenity=bar',
      'amenity=pub'
    ] 
  },
  { 
    id: 9, 
    name: 'Sinema', 
    icon: '🎬', 
    type: 'cinema', 
    tags: [
      'amenity=cinema',
      'amenity=theatre'
    ] 
  },
  { 
    id: 10, 
    name: 'Alışveriş', 
    icon: '🛍️', 
    type: 'shop', 
    tags: [
      'shop=mall',
      'shop=department_store',
      'shop=supermarket',
      'shop=convenience',
      'shop=clothes',
      'shop=shoes',
      'shop=jewelry',
      'shop=electronics'
    ] 
  },
];

function App() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [places, setPlaces] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setError(null);
        },
        (error) => {
          console.error("Konum alınamadı:", error);
          setError("Konum alınamadı. Lütfen bir şehir seçin.");
          setShowCitySelector(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setError("Tarayıcınız konum özelliğini desteklemiyor. Lütfen bir şehir seçin.");
      setShowCitySelector(true);
    }
  }, []);

  const handleAddOption = () => {
    setShowOptions(true);
  };

  const handleSelectOption = async (option) => {
    setSelectedOption(option);
    setShowOptions(false);
    setError(null);
    
    const location = selectedCity || userLocation;
    if (location) {
      try {
        const queries = option.tags.map(tag => {
          const [key, value] = tag.split('=');
          return `node["${key}"="${value}"](around:5000,${location.lat},${location.lng});`;
        }).join('\n');

        const query = `
          [out:json][timeout:25];
          (
            ${queries}
          );
          out body;
          >;
          out skel qt;
        `;

        const response = await axios.get(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
        );

        const formattedPlaces = response.data.elements.map(place => ({
          id: place.id,
          name: place.tags.name || 'İsimsiz Mekan',
          type: Object.entries(place.tags)
            .find(([key]) => ['amenity', 'shop', 'leisure', 'tourism'].includes(key))?.[1] || 'Bilinmeyen',
          address: place.tags['addr:street'] ? 
            `${place.tags['addr:street']} ${place.tags['addr:housenumber'] || ''}` : 
            'Adres bilgisi yok',
          lat: place.lat,
          lon: place.lon
        }));

        setPlaces(formattedPlaces);
        
        if (formattedPlaces.length === 0) {
          setError("Bu kategoride yakınızda mekan bulunamadı.");
        }
      } catch (error) {
        console.error("Mekanlar alınamadı:", error);
        setError("Mekanlar alınırken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowCitySelector(false);
    setUserLocation({ lat: city.lat, lng: city.lng });
    setError(null);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-[#000000] to-[#1a1a1a]' 
        : 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className={`absolute inset-0 rounded-3xl transform -rotate-1 ${
            isDarkTheme ? 'bg-white opacity-5' : 'bg-black opacity-20'
          }`}></div>
          <div className={`relative backdrop-blur-xl rounded-3xl shadow-2xl p-8 border ${
            isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'
          }`}>
            <div className="absolute top-4 right-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all transform hover:scale-110 ${
                  isDarkTheme 
                    ? 'bg-white/10 hover:bg-white/20' 
                    : 'bg-black/10 hover:bg-black/20'
                }`}
              >
                {isDarkTheme ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            <h1 className="text-5xl font-bold text-center text-white mb-8 transform hover:scale-105 transition-transform tracking-tight">
              Nereye Gidelim?
            </h1>
            
            {error && (
              <div className={`mb-4 p-4 rounded-2xl border ${
                isDarkTheme 
                  ? 'bg-red-500/20 border-red-500/30' 
                  : 'bg-red-500/30 border-red-500/40'
              } text-white`}>
                {error}
              </div>
            )}
            
            {showCitySelector && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">Şehir Seçin:</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className={`p-4 rounded-2xl transition-all transform hover:scale-105 border ${
                        isDarkTheme 
                          ? 'bg-white/10 hover:bg-white/20 border-white/10' 
                          : 'bg-white/20 hover:bg-white/30 border-white/20'
                      } text-white`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center mb-6">
              <button
                onClick={handleAddOption}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all transform hover:scale-110 shadow-lg ${
                  isDarkTheme 
                    ? 'bg-gradient-to-r from-[#007AFF] to-[#5856D6] hover:from-[#0066CC] hover:to-[#4A48B3]' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                } text-white`}
              >
                +
              </button>
            </div>

            {showOptions && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option)}
                    className={`p-4 rounded-2xl transition-all transform hover:scale-105 border ${
                      isDarkTheme 
                        ? 'bg-white/10 hover:bg-white/20 border-white/10' 
                        : 'bg-white/20 hover:bg-white/30 border-white/20'
                    } text-white`}
                  >
                    <span className="text-3xl mr-2">{option.icon}</span>
                    {option.name}
                  </button>
                ))}
              </div>
            )}

            {selectedOption && (
              <div className="mt-6">
                <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">Önerilen Mekanlar:</h2>
                <div className="space-y-4">
                  {places.map((place) => (
                    <div
                      key={place.id}
                      className={`backdrop-blur-sm p-4 rounded-2xl transform hover:scale-102 transition-all border ${
                        isDarkTheme 
                          ? 'bg-white/10 border-white/10' 
                          : 'bg-white/20 border-white/20'
                      }`}
                    >
                      <h3 className="font-semibold text-white text-lg">{place.name}</h3>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-300 hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {place.address}
                      </a>
                    </div>
                  ))}
                  {places.length === 0 && !error && (
                    <p className="text-center text-gray-400">
                      Bu kategoride yakınınızda mekan bulunamadı.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 