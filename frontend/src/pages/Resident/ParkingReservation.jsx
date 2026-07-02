import React, { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';

// Custom Top-Down Car SVG to match the UI perfectly
const CarIcon = ({ className, color = "currentColor", windowColor = "white" }) => (
  <svg viewBox="0 0 100 100" className={className} fill={color}>
    <rect x="25" y="15" width="50" height="70" rx="15" />
    <path d="M 30 35 Q 50 30 70 35 L 65 45 L 35 45 Z" fill={windowColor} />
    <path d="M 33 65 L 67 65 L 69 72 Q 50 75 31 72 Z" fill={windowColor} />
    <rect x="15" y="45" width="15" height="12" rx="4" />
    <rect x="70" y="45" width="15" height="12" rx="4" />
  </svg>
);

export default function ParkingReservation() {
  // Generate 20 parking spots (4 rows x 5 columns)
  const generateSpots = () => {
    const spots = [];
    const rows = ['A', 'B', 'C', 'D'];
    const spotsPerRow = 5;
    
    rows.forEach(row => {
      for (let i = 1; i <= spotsPerRow; i++) {
        const id = `${row}-${String(i).padStart(2, '0')}`;
        // Make some spots occupied
        const isOccupied = 
          (row === 'A' && i === 3) || 
          (row === 'B' && i === 2) || 
          (row === 'C' && i === 5) ||
          (row === 'D' && i === 1);
        spots.push({
          id,
          status: isOccupied ? 'occupied' : 'available'
        });
      }
    });
    return spots;
  };

  // State for parking spots
  const [spots, setSpots] = useState(generateSpots());

  // State for selected spot
  const [selectedId, setSelectedId] = useState('A-01');

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // State for start date - initialize with today
  const [startDate, setStartDate] = useState(today);

  // Calculate end date (30 days after start date)
  const endDate = useMemo(() => {
    if (!startDate) return null;
    const date = new Date(startDate);
    date.setDate(date.getDate() + 30);
    return date;
  }, [startDate]);

  // Monthly rate - fixed at 1000
  const monthlyRate = 1000;

  // Calculate total days
  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
  }, [startDate, endDate]);

  // Total amount is fixed at 1000 per month
  const totalAmount = monthlyRate;

  // Handle spot click
  const handleSpotClick = (id) => {
    const spot = spots.find(s => s.id === id);
    if (!spot || spot.status === 'occupied') return;

    const updated = spots.map(s => {
      if (s.id === id) {
        return { ...s, status: 'selected' };
      } else if (s.status === 'selected') {
        return { ...s, status: 'available' };
      }
      return s;
    });
    setSpots(updated);
    setSelectedId(id);
  };

  // Get spot styles
  const getSpotStyles = (status) => {
    switch (status) {
      case 'occupied':
        return { color: '#8A1D1D', borderClass: 'border-[#8A1D1D] border-dashed' };
      case 'selected':
        return { color: 'var(--color-primary)', borderClass: 'border-[var(--color-primary)] border-solid' };
      case 'available':
      default:
        return { color: '#D1D5DB', borderClass: 'border-gray-300 border-dashed' };
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '—';
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  // Handle start date change
  const handleStartDateChange = (e) => {
    const newDate = new Date(e.target.value);
    newDate.setHours(0, 0, 0, 0);
    
    // Ensure start date is not before today
    if (newDate < today) {
      alert('Start date cannot be in the past. Please select today or a future date.');
      return;
    }
    
    setStartDate(newDate);
  };

  // Get selected spot
  const selectedSpot = spots.find(s => s.id === selectedId);

  // Group spots by row
  const spotsByRow = spots.reduce((acc, spot) => {
    const row = spot.id.charAt(0);
    if (!acc[row]) acc[row] = [];
    acc[row].push(spot);
    return acc;
  }, {});

  // Format date for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-16">
      {/* Main Content */}
      <div className="p-4 md:p-8 flex justify-center">
        <div className="flex flex-col xl:flex-row gap-6 w-full max-w-[1400px]">
          
          {/* LEFT PANEL: Parking Space */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[var(--color-secondary)] py-6 text-center">
              <h1 className="text-white text-3xl font-bold tracking-wider uppercase drop-shadow-sm">
                Parking Space
              </h1>
            </div>

            {/* Body */}
            <div className="p-8 md:p-10 flex flex-col h-full">
              {/* Diagram Container */}
              <div className="bg-[#FCFAFA] border border-gray-300 rounded-xl p-6 md:p-8 mb-8 relative shadow-sm flex-1">
                
                {/* Parking Spots Grid - 4 rows x 5 columns */}
                <div className="flex flex-col gap-6 h-[85%]">
                  {Object.entries(spotsByRow).map(([row, rowSpots]) => (
                    <div key={row} className="flex justify-between items-center gap-3">
                      {/* Row Label */}
                      <div className="w-8 text-sm font-bold text-gray-500">{row}</div>
                      
                      {/* Spots in this row */}
                      {rowSpots.map((spot) => {
                        const { color, borderClass } = getSpotStyles(spot.status);
                        let windowColor = '#FCFAFA';
                        if (spot.status === 'selected') windowColor = '#e9f0e9';
                        else if (spot.status === 'occupied') windowColor = '#f7e9e9';
                        
                        return (
                          <div 
                            key={spot.id} 
                            className="flex flex-col items-center gap-2 cursor-pointer hover:translate-y-[-4px] transition-transform"
                            onClick={() => handleSpotClick(spot.id)}
                          >
                            <div className={`w-16 h-20 md:w-20 md:h-24 border-2 rounded-xl flex items-center justify-center p-1.5 transition-colors ${borderClass}`}>
                              <CarIcon 
                                className="w-full h-full" 
                                color={color} 
                                windowColor={windowColor} 
                              />
                            </div>
                            <span className={`text-xs md:text-sm font-semibold tracking-wide ${spot.status === 'occupied' ? 'text-[#8A1D1D]' : 'text-gray-700'}`}>
                              {spot.id.split('-')[1]}
                            </span>
                          </div>
                        );
                      })}
                      
                      {/* Empty space for alignment */}
                      <div className="w-8"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col items-center mt-2">
                <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[var(--color-primary)] rounded shadow-sm"></div>
                    <span className="text-sm text-gray-700 font-medium">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-300 rounded shadow-sm"></div>
                    <span className="text-sm text-gray-700 font-medium">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#8A1D1D] rounded shadow-sm"></div>
                    <span className="text-sm text-gray-700 font-medium">Occupied</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-semibold tracking-wide">
                  {spots.filter(s => s.status === 'available').length} out of {spots.length} spots available
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Reservation Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 w-full xl:w-[380px] shrink-0 flex flex-col h-fit">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Reservation Details</h2>

            {/* Selected Spot Box */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-2">Selected Spot</p>
              <div className="border border-[var(--color-primary)] bg-[#eef4ee] rounded-xl p-4 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <CarIcon 
                    className="w-14 h-14 ml-1 mt-1" 
                    color="var(--color-primary)" 
                    windowColor="#eef4ee" 
                  />
                  <span className="font-bold text-gray-900 text-lg">{selectedSpot?.id || '—'}</span>
                </div>
                <div className="text-[var(--color-primary)] font-bold text-sm ml-1">
                  Php {monthlyRate.toLocaleString()}/month
                </div>
              </div>
            </div>

            {/* Date Inputs */}
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={formatDateForInput(startDate)}
                  onChange={handleStartDateChange}
                  min={formatDateForInput(today)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 bg-white cursor-pointer hover:border-gray-400 transition-colors text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Rental starts on {formatDate(startDate)}
                </p>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">End Date (Auto-calculated)</label>
                <div className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2.5 bg-gray-50 cursor-not-allowed">
                  <span className="text-sm text-gray-800">{formatDate(endDate)}</span>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  30 days after start date
                </p>
              </div>
            </div>

            {/* Total Amount Box */}
            <div className="bg-[var(--color-secondary)] text-white rounded-xl p-5 mb-6 shadow-md">
              <div className="text-xs font-medium opacity-90 mb-1">Total Amount</div>
              <div className="flex justify-between items-end">
                <div className="text-[10px] opacity-90 pb-1">
                  1 month ({totalDays} days)
                </div>
                <div className="text-2xl font-bold tracking-tight">Php {totalAmount.toFixed(2)}</div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full text-sm font-semibold hover:brightness-95 transition-all shadow-sm">
                Input details
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}