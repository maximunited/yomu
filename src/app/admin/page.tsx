'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import AdminForm from '@/components/AdminForm';
import type { Brand, Benefit } from '@/types/admin';

type UrlAuditReport = {
  checkedAt?: string;
  summary?: {
    total: number;
    ok: number;
    failures: number;
    blocked: number;
    stale: number;
    unchecked: number;
  };
  results?: Array<{
    kind: string;
    label: string;
    url: string;
    ok: boolean;
    blocked: boolean;
    status: number | null;
    error: string | null;
  }>;
};

function formatChecked(value?: string | Date | null) {
  if (!value) return 'never';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return 'never';
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'brands' | 'benefits'>('brands');
  const [editingItem, setEditingItem] = useState<Brand | Benefit | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [auditBusy, setAuditBusy] = useState(false);
  const [auditReport, setAuditReport] = useState<UrlAuditReport | null>(null);
  const [opsMessage, setOpsMessage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  const unverifiedCount = useMemo(
    () => benefits.filter((b) => b.verified === false).length,
    [benefits]
  );

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setIsAdmin(false);
      setAdminChecked(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // Server gate mirrors requireAdmin (role + ADMIN_USER_IDS)
        const res = await fetch('/api/admin/me');
        if (cancelled) return;
        const ok = res.ok;
        setIsAdmin(ok);
        setAdminChecked(true);
        if (ok) {
          await loadData();
          await loadLastAudit();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        if (!cancelled) {
          setIsAdmin(false);
          setAdminChecked(true);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [brandsRes, benefitsRes] = await Promise.all([
        fetch('/api/brands'),
        fetch('/api/admin/benefits'),
      ]);

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData);
      }

      if (benefitsRes.ok) {
        const payload = await benefitsRes.json();
        const items = Array.isArray(payload)
          ? payload
          : (payload?.benefits ?? []);
        setBenefits(items);
      } else {
        console.error(
          'Benefits response not ok:',
          benefitsRes.status,
          await benefitsRes.text()
        );
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLastAudit = async () => {
    try {
      const res = await fetch('/api/admin/url-audit');
      if (!res.ok) return;
      const data = await res.json();
      if (data?.last) {
        setAuditReport(data.last);
      } else if (data?.persistence === 'database') {
        // Honest empty state — DB persistence is supported, nothing stored yet
        setAuditReport(null);
      }
    } catch (error) {
      console.error('Error loading last audit:', error);
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
      const current =
        type === 'brand'
          ? brands.find((b) => b.id === id)?.isActive
          : benefits.find((b) => b.id === id)?.isActive;

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

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectUnverified = () => {
    setSelectedIds(
      new Set(benefits.filter((b) => b.verified === false).map((b) => b.id))
    );
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkVerify = async (verified: boolean) => {
    if (!selectedIds.size) return;
    setBulkBusy(true);
    setOpsMessage(null);
    try {
      const res = await fetch('/api/admin/benefits/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selectedIds], verified }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setOpsMessage(body.error || `Bulk update failed (${res.status})`);
        return;
      }
      const body = await res.json();
      setOpsMessage(
        `Updated ${body.updated} benefit(s) → verified=${verified}`
      );
      clearSelection();
      await loadData();
    } catch (error) {
      console.error('Bulk verify failed:', error);
      setOpsMessage('Bulk verify failed');
    } finally {
      setBulkBusy(false);
    }
  };

  const handleRunUrlAudit = async () => {
    setAuditBusy(true);
    setOpsMessage(null);
    try {
      const res = await fetch('/api/admin/url-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staleDays: 60, limit: 80 }),
      });
      if (!res.ok) {
        setOpsMessage(`URL audit failed (${res.status})`);
        return;
      }
      const report = await res.json();
      setAuditReport(report);
      setOpsMessage(
        `URL audit: ${report.summary?.failures ?? 0} failures, ${report.summary?.blocked ?? 0} blocked, ${report.summary?.ok ?? 0} ok`
      );
    } catch (error) {
      console.error('URL audit failed:', error);
      setOpsMessage('URL audit failed');
    } finally {
      setAuditBusy(false);
    }
  };

  if (!isLoaded || !adminChecked || (isAdmin && isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-gray-900">Access denied</h1>
          <p className="text-gray-600 max-w-md">
            Admin role required. Set Clerk publicMetadata.role to
            &quot;admin&quot; or list your user id in ADMIN_USER_IDS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage brands and benefits · {unverifiedCount} unverified
          </p>
        </div>

        {/* Ops panel — mobile-first stack */}
        <div className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Ops</h2>
            <button
              type="button"
              onClick={handleRunUrlAudit}
              disabled={auditBusy}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${auditBusy ? 'animate-spin' : ''}`}
              />
              {auditBusy ? 'Auditing URLs…' : 'Run URL audit'}
            </button>
          </div>
          {opsMessage && (
            <p className="text-sm text-gray-700" role="status">
              {opsMessage}
            </p>
          )}
          {auditReport?.summary && (
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                Last audit:{' '}
                {auditReport.checkedAt
                  ? new Date(auditReport.checkedAt).toLocaleString()
                  : '—'}{' '}
                · {auditReport.summary.total} URLs ·{' '}
                <span className="text-red-700">
                  {auditReport.summary.failures} fail
                </span>{' '}
                · {auditReport.summary.blocked} blocked ·{' '}
                {auditReport.summary.ok} ok · {auditReport.summary.stale} stale
              </p>
              {!!auditReport.results?.filter((r) => !r.ok && !r.blocked)
                .length && (
                <ul className="max-h-28 overflow-auto rounded border border-red-100 bg-red-50 p-2 text-red-800">
                  {auditReport.results
                    .filter((r) => !r.ok && !r.blocked)
                    .slice(0, 12)
                    .map((r) => (
                      <li key={`${r.kind}-${r.url}`}>
                        [{r.kind}] {r.label}: {r.status ?? r.error}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
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
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === 'brands' ? 'Brands' : 'Benefits'}
            </h2>
            {activeTab === 'benefits' && (
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectUnverified}
                  className="text-xs rounded border border-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-50"
                >
                  Select unverified ({unverifiedCount})
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs rounded border border-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-50"
                >
                  Clear ({selectedIds.size})
                </button>
                <button
                  type="button"
                  disabled={!selectedIds.size || bulkBusy}
                  onClick={() => handleBulkVerify(true)}
                  className="inline-flex items-center gap-1 text-xs rounded bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckBadgeIcon className="h-3.5 w-3.5" />
                  Mark verified
                </button>
                <button
                  type="button"
                  disabled={!selectedIds.size || bulkBusy}
                  onClick={() => handleBulkVerify(false)}
                  className="text-xs rounded bg-amber-600 px-2 py-1 text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Mark unverified
                </button>
              </div>
            )}
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
                <li key={brand.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center min-w-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover shrink-0"
                        src={brand.logoUrl}
                        alt={brand.name}
                      />
                      <div className="ml-4 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {brand.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              brand.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {brand.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {brand.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {brand.category}
                          {brand.actionUrl ? (
                            <>
                              {' • '}
                              <a
                                href={brand.actionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                actionUrl
                              </a>
                            </>
                          ) : (
                            ' • actionUrl: missing'
                          )}
                          {brand.website ? (
                            <>
                              {' • '}
                              <a
                                href={brand.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                website
                              </a>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={`Edit ${brand.name}`}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(brand.id, 'brand')}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={`Toggle ${brand.name}`}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id, 'brand')}
                        className="text-red-400 hover:text-red-600"
                        aria-label={`Delete ${brand.name}`}
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
              {Array.isArray(benefits) &&
                benefits.map((benefit) => (
                  <li key={benefit.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                          checked={selectedIds.has(benefit.id)}
                          onChange={() => toggleSelected(benefit.id)}
                          aria-label={`Select ${benefit.title}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900">
                              {benefit.title}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                benefit.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {benefit.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {benefit.isFree && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Free
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                benefit.verified
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {benefit.verified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {benefit.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {benefit.redemptionMethod} · {benefit.validityType}
                            {benefit.validityDuration &&
                              ` · ${benefit.validityDuration} days`}
                            {' · '}
                            lastChecked: {formatChecked(benefit.lastChecked)}
                            {benefit.url ? (
                              <>
                                {' · '}
                                <a
                                  href={benefit.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  benefit URL
                                </a>
                              </>
                            ) : null}
                            {benefit.termsUrl ? (
                              <>
                                {' · '}
                                <a
                                  href={benefit.termsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  terms URL
                                </a>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleEdit(benefit)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label={`Edit ${benefit.title}`}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleActive(benefit.id, 'benefit')
                          }
                          className="text-gray-400 hover:text-gray-600"
                          aria-label={`Toggle ${benefit.title}`}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(benefit.id, 'benefit')}
                          className="text-red-400 hover:text-red-600"
                          aria-label={`Delete ${benefit.title}`}
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
