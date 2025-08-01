"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, Circle } from "lucide-react";

interface Membership {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  icon: string;
  type: "free" | "paid";
  cost: string | null;
}

export default function MembershipsPage() {
  const [customMembership, setCustomMembership] = useState({
    name: "",
    description: "",
    category: ""
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [memberships, setMemberships] = useState<Membership[]>([
    {
      id: "1",
      name: "McDonald's",
      description: "הטבות על מזון מהיר",
      category: "food",
      isActive: true,
      icon: "/images/brands/mcdonalds.png",
      type: "free",
      cost: null
    },
    {
      id: "2",
      name: "Super-Pharm - LifeStyle",
      description: "הטבות על מוצרי בריאות ויופי",
      category: "health",
      isActive: true,
      icon: "/images/brands/super-pharm.png",
      type: "free",
      cost: null
    },
    {
      id: "3",
      name: "Fox - Dream Card",
      description: "הטבות על ביגוד והנעלה",
      category: "fashion",
      isActive: false,
      icon: "/images/brands/fox.png",
      type: "paid",
      cost: "₪99/שנה"
    },
    {
      id: "4",
      name: "Isracard",
      description: "הטבות על דלק ותחבורה",
      category: "transport",
      isActive: false,
      icon: "/images/brands/isracard.png",
      type: "free",
      cost: null
    },
    {
      id: "5",
      name: "H&M",
      description: "הטבות על ביגוד והנעלה",
      category: "fashion",
      isActive: false,
      icon: "/images/brands/hm.png",
      type: "free",
      cost: null
    },
    {
      id: "6",
      name: "BBB",
      description: "הטבות על מוצרי בית",
      category: "home",
      isActive: false,
      icon: "/images/brands/bbb.png",
      type: "free",
      cost: null
    },
    {
      id: "7",
      name: "Shufersal",
      description: "הטבות על מוצרי מזון",
      category: "grocery",
      isActive: false,
      icon: "/images/brands/shufersal.png",
      type: "free",
      cost: null
    },
    {
      id: "8",
      name: "Starbucks",
      description: "הטבות על קפה ומשקאות",
      category: "food",
      isActive: false,
      icon: "/images/brands/starbucks.png",
      type: "free",
      cost: null
    },
    {
      id: "9",
      name: "Max",
      description: "הטבות על ביגוד והנעלה",
      category: "fashion",
      isActive: false,
      icon: "/images/brands/max.png",
      type: "free",
      cost: null
    },
    {
      id: "10",
      name: "אסקייפרום",
      description: "50 שח הנחה בחודש יום הולדת",
      category: "entertainment",
      isActive: false,
      icon: "🎭",
      type: "free",
      cost: null
    },
    {
      id: "11",
      name: "מסעדת באקרו (רעננה)",
      description: "מנה ראשונה וקינוח מתנה",
      category: "food",
      isActive: false,
      icon: "🍽️",
      type: "free",
      cost: null
    },
    {
      id: "12",
      name: "שגב (מסעדה)",
      description: "מנה ראשונה",
      category: "food",
      isActive: false,
      icon: "🍴",
      type: "free",
      cost: null
    },
    {
      id: "13",
      name: "ג'מס",
      description: "חצי ליטר בירה",
      category: "food",
      isActive: false,
      icon: "🍺",
      type: "free",
      cost: null
    },
    {
      id: "14",
      name: "פראג הקטנה (מסעדה)",
      description: "50 נק' מתנה",
      category: "food",
      isActive: false,
      icon: "🍖",
      type: "free",
      cost: null
    },
    {
      id: "15",
      name: "מיקה חנויות נוחות",
      description: "10 שח מתנה בהצגת תעודה",
      category: "grocery",
      isActive: false,
      icon: "🏪",
      type: "free",
      cost: null
    },
    {
      id: "16",
      name: "KFC",
      description: "המבורגר 1+1",
      category: "food",
      isActive: false,
      icon: "/images/brands/kfc.png",
      type: "free",
      cost: null
    },
    {
      id: "17",
      name: "מנמ עשה זאת בעצמך",
      description: "50 שח מתנה (מעל 300)",
      category: "home",
      isActive: false,
      icon: "🔨",
      type: "free",
      cost: null
    },
    {
      id: "18",
      name: "שילב",
      description: "הטבות מיוחדות",
      category: "fashion",
      isActive: false,
      icon: "👕",
      type: "free",
      cost: null
    },
    {
      id: "19",
      name: "יומנגוס",
      description: "הטבות ייחודיות",
      category: "food",
      isActive: false,
      icon: "🍔",
      type: "free",
      cost: null
    },
    {
      id: "20",
      name: "M32 המבורגרים",
      description: "15% הנחה בחודש יום הולדת",
      category: "food",
      isActive: false,
      icon: "🍔",
      type: "free",
      cost: null
    },
    {
      id: "21",
      name: "מסעדת ליבירה",
      description: "בירה וקינוח בישיבה בלבד כל החודש",
      category: "food",
      isActive: false,
      icon: "🍺",
      type: "free",
      cost: null
    }
  ]);

  const toggleMembership = (id: string) => {
    setMemberships(prev => 
      prev.map(membership => 
        membership.id === id 
          ? { ...membership, isActive: !membership.isActive }
          : membership
      )
    );
  };

  const handleSaveChanges = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleAddCustomMembership = () => {
    if (customMembership.name && customMembership.description && customMembership.category) {
      const newMembership: Membership = {
        id: Date.now().toString(),
        name: customMembership.name,
        description: customMembership.description,
        category: customMembership.category,
        isActive: false,
        icon: "🏷️"
      };
      setMemberships(prev => [...prev, newMembership]);
      setCustomMembership({ name: "", description: "", category: "" });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      food: "bg-orange-100 text-orange-800",
      health: "bg-green-100 text-green-800",
      fashion: "bg-purple-100 text-purple-800",
      transport: "bg-blue-100 text-blue-800",
      home: "bg-yellow-100 text-yellow-800",
      grocery: "bg-pink-100 text-pink-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const activeCount = memberships.filter(m => m.isActive).length;

  // Filter memberships based on search and category
  const filteredMemberships = memberships.filter(membership => {
    const matchesSearch = membership.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         membership.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || membership.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  חזרה
                </Button>
              </Link>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ניהול חברויות</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {activeCount} מתוך {memberships.length} פעילים
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
                     {/* Instructions */}
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
             <p className="text-blue-800 text-sm">
               בחרו את כל תוכניות החברות שלכם כדי שנוכל להציג לכם את כל ההטבות ליום הולדת
             </p>
           </div>

           {/* Search and Filter */}
           <div className="mb-6 space-y-4">
             <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1">
                 <input
                   type="text"
                   placeholder="חפש חברויות..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                 />
               </div>
               <div className="md:w-48">
                 <select
                   value={selectedCategory}
                   onChange={(e) => setSelectedCategory(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                 >
                   <option value="">כל הקטגוריות</option>
                   <option value="food">מזון</option>
                   <option value="health">בריאות ויופי</option>
                   <option value="fashion">ביגוד והנעלה</option>
                   <option value="transport">תחבורה</option>
                   <option value="home">בית</option>
                   <option value="grocery">מזון</option>
                   <option value="entertainment">בידור</option>
                 </select>
               </div>
             </div>
             
             {/* Quick Filters */}
             <div className="flex flex-wrap gap-2">
               <button
                 onClick={() => setSelectedCategory("")}
                 className={`px-3 py-1 rounded-full text-sm font-medium ${
                   selectedCategory === "" 
                     ? "bg-purple-600 text-white" 
                     : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                 }`}
               >
                 הכל
               </button>
               <button
                 onClick={() => setSelectedCategory("food")}
                 className={`px-3 py-1 rounded-full text-sm font-medium ${
                   selectedCategory === "food" 
                     ? "bg-purple-600 text-white" 
                     : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                 }`}
               >
                 מזון
               </button>
               <button
                 onClick={() => setSelectedCategory("fashion")}
                 className={`px-3 py-1 rounded-full text-sm font-medium ${
                   selectedCategory === "fashion" 
                     ? "bg-purple-600 text-white" 
                     : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                 }`}
               >
                 אופנה
               </button>
               <button
                 onClick={() => setSelectedCategory("health")}
                 className={`px-3 py-1 rounded-full text-sm font-medium ${
                   selectedCategory === "health" 
                     ? "bg-purple-600 text-white" 
                     : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                 }`}
               >
                 בריאות
               </button>
             </div>
           </div>

                       {/* Memberships Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMemberships.map((membership) => (
                             <div
                 key={membership.id}
                 className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                   membership.isActive 
                     ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                     : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                 }`}
                 onClick={() => toggleMembership(membership.id)}
               >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {membership.icon.startsWith('/') ? (
                        <img 
                          src={membership.icon} 
                          alt={membership.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl">{membership.icon}</span>
                      )}
                    </div>
                    <div className="flex-1">
                                             <h3 className={`font-semibold ${
                         membership.isActive ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-white'
                       }`}>
                         {membership.name}
                       </h3>
                       <p className={`text-sm ${
                         membership.isActive ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'
                       }`}>
                         {membership.description}
                       </p>
                                             <div className="flex flex-wrap gap-2 mt-2">
                         <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                           getCategoryColor(membership.category)
                         }`}>
                           {membership.category}
                         </span>
                         <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                           membership.type === "free" 
                             ? "bg-green-100 text-green-800" 
                             : "bg-orange-100 text-orange-800"
                         }`}>
                           {membership.type === "free" ? "חינמי" : "בתשלום"}
                         </span>
                         {membership.cost && (
                           <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                             {membership.cost}
                           </span>
                         )}
                       </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {membership.isActive ? (
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

                     {/* Summary */}
           <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
             <div className="flex items-center justify-between">
               <div>
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                   נבחרו {activeCount} תוכניות
                 </h3>
                 <p className="text-sm text-gray-600 dark:text-gray-300">
                   ככל שתבחרו יותר תוכניות, כך תקבלו יותר הטבות ליום הולדת
                 </p>
               </div>
              <Button
                variant="default"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleSaveChanges}
              >
                שמור שינויים
              </Button>
            </div>
            {showSuccessMessage && (
              <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">השינויים נשמרו בהצלחה!</p>
              </div>
            )}
          </div>

                     {/* Add Custom Membership */}
           <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">הוסף חברות מותאמת אישית</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <input
               type="text"
               placeholder="שם החברות"
               value={customMembership.name}
               onChange={(e) => setCustomMembership(prev => ({ ...prev, name: e.target.value }))}
               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
             />
             <input
               type="text"
               placeholder="תיאור קצר"
               value={customMembership.description}
               onChange={(e) => setCustomMembership(prev => ({ ...prev, description: e.target.value }))}
               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
             />
             <select 
               value={customMembership.category}
               onChange={(e) => setCustomMembership(prev => ({ ...prev, category: e.target.value }))}
               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
             >
                <option value="">בחר קטגוריה</option>
                <option value="food">מזון</option>
                <option value="health">בריאות ויופי</option>
                <option value="fashion">ביגוד והנעלה</option>
                <option value="transport">תחבורה</option>
                <option value="home">בית</option>
                <option value="grocery">מזון</option>
              </select>
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                onClick={handleAddCustomMembership}
              >
                <Plus className="w-4 h-4 ml-2" />
                הוסף חברות
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 