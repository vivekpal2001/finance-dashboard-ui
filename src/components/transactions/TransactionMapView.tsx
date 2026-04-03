import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Transaction } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { MapPin, Clock, Tag, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix default marker icon issue in Leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Custom marker icons
const createPinIcon = (type: 'income' | 'expense') => {
  const color = type === 'income' ? '#10B981' : '#FF6B4A';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
      </defs>
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" 
            fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="15" r="7" fill="white" opacity="0.9"/>
      <text x="16" y="19" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">
        ${type === 'income' ? '₹' : '₹'}
      </text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-pin-icon',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

const incomeIcon = createPinIcon('income');
const expenseIcon = createPinIcon('expense');

// Component to fit map bounds to markers
function FitBounds({ transactions }: { transactions: Transaction[] }) {
  const map = useMap();
  
  useEffect(() => {
    const located = transactions.filter(t => t.location);
    if (located.length === 0) return;
    
    const bounds = L.latLngBounds(
      located.map(t => [t.location!.lat, t.location!.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [transactions, map]);
  
  return null;
}

// Component to fly to a specific transaction
function FlyToTransaction({ transactionId, transactions }: { transactionId: string | null; transactions: Transaction[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!transactionId) return;
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction?.location) return;
    
    map.flyTo(
      [transaction.location.lat, transaction.location.lng],
      15,
      { duration: 1.5 }
    );

    // Open the popup after fly animation completes
    const timeout = setTimeout(() => {
      map.eachLayer((layer: any) => {
        if (layer.getLatLng) {
          const latlng = layer.getLatLng();
          const dist = Math.abs(latlng.lat - transaction.location!.lat) + Math.abs(latlng.lng - transaction.location!.lng);
          if (dist < 0.01) {
            layer.openPopup();
          }
        }
      });
    }, 1600);

    return () => clearTimeout(timeout);
  }, [transactionId, transactions, map]);
  
  return null;
}

// Animated marker wrapper
const AnimatedMarker: React.FC<{ 
  transaction: Transaction; 
  index: number; 
  onSelect: (t: Transaction) => void;
}> = ({ transaction, index, onSelect }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);
  
  if (!transaction.location || !visible) return null;
  
  return (
    <Marker
      position={[transaction.location.lat, transaction.location.lng]}
      icon={transaction.type === 'income' ? incomeIcon : expenseIcon}
      eventHandlers={{
        click: () => onSelect(transaction),
      }}
    >
      <Popup>
        <div className="min-w-[200px] p-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              transaction.type === 'income' ? 'bg-emerald-100' : 'bg-orange-100'
            }`}>
              <Tag className={`w-4 h-4 ${
                transaction.type === 'income' ? 'text-emerald-600' : 'text-orange-500'
              }`} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{transaction.description}</p>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{transaction.category}</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span className={`font-extrabold text-base ${
              transaction.type === 'income' ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </span>
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-medium">
                {new Date(transaction.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
          {transaction.location?.address && (
            <div className="flex items-center gap-1.5 mt-2 text-gray-400">
              <Navigation className="w-3 h-3 shrink-0" />
              <span className="text-[10px] font-medium">{transaction.location.address}</span>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

interface TransactionMapViewProps {
  transactions: Transaction[];
  focusedTransactionId?: string | null;
  onFocusHandled?: () => void;
}

export default function TransactionMapView({ transactions, focusedTransactionId, onFocusHandled }: TransactionMapViewProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const { locatedTransactions, unlocatedTransactions } = useMemo(() => {
    const located = transactions.filter(t => t.location);
    const unlocated = transactions.filter(t => !t.location);
    return { locatedTransactions: located, unlocatedTransactions: unlocated };
  }, [transactions]);

  const stats = useMemo(() => {
    const totalSpent = locatedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const cities = new Set(locatedTransactions.map(t => t.location?.address?.split(', ').pop()).filter(Boolean));
    return { totalSpent, cityCount: cities.size, pinCount: locatedTransactions.length };
  }, [locatedTransactions]);

  // Default center: India
  const defaultCenter: [number, number] = [22.5, 78.9];

  return (
    <div className="space-y-4">
      {/* Map Stats Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-full px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-800">
          <MapPin className="w-4 h-4 text-[#FF6B4A]" />
          <span className="text-xs font-bold text-gray-500">{stats.pinCount} locations</span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-full px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-800">
          <Navigation className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold text-gray-500">{stats.cityCount} cities</span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-full px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-800">
          <Tag className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-gray-500">Spent: {formatCurrency(stats.totalSpent)}</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="h-[350px] sm:h-[450px] lg:h-[500px] relative">
          <MapContainer
            center={defaultCenter}
            zoom={5}
            className="h-full w-full z-0"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <FitBounds transactions={locatedTransactions} />
            <FlyToTransaction transactionId={focusedTransactionId || null} transactions={locatedTransactions} />
            {locatedTransactions.map((t, i) => (
              <AnimatedMarker
                key={t.id}
                transaction={t}
                index={i}
                onSelect={setSelectedTransaction}
              />
            ))}
          </MapContainer>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF6B4A]" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expense</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Income</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unlocated Transactions */}
      {unlocatedTransactions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Without Location ({unlocatedTransactions.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {unlocatedTransactions.slice(0, 9).map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <MapPin className={`w-3.5 h-3.5 ${
                    t.type === 'income' ? 'text-emerald-500' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.description}</p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {t.category}
                  </p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${
                  t.type === 'income' ? 'text-emerald-500' : 'text-gray-500'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
          {unlocatedTransactions.length > 9 && (
            <p className="text-xs text-gray-400 text-center mt-3 font-medium">
              + {unlocatedTransactions.length - 9} more without location data
            </p>
          )}
        </div>
      )}
    </div>
  );
}
