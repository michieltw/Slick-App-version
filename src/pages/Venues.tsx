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

  if (loading) return <div className="text-center py-20 text-[var(--color-nhl-muted)]">Loading information...</div>;

  const venueColumns = [
    {
      header: 'Arena',
      accessor: (venue: Venue) => (
        <div className="font-bold text-white uppercase">{venue.name}</div>
      ),
      className: 'w-1/3'
    },
    {
      header: 'Location',
      accessor: (venue: Venue) => (
        <div className="flex items-center space-x-2 text-[var(--color-nhl-muted)] uppercase text-xs">
          <MapPin className="w-4 h-4" />
          <span>{venue.city}, {venue.country}</span>
        </div>
      ),
    },
    {
      header: 'Capacity',
      accessor: (venue: Venue) => (
        <span>{venue.capacity.toLocaleString()}</span>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="border-b border-[var(--color-nhl-border)] pb-4">
          <h1 className="text-3xl font-bold uppercase tracking-wider text-white">Ice Rinks & Venues</h1>
          <p className="text-[var(--color-nhl-muted)] mt-1">Where the action happens in the Benelux region</p>
        </div>

        <DataTable
          data={venues}
          columns={venueColumns}
          keyExtractor={(v) => v.id}
        />
      </section>

      <section className="space-y-6">
        <div className="border-b border-[var(--color-nhl-border)] pb-4">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-white">Gear & Retailers</h2>
          <p className="text-[var(--color-nhl-muted)] mt-1">Get equipped for the ice</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {retailers.map(retailer => (
            <div key={retailer.id} className="bg-[var(--color-nhl-panel)] border border-[var(--color-nhl-border)] p-6 rounded hover:border-[var(--color-nhl-accent)] transition-colors">
              <h3 className="text-xl font-bold text-white uppercase mb-2">{retailer.name}</h3>
              {retailer.city && (
                <div className="flex items-center text-[var(--color-nhl-muted)] text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{retailer.city}</span>
                </div>
              )}
              <p className="text-gray-300 mb-6">{retailer.description}</p>
              <a
                href={retailer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-[var(--color-nhl-accent)] hover:bg-[var(--color-nhl-accent-hover)] text-white text-sm font-semibold uppercase tracking-wider rounded transition-colors"
              >
                Visit Website
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}