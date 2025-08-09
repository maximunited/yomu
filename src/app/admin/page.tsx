'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import AdminForm from '@/components/AdminForm';
import type { Brand, Benefit } from '@/types/admin';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'brands' | 'benefits'>('brands');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Brand | Benefit | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [brandsRes, benefitsRes] = await Promise.all([
        fetch('/api/brands'),
        fetch('/api/admin/benefits')
      ]);
      
      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData);
      }
      
      if (benefitsRes.ok) {
        const payload = await benefitsRes.json();
        const items = Array.isArray(payload) ? payload : (payload?.benefits ?? []);
        setBenefits(items);
      } else {
        console.error('Benefits response not ok:', benefitsRes.status, await benefitsRes.text());
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'brand' | 'benefit') => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`/api/admin/${type}s/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleToggleActive = async (id: string, type: 'brand' | 'benefit') => {
    try {
      const current = type === 'brand'
        ? brands.find(b => b.id === id)?.isActive
        : benefits.find(b => b.id === id)?.isActive;

      const response = await fetch(`/api/admin/${type}s/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      
      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleSaveItem = async (data: Partial<Brand> | Partial<Benefit>) => {
    try {
      const isEditing = editingItem && editingItem.id;
      const url = isEditing 
        ? `/api/admin/${activeTab}/${editingItem.id}` 
        : `/api/admin/${activeTab}`;
      
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setShowForm(false);
        setEditingItem(null);
        loadData();
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: Brand | Benefit) => {
    setEditingItem(item);
    setShowForm(true);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage brands and benefits</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('brands')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'brands'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Brands ({brands.length})
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'benefits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Benefits ({benefits.length})
            </button>
          </nav>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === 'brands' ? 'Brands' : 'Benefits'}
            </h2>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add {activeTab === 'brands' ? 'Brand' : 'Benefit'}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'brands' ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {brands.map((brand) => (
                <li key={brand.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={brand.logoUrl}
                        alt={brand.name}
                      />
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">{brand.name}</h3>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            brand.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {brand.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{brand.description}</p>
                        <p className="text-xs text-gray-400">{brand.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(brand.id, 'brand')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id, 'brand')}
                        className="text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {Array.isArray(benefits) && benefits.map((benefit) => (
                <li key={benefit.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">{benefit.title}</h3>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          benefit.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {benefit.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {benefit.isFree && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Free
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{benefit.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {benefit.redemptionMethod} • {benefit.validityType}
                        {benefit.validityDuration && ` • ${benefit.validityDuration} days`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(benefit)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(benefit.id, 'benefit')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(benefit.id, 'benefit')}
                        className="text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
           <AdminForm
            type={activeTab === 'brands' ? 'brand' : 'benefit'}
            item={editingItem ?? undefined}
            brands={activeTab === 'benefits' ? brands : undefined}
            onSave={handleSaveItem}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        )}
      </div>
    </div>
  );
} 