import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Venue, Retailer } from '../types';
import DataTable from '../components/DataTable';
import { ExternalLink, MapPin } from 'lucide-react';

export default function Venues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [venuesData, retailersData] = await Promise.all([
          api.getVenues(),
          api.getRetailers()
        ]);
        setVenues(venuesData);
        setRetailers(retailersData);
      } catch (error) {
        console.error('Failed to load venues and retailers', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading information...</div>;

  const venueColumns = [
    {
      header: 'ARENA',
      accessor: (venue: Venue) => (
        <div className="font-bold text-slate-900 py-1">{venue.name}</div>
      ),
      className: 'w-1/3'
    },
    {
      header: 'LOCATION',
      accessor: (venue: Venue) => (
        <div className="flex items-center space-x-2 text-slate-500 font-semibold text-xs tracking-wider uppercase">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span>{venue.city}, {venue.country}</span>
        </div>
      ),
    },
    {
      header: 'CAPACITY',
      accessor: (venue: Venue) => (
        <span className="font-medium">{venue.capacity.toLocaleString()}</span>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-16">
      <section className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">Ice Rinks & Venues</h1>
          <p className="text-slate-500 mt-2 font-medium">Where the action happens in the Benelux region</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <DataTable
            data={venues}
            columns={venueColumns}
            keyExtractor={(v) => v.id}
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">Gear & Retailers</h2>
          <p className="text-slate-500 mt-2 font-medium">Get equipped for the ice</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {retailers.map(retailer => (
            <div key={retailer.id} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:border-slate-300 transition-colors flex flex-col h-full">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{retailer.name}</h3>
              {retailer.city && (
                <div className="flex items-center text-slate-500 text-sm font-semibold mb-4">
                  <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                  <span>{retailer.city}</span>
                </div>
              )}
              <p className="text-slate-600 mb-6 flex-grow leading-relaxed">{retailer.description}</p>
              <div>
                <a
                  href={retailer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[15px] font-bold rounded-lg transition-colors"
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4 ml-2 opacity-80" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
