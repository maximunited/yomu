import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Shield, Eye, Lock, User } from "lucide-react";

const currentYear = new Date().getFullYear();

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  חזרה
                </Button>
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">מדיניות פרטיות</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">מדיניות פרטיות</h1>
            
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <Eye className="w-5 h-5 ml-2" />
                  איסוף מידע
                </h2>
                <p className="leading-relaxed">
                  אנו אוספים מידע בסיסי כגון שם, כתובת דוא"ל ותאריך לידה כדי לספק לכם את השירות הטוב ביותר. 
                  המידע שלכם נשמר בצורה מאובטחת ולא יועבר לצדדים שלישיים ללא הסכמתכם המפורשת.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <Lock className="w-5 h-5 ml-2" />
                  אבטחה
                </h2>
                <p className="leading-relaxed">
                  אנו משתמשים בטכנולוגיות אבטחה מתקדמות כדי להגן על המידע שלכם. 
                  כל הנתונים מוצפנים ומועברים באמצעות חיבורים מאובטחים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 ml-2" />
                  זכויות המשתמש
                </h2>
                <p className="leading-relaxed">
                  יש לכם הזכות לבקש גישה למידע שלכם, לעדכן אותו או למחוק אותו בכל עת. 
                  ניתן ליצור איתנו קשר דרך דף "צור קשר" באתר.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">עדכונים למדיניות</h2>
                <p className="leading-relaxed">
                  מדיניות זו עשויה להתעדכן מעת לעת. שינויים משמעותיים יובאו לידיעתכם באמצעות הודעות באתר או בדוא"ל.
                </p>
              </section>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-500">
                  © {currentYear} YomU. כל הזכויות שמורות.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 