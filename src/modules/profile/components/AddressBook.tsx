import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Phone, User, Trash2, CheckCircle2, Home, Briefcase, Map } from 'lucide-react';
import { profileApi } from '../api/profile.api';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import axios from 'axios';

interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

interface AddressBookProps {
  addresses: Address[];
  onUpdate: () => void;
}

export const AddressBook = ({ addresses, onUpdate }: AddressBookProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [form, setForm] = useState({
    label: 'Nhà riêng',
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detail: '',
    isDefault: false
  });

  const [loading, setLoading] = useState(false);

  const [allWards, setAllWards] = useState<any[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(res.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = e.target.value;
    const province = provinces.find(p => p.name === provinceName);
    setForm({ ...form, province: provinceName, district: '', ward: '' });
    setAllWards([]);

    if (province) {
      try {
        // Fetch depth 3 to get all districts and their wards in one go
        const res = await axios.get(`https://provinces.open-api.vn/api/p/${province.code}?depth=3`);
        const districts = res.data.districts;
        // Flatten all wards and keep track of which district they belong to
        const flattenedWards: any[] = [];
        districts.forEach((d: any) => {
          d.wards.forEach((w: any) => {
            flattenedWards.push({
              ...w,
              districtName: d.name
            });
          });
        });
        // Sort wards alphabetically for easier search
        flattenedWards.sort((a, b) => a.name.localeCompare(b.name));
        setAllWards(flattenedWards);
      } catch (error) {
        console.error('Error fetching wards:', error);
      }
    }
  };

  const [isManualWard, setIsManualWard] = useState(false);

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const wardName = e.target.value;
    if (isManualWard) {
      setForm({ ...form, ward: wardName, district: '' }); // When manual, district is unknown
    } else {
      const ward = allWards.find(w => w.name === wardName);
      if (ward) {
        setForm({ ...form, ward: wardName, district: ward.districtName });
      } else {
        setForm({ ...form, ward: '', district: '' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await profileApi.updateAddress(editingId, form);
        toast.success('Address updated successfully');
      } else {
        await profileApi.addAddress(form);
        toast.success('Address added successfully');
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      onUpdate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      label: 'Nhà riêng',
      fullName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      detail: '',
      isDefault: false
    });
    setAllWards([]);
    setIsManualWard(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await profileApi.deleteAddress(id);
      toast.success('Address deleted successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Delete failed');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await profileApi.setDefaultAddress(id);
      toast.success('Default address updated');
      onUpdate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Update failed');
    }
  };

  const startEditing = (addr: Address) => {
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      detail: addr.detail,
      isDefault: addr.isDefault
    });
    setEditingId(addr._id);
    setIsAdding(true);
    // Note: In a real app, you'd need to re-fetch districts/wards for the selected province/district
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <MapPin className="size-5 text-[#C83B1E]" />
          Address Book
        </h3>
        {!isAdding && (
          <Button 
            onClick={() => { setIsAdding(true); resetForm(); }}
            className="bg-[#C83B1E] hover:bg-[#b03318] text-white"
          >
            <Plus className="size-4 mr-2" /> Add New Address
          </Button>
        )}
      </div>

      {isAdding ? (
        <Card className="border-2 border-dashed border-gray-200 shadow-none">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Label</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm"
                    value={form.label}
                    onChange={(e) => setForm({...form, label: e.target.value})}
                  >
                    <option value="Nhà riêng">Nhà riêng</option>
                    <option value="Công ty">Công ty</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <Input 
                    placeholder="Recipient's name"
                    value={form.fullName}
                    onChange={(e) => setForm({...form, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                  <Input 
                    placeholder="0xxx xxx xxx"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Province / City</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm"
                    value={form.province}
                    onChange={handleProvinceChange}
                    required
                  >
                    <option value="">Select Province</option>
                    {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Ward / Commune</label>
                    <button 
                      type="button" 
                      onClick={() => setIsManualWard(!isManualWard)}
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      {isManualWard ? 'Select from list' : 'Enter manually'}
                    </button>
                  </div>
                  {isManualWard ? (
                    <Input 
                      placeholder="Enter ward name"
                      value={form.ward}
                      onChange={handleWardChange}
                      required
                    />
                  ) : (
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm"
                      value={form.ward}
                      onChange={handleWardChange}
                      disabled={!form.province}
                      required
                    >
                      <option value="">Select Ward</option>
                      {allWards.map(w => (
                        <option key={w.code} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Detailed Address</label>
                  <Input 
                    placeholder="House number, street name..."
                    value={form.detail}
                    onChange={(e) => setForm({...form, detail: e.target.value})}
                    required
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    checked={form.isDefault}
                    onChange={(e) => setForm({...form, isDefault: e.target.checked})}
                    className="size-4 rounded border-gray-300 text-[#C83B1E] focus:ring-[#C83B1E]"
                  />
                  <label htmlFor="isDefault" className="text-sm font-medium text-gray-600">Set as default address</label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gray-900 text-white"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setIsAdding(false); setEditingId(null); }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr._id} className={`relative border-2 transition-all ${addr.isDefault ? 'border-[#C83B1E]/20 bg-[#C83B1E]/[0.02]' : 'border-gray-100 hover:border-gray-200'}`}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${addr.label === 'Công ty' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {addr.label === 'Công ty' ? <Briefcase className="inline size-3 mr-1" /> : <Home className="inline size-3 mr-1" />}
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditing(addr)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                      <Map className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(addr._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <User className="size-3.5 text-gray-400" />
                    {addr.fullName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="size-3.5 text-gray-400" />
                    {addr.phone}
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                    <MapPin className="size-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      {addr.detail}<br />
                      {addr.ward}, {addr.province}
                    </span>
                  </div>
                </div>

                {!addr.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(addr._id)}
                    className="mt-4 text-xs font-bold text-blue-600 hover:underline transition-all"
                  >
                    Set as default
                  </button>
                )}
              </CardContent>
            </Card>
          ))}

          {addresses.length === 0 && (
            <div className="col-span-full py-10 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <MapPin className="size-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Your address book is empty.</p>
              <Button 
                variant="link" 
                onClick={() => setIsAdding(true)}
                className="text-[#C83B1E] font-bold"
              >
                Add your first address
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
