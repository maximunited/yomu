"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Brand, Benefit } from "@/types/admin";

interface AdminFormProps {
  type: "brand" | "benefit";
  item?: Brand | Benefit;
  brands?: Brand[];
  onSave: (data: Partial<Brand> | Partial<Benefit>) => void | Promise<void>;
  onCancel: () => void;
}

export default function AdminForm({
  type,
  item,
  brands,
  onSave,
  onCancel,
}: AdminFormProps) {
  const [formData, setFormData] = useState<Partial<Brand> | Partial<Benefit>>({
    name: "",
    logoUrl: "",
    website: "",
    description: "",
    category: "",
    isActive: true,
    ...(type === "benefit" && {
      brandId: "",
      title: "",
      redemptionMethod: "",
      validityType: "",
      isFree: true,
    }),
  } as Partial<Brand> | Partial<Benefit>);

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {item ? "Edit" : "Add"} {type === "brand" ? "Brand" : "Benefit"}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "brand" ? (
              <>
                <div>
                  <label
                    htmlFor="brand-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    id="brand-name"
                    type="text"
                    value={(formData as Brand).name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="brand-logoUrl"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Logo URL
                  </label>
                  <input
                    id="brand-logoUrl"
                    type="text"
                    placeholder="https://... or /images/brands/..."
                    value={(formData as Brand).logoUrl ?? ""}
                    onChange={(e) => handleChange("logoUrl", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="brand-website"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Website
                  </label>
                  <input
                    id="brand-website"
                    type="url"
                    value={(formData as Brand).website ?? ""}
                    onChange={(e) => handleChange("website", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="brand-description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="brand-description"
                    value={(formData as Brand).description ?? ""}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="brand-category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    id="brand-category"
                    value={(formData as Brand).category ?? ""}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="food">Food</option>
                    <option value="fashion">Fashion</option>
                    <option value="health">Health</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="transport">Transport</option>
                    <option value="home">Home</option>
                    <option value="grocery">Grocery</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="brand-actionUrl"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Action URL
                  </label>
                  <input
                    id="brand-actionUrl"
                    type="url"
                    value={(formData as Brand).actionUrl || ""}
                    onChange={(e) => handleChange("actionUrl", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="brand-actionType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Action Type
                  </label>
                  <input
                    id="brand-actionType"
                    type="text"
                    value={(formData as Brand).actionType || ""}
                    onChange={(e) => handleChange("actionType", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="brand-actionLabel"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Action Label
                  </label>
                  <input
                    id="brand-actionLabel"
                    type="text"
                    value={(formData as Brand).actionLabel || ""}
                    onChange={(e) =>
                      handleChange("actionLabel", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="benefit-brandId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Brand
                  </label>
                  <select
                    id="benefit-brandId"
                    value={(formData as Benefit).brandId ?? ""}
                    onChange={(e) => handleChange("brandId", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Select brand</option>
                    {brands?.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="benefit-title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    id="benefit-title"
                    type="text"
                    value={(formData as Benefit).title ?? ""}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="benefit-description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="benefit-description"
                    value={(formData as Benefit).description ?? ""}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="benefit-terms"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Terms & Conditions
                  </label>
                  <textarea
                    id="benefit-terms"
                    value={(formData as Benefit).termsAndConditions || ""}
                    onChange={(e) =>
                      handleChange("termsAndConditions", e.target.value)
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="benefit-redemptionMethod"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Redemption Method
                  </label>
                  <input
                    id="benefit-redemptionMethod"
                    type="text"
                    value={(formData as Benefit).redemptionMethod ?? ""}
                    onChange={(e) =>
                      handleChange("redemptionMethod", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="benefit-promoCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Promo Code
                  </label>
                  <input
                    id="benefit-promoCode"
                    type="text"
                    value={(formData as Benefit).promoCode || ""}
                    onChange={(e) => handleChange("promoCode", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="benefit-url"
                    className="block text-sm font-medium text-gray-700"
                  >
                    URL
                  </label>
                  <input
                    id="benefit-url"
                    type="url"
                    value={(formData as Benefit).url || ""}
                    onChange={(e) => handleChange("url", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="benefit-validityType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Validity Type
                  </label>
                  <select
                    id="benefit-validityType"
                    value={(formData as Benefit).validityType ?? ""}
                    onChange={(e) =>
                      handleChange("validityType", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Select validity type</option>
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One Time</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="benefit-validityDuration"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Validity Duration (days)
                  </label>
                  <input
                    id="benefit-validityDuration"
                    type="number"
                    value={
                      ((formData as Benefit).validityDuration ?? "") as any
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange(
                        "validityDuration",
                        val === "" ? undefined : parseInt(val),
                      );
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="benefit-isFree"
                    type="checkbox"
                    checked={Boolean((formData as Benefit).isFree)}
                    onChange={(e) =>
                      handleChange("isFree", Boolean(e.target.checked))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="benefit-isFree"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Free benefit
                  </label>
                </div>
              </>
            )}

            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={Boolean((formData as Brand | Benefit).isActive)}
                onChange={(e) =>
                  handleChange("isActive", Boolean(e.target.checked))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-900"
              >
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {item ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
