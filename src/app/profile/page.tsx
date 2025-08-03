"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, User, Mail, Calendar, Bell, Shield, LogOut, Edit, Save, Heart } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: session?.user?.name || "משתמש",
    email: session?.user?.email || "user@example.com",
    dateOfBirth: "1990-01-01",
    anniversaryDate: "",
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
  };

  const handleLogout = () => {
    // In a real app, this would call NextAuth signOut
    console.log("Logging out...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  חזרה
                </Button>
              </Link>
              <span className="text-xl font-bold text-gray-900">פרופיל</span>
            </div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  ביטול
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4 ml-1" />
                  שמור
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 ml-1" />
                ערוך
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.name}
                </h1>
                <p className="text-gray-600">{userData.email}</p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">מידע אישי</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם מלא
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    דוא"ל
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    תאריך לידה
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={userData.dateOfBirth}
                      onChange={(e) => setUserData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {new Date(userData.dateOfBirth).toLocaleDateString('he-IL')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Heart className="w-4 h-4 ml-1 text-gray-500" />
                    תאריך יום נישואין
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={userData.anniversaryDate}
                      onChange={(e) => setUserData(prev => ({ ...prev, anniversaryDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {userData.anniversaryDate 
                        ? new Date(userData.anniversaryDate).toLocaleDateString('he-IL')
                        : "לא הוגדר"
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 ml-2" />
              הגדרות התראות
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">התראות דוא"ל</h3>
                  <p className="text-sm text-gray-600">קבל התראות על הטבות חדשות</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData.notifications.email}
                    onChange={(e) => setUserData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">התראות דחיפה</h3>
                  <p className="text-sm text-gray-600">קבל התראות מיידיות</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData.notifications.push}
                    onChange={(e) => setUserData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">הודעות SMS</h3>
                  <p className="text-sm text-gray-600">קבל התראות בטקסט</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData.notifications.sms}
                    onChange={(e) => setUserData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, sms: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 ml-2" />
              פעולות חשבון
            </h2>
            
            <div className="space-y-4">
              <Link href="/privacy">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 ml-2" />
                  מדיניות פרטיות
                </Button>
              </Link>
              
              <Link href="/terms">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 ml-2" />
                  תנאי שימוש
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 ml-2" />
                  צור קשר
                </Button>
              </Link>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 ml-2" />
                התנתק
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 