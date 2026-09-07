import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Venue, Retailer } from '../types';
import DataTable from '../components/DataTable';
import { ExternalLink, MapPin, Edit2, Trash2, Plus, Save } from 'lucide-react';

export default function Venues() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';
  const [isEditingVenues, setIsEditingVenues] = useState(false);
  const [isEditingRetailers, setIsEditingRetailers] = useState(false);

  const [venueForm, setVenueForm] = useState<Partial<Venue>>({});
  const [retailerForm, setRetailerForm] = useState<Partial<Retailer>>({});

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

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueForm.name || !venueForm.city || !venueForm.country) return;
    try {
      if (venueForm.id) {
        const updated = await api.updateVenue(venueForm as Venue);
        setVenues(venues.map(v => v.id === updated.id ? updated : v));
      } else {
        const created = await api.createVenue(venueForm as Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>);
        setVenues([...venues, created]);
      }
      setVenueForm({});
    } catch (error) {
      console.error('Failed to save venue', error);
    }
  };

  const handleDeleteVenue = async (id: string) => {
    try {
      await api.deleteVenue(id);
      setVenues(venues.filter(v => v.id !== id));
    } catch (error) {
      console.error('Failed to delete venue', error);
    }
  };

  const handleSaveRetailer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailerForm.name || !retailerForm.website) return;
    try {
      if (retailerForm.id) {
        const updated = await api.updateRetailer(retailerForm as Retailer);
        setRetailers(retailers.map(r => r.id === updated.id ? updated : r));
      } else {
        const created = await api.createRetailer(retailerForm as Omit<Retailer, 'id' | 'createdAt' | 'updatedAt'>);
        setRetailers([...retailers, created]);
      }
      setRetailerForm({});
    } catch (error) {
      console.error('Failed to save retailer', error);
    }
  };

  const handleDeleteRetailer = async (id: string) => {
    try {
      await api.deleteRetailer(id);
      setRetailers(retailers.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete retailer', error);
    }
  };

  if (loading) return <LoadingSpinner />;

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
    },
    ...(isEditingVenues ? [{
      header: 'ACTIONS',
      accessor: (venue: Venue) => (
        <div className="flex justify-end space-x-2">
          <button onClick={() => setVenueForm(venue)} className="p-1 text-slate-400 hover:text-slate-900 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDeleteVenue(venue.id)} className="p-1 text-rose-400 hover:text-rose-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'text-right w-24'
    }] : [])
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-16">
      <section className="space-y-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">Ice Rinks & Venues</h1>
            <p className="text-slate-500 mt-2 font-medium">Where the action happens in the Benelux region</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsEditingVenues(!isEditingVenues)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                isEditingVenues ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isEditingVenues ? 'Done Editing' : 'Edit Venues'}
            </button>
          )}
        </div>

        {isEditingVenues && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{venueForm.id ? 'Edit Venue' : 'Add New Venue'}</h3>
              {venueForm.id && <button onClick={() => setVenueForm({})} className="text-slate-500 text-xs font-bold uppercase hover:text-slate-900">Cancel Edit</button>}
            </div>
            <form onSubmit={handleSaveVenue} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <input type="text" placeholder="Venue Name" value={venueForm.name || ''} onChange={e => setVenueForm({...venueForm, name: e.target.value})} className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm" required />
              <input type="text" placeholder="City" value={venueForm.city || ''} onChange={e => setVenueForm({...venueForm, city: e.target.value})} className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm" required />
              <input type="text" placeholder="Country" value={venueForm.country || ''} onChange={e => setVenueForm({...venueForm, country: e.target.value})} className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm" required />
              <input type="number" placeholder="Capacity" value={venueForm.capacity || ''} onChange={e => setVenueForm({...venueForm, capacity: parseInt(e.target.value) || 0})} className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm" required />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center justify-center">
                {venueForm.id ? <Save className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                {venueForm.id ? 'Save' : 'Add'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <DataTable
            data={venues}
            columns={venueColumns}
            keyExtractor={(v) => v.id}
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">Gear & Retailers</h2>
            <p className="text-slate-500 mt-2 font-medium">Get equipped for the ice</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsEditingRetailers(!isEditingRetailers)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                isEditingRetailers ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isEditingRetailers ? 'Done Editing' : 'Edit Retailers'}
            </button>
          )}
        </div>

        {isEditingRetailers && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{retailerForm.id ? 'Edit Retailer' : 'Add New Retailer'}</h3>
              {retailerForm.id && <button onClick={() => setRetailerForm({})} className="text-slate-500 text-xs font-bold uppercase hover:text-slate-900">Cancel Edit</button>}
            </div>
            <form onSubmit={handleSaveRetailer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Retailer Name" value={retailerForm.name || ''} onChange={e => setRetailerForm({...retailerForm, name: e.target.value})} className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm" required />
              <input type="text" placeholder="City (Optional)" value={retailerForm.city || ''} onChange={e => setRetailerForm({...retailerForm, city: e.target.value})} className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm" />
              <input type="url" placeholder="Website URL" value={retailerForm.website || ''} onChange={e => setRetailerForm({...retailerForm, website: e.target.value})} className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm" required />
              <div className="flex space-x-2">
                <input type="text" placeholder="Description" value={retailerForm.description || ''} onChange={e => setRetailerForm({...retailerForm, description: e.target.value})} className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm" required />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md text-sm font-bold flex items-center justify-center">
                  {retailerForm.id ? <Save className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  {retailerForm.id ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {retailers.map(retailer => (
            <div key={retailer.id} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:border-slate-300 transition-colors flex flex-col h-full relative group">
              {isEditingRetailers && (
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setRetailerForm(retailer)} className="p-1 text-slate-400 hover:text-slate-900 bg-white rounded-md shadow-sm border border-slate-200">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteRetailer(retailer.id)} className="p-1 text-rose-400 hover:text-rose-600 bg-white rounded-md shadow-sm border border-slate-200">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
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
