import React, { useState } from 'react';
import './App.css';

const options = [
  { id: 1, name: 'Tatlı', icon: '🍰' },
  { id: 2, name: 'Oyun', icon: '🎮' },
  { id: 3, name: 'Çay', icon: '☕' },
  { id: 4, name: 'Kahve', icon: '☕' },
  { id: 5, name: 'VR', icon: '🎮' },
  { id: 6, name: 'Kokpit', icon: '🎮' },
  { id: 7, name: 'Manzara', icon: '🌅' },
  { id: 8, name: 'Güzel Mekan', icon: '🏠' },
  { id: 9, name: 'Sinema', icon: '🎬' },
  { id: 10, name: 'Alışveriş', icon: '🛍️' },
];

const venues = {
  'Tatlı,Kahve': ['Künefeci', 'Baklava Evi', 'Tatlı Dünyası'],
  'Oyun,VR': ['VR Oyun Merkezi', 'E-Spor Kafe'],
  'Çay,Manzara': ['Çay Bahçesi', 'Manzaralı Kafe'],
  'Kahve,Güzel Mekan': ['Starbucks', 'Gloria Jeans', 'Kahve Dünyası'],
  'Sinema,Alışveriş': ['AVM Sinema', 'City Center'],
};

function App() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleAddOption = () => {
    setShowOptions(true);
  };

  const handleSelectOption = (option) => {
    if (selectedOptions.length < 2) {
      setSelectedOptions([...selectedOptions, option]);
      setShowOptions(false);
    }
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...selectedOptions];
    newOptions.splice(index, 1);
    setSelectedOptions(newOptions);
  };

  const getSuggestions = () => {
    if (selectedOptions.length === 2) {
      const key = selectedOptions.map(opt => opt.name).sort().join(',');
      return venues[key];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-primary mb-8">
          Nereye Gidelim?
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-center mb-6">
            <button
              onClick={handleAddOption}
              className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-3xl hover:bg-opacity-90 transition-all"
            >
              +
            </button>
          </div>

          {showOptions && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <span className="text-2xl mr-2">{option.icon}</span>
                  {option.name}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {selectedOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-100 p-4 rounded-lg"
              >
                <span>
                  <span className="text-2xl mr-2">{option.icon}</span>
                  {option.name}
                </span>
                <button
                  onClick={() => handleRemoveOption(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {selectedOptions.length === 2 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Önerilen Mekanlar:</h2>
              <ul className="space-y-2">
                {getSuggestions().map((venue, index) => (
                  <li
                    key={index}
                    className="bg-secondary bg-opacity-10 p-4 rounded-lg"
                  >
                    {venue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 