import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Info } from "lucide-react";

const currentYear = new Date().getFullYear();

export default function TermsPage() {
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
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">תנאי שימוש</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">תנאי שימוש</h1>
            
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 ml-2 text-green-600" />
                  קבלת התנאים
                </h2>
                <p className="leading-relaxed">
                  השימוש באתר YomU מהווה הסכמה לתנאי השימוש הללו. אם אינכם מסכימים לתנאים, אנא אל תשתמשו בשירות.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 ml-2 text-blue-600" />
                  שימוש בשירות
                </h2>
                <p className="leading-relaxed">
                  השירות מיועד לשימוש אישי בלבד. אסור להשתמש בשירות למטרות מסחריות או להפיץ מידע ללא אישור.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 ml-2 text-yellow-600" />
                  אחריות
                </h2>
                <p className="leading-relaxed">
                  אנו משתדלים לספק מידע מדויק, אך איננו אחראים לטעויות או למידע לא מעודכן. 
                  יש לוודא את פרטי ההטבות ישירות אצל הספקים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">שינויים בתנאים</h2>
                <p className="leading-relaxed">
                  אנו שומרים לעצמנו את הזכות לשנות תנאים אלו בכל עת. שינויים יובאו לידיעת המשתמשים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">ביטול חשבון</h2>
                <p className="leading-relaxed">
                  ניתן לבטל את החשבון בכל עת דרך הגדרות החשבון. ביטול החשבון יביא למחיקת כל הנתונים הקשורים.
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