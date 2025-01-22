import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Pencil, Check, X } from "lucide-react";

const ThisMonthView = ({ clients, handleSort, handleCommentChange }) => (
  <div className="rounded-md border overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
            <div className="flex items-center">
              Client Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </th>
          <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('forecast')}>
            <div className="flex items-center">
              Forecast
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </th>
          <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('actual')}>
            <div className="flex items-center">
              Actual Revenue
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </th>
          <th className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('difference')}>
            <div className="flex items-center">
              Difference
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </th>
          <th className="px-4 py-3">Comments</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id} className="border-t hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{client.name}</td>
            <td className="px-4 py-3">${client.forecast.toLocaleString()}</td>
            <td className="px-4 py-3">${client.actual.toLocaleString()}</td>
            <td className={`px-4 py-3 ${
              client.actual - client.forecast >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${(client.actual - client.forecast).toLocaleString()}
            </td>
            <td className="px-4 py-3">
              <input
                type="text"
                value={client.comment}
                onChange={(e) => handleCommentChange(client.id, e.target.value)}
                placeholder="Add comment..."
                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const NextThreeMonthsView = ({ clients, setClients, setShowThankYou }) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);
  
  const nextThreeMonths = [];
  for (let i = 1; i <= 3; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    nextThreeMonths.push(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  }

  const handleEditClick = (clientId, month, currentValue) => {
    setEditingCell({ clientId, month });
    setEditValue(currentValue.toString());
  };

  const handleSaveCell = (clientId, month) => {
    const numericValue = parseFloat(editValue.replace(/,/g, ''));
    if (isNaN(numericValue)) return;

    setClients(prevClients => {
      return prevClients.map(client => {
        if (client.id === clientId) {
          return {
            ...client,
            futureForecast: {
              ...client.futureForecast,
              [month]: numericValue
            }
          };
        }
        return client;
      });
    });
    setEditingCell(null);
    setShowSaveButton(true);
  };

  const handleSaveAllForecasts = () => {
    setShowSaveButton(false);
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
  };

  const handleKeyPress = (e, clientId, month) => {
    if (e.key === 'Enter') {
      handleSaveCell(clientId, month);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">Client Name</th>
              {nextThreeMonths.map(month => (
                <th key={month} className="px-4 py-3">Forecast {month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{client.name}</td>
                {nextThreeMonths.map((month) => (
                  <td key={month} className="px-4 py-3 group">
                    {editingCell?.clientId === client.id && editingCell?.month === month ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, client.id, month)}
                          className="w-32 px-2 py-1 border rounded"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveCell(client.id, month)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingCell(null)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span>${client.futureForecast?.[month]?.toLocaleString() ?? (client.forecast * (1 + nextThreeMonths.indexOf(month) * 0.05)).toLocaleString()}</span>
                        <button
                          onClick={() => handleEditClick(client.id, month, client.futureForecast?.[month] ?? (client.forecast * (1 + nextThreeMonths.indexOf(month) * 0.05)))}
                          className="opacity-0 group-hover:opacity-100 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showSaveButton && (
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleSaveAllForecasts}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Forecasts
          </button>
        </div>
      )}
    </>
  );
};

const ClientDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [clients, setClients] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showThankYou, setShowThankYou] = useState(false);
  const [activeTab, setActiveTab] = useState('thisMonth');
  
  useEffect(() => {
    const mockClients = [
      { 
        id: 1, 
        name: 'Client A', 
        forecast: 50000, 
        actual: 48000, 
        comment: '',
        futureForecast: {} 
      },
      { 
        id: 2, 
        name: 'Client B', 
        forecast: 75000, 
        actual: 80000, 
        comment: '',
        futureForecast: {} 
      },
      { 
        id: 3, 
        name: 'Client C', 
        forecast: 25000, 
        actual: 22000, 
        comment: '',
        futureForecast: {} 
      },
    ];
    setClients(mockClients);
  }, []);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    
    const sortedClients = [...clients].sort((a, b) => {
      if (key === 'difference') {
        const diffA = a.actual - a.forecast;
        const diffB = b.actual - b.forecast;
        return direction === 'ascending' ? diffA - diffB : diffB - diffA;
      }
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    
    setClients(sortedClients);
  };

  const handleCommentChange = (id, value) => {
    setClients(clients.map(client => 
      client.id === id ? { ...client, comment: value } : client
    ));
  };

  const saveComments = () => {
    console.log('Saving comments:', clients);
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
  };

  const months = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, i, 1);
    months.push(date.toISOString().slice(0, 7));
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Management Dashboard</h1>
        {activeTab === 'thisMonth' && (
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-48 px-3 py-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {new Date(month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('thisMonth')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'thisMonth'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setActiveTab('nextThreeMonths')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'nextThreeMonths'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Next Three Months
          </button>
        </nav>
      </div>

      {activeTab === 'thisMonth' ? (
        <>
          <ThisMonthView
            clients={clients}
            handleSort={handleSort}
            handleCommentChange={handleCommentChange}
          />
          <div className="flex justify-end">
            <button 
              onClick={saveComments}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Comments
            </button>
          </div>
        </>
      ) : (
        <NextThreeMonthsView 
          clients={clients}
          setClients={setClients}
          setShowThankYou={setShowThankYou}
        />
      )}

      {showThankYou && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-gray-600">Your changes have been saved successfully.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
