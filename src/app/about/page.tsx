"use client";

import { Users, Target, Eye, User, Palette } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import PageHeader from "@/components/PageHeader";

export default function AboutPage() {
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"
      }`}
    >
      <PageHeader title={t("about")} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1
              className={`text-4xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t("aboutTitle")}
            </h1>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {t("aboutDescription")}
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div
              className={`rounded-lg p-6 shadow-lg ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-purple-600 mr-3" />
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t("mission")}
                </h2>
              </div>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                {t("missionDescription")}
              </p>
            </div>

            <div
              className={`rounded-lg p-6 shadow-lg ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center mb-4">
                <Eye className="w-8 h-8 text-pink-600 mr-3" />
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t("vision")}
                </h2>
              </div>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                {t("visionDescription")}
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div
            className={`rounded-lg p-8 shadow-lg mb-8 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-orange-600 mr-3" />
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t("team")}
                </h2>
              </div>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                {t("contributorsDescription")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t("leadDeveloper")}
                </h3>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  Lead Developer
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-10 h-10 text-white" />
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t("uxDesigner")}
                </h3>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  UX/UI Designer
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t("productManager")}
                </h3>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  Product Manager
                </p>
              </div>
            </div>
          </div>

          {/* Contributors */}
          <div
            className={`rounded-lg p-8 shadow-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-6 text-center ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t("contributors")}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className={`border rounded-lg p-4 ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <h3
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t("contentContributors")}
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {t("contentContributorsDescription")}
                </p>
              </div>
              <div
                className={`border rounded-lg p-4 ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <h3
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t("qualityAssurance")}
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {t("qualityAssuranceDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
