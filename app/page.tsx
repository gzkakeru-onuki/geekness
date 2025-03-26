"use client";

import Image from "next/image";
import Link from "next/link";
import PlanPopup from "./components/PlanPopup";
import { useState } from "react";

export default function Geekness() {
  const [selectedPlan, setSelectedPlan] = useState<{
    title: string;
    price: string;
    description: string;
    features: string[];
  } | null>(null);

  const plans = {
    payAsYouGo: {
      title: "従量課金制",
      price: "¥1,000/テスト",
      description: "必要な分だけ利用できる柔軟なプラン",
      features: [
        "必要な分だけ利用可能",
        "基本機能が利用可能",
        "サポート対応",
        "テスト結果の分析",
        "基本的なレポート機能"
      ]
    },
    monthly: {
      title: "定額プラン",
      price: "¥50,000/月",
      description: "無制限のテスト実施が可能な定額プラン",
      features: [
        "無制限のテスト実施",
        "高度な分析機能",
        "優先サポート",
        "カスタマイズ可能なテスト",
        "詳細なレポート機能",
        "APIアクセス"
      ]
    },
    custom: {
      title: "カスタマイズプラン",
      price: "要相談",
      description: "企業のニーズに合わせたカスタマイズプラン",
      features: [
        "カスタマイズ可能",
        "専任サポート",
        "導入支援",
        "完全なカスタマイズ機能",
        "独自の分析機能",
        "SLA保証"
      ]
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* ヒーローセクション */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 背景アニメーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 animate-gradient">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          {/* 装飾的な要素 */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center">
            <div className="inline-block">
              <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold mb-6 animate-fade-in">
                AI-Powered Recruitment Platform
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 animate-fade-in-up">
              ようこそ、
              <br />
              AI時代の選考プロセスへ
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-gray-700 animate-fade-in-up animation-delay-200">
              採用支援プラットフォーム「Geekness」
            </p>
            <div className="flex justify-center gap-4 animate-fade-in-up animation-delay-400">
              <Link
                className="group bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
                href="/auth/signup"
              >
                <span>無料で始める</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                className="bg-white hover:bg-gray-50 text-indigo-600 font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-indigo-600"
                href="/auth/login"
              >
                ログイン
              </Link>
            </div>
          </div>
        </div>

        {/* スクロールインジケーター */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-center">
            <span className="text-gray-600 text-lg font-medium">詳しく見る</span>
            <svg className="w-6 h-6 mx-auto mt-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* プラットフォームの機能 */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                提供機能
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AIを活用した最新の採用支援プラットフォームで、効率的な人材採用を実現します
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 bg-white rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                  <svg className="w-8 h-8 text-indigo-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-800">実技テストの自動生成</h3>
                <p className="text-gray-600">AIが企業のニーズに基づいた実技テストを自動生成し、エンジニアの実力を正確に評価します。</p>
              </div>
            </div>
            <div className="group p-8 bg-white rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <svg className="w-8 h-8 text-indigo-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">スコアリングとマッチング</h3>
              <p className="text-gray-600">AIによる自動スコアリングで、エンジニアのスキルを客観的に評価し、企業のニーズに合った人材をマッチングします。</p>
            </div>
            <div className="group p-8 bg-white rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <svg className="w-8 h-8 text-indigo-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">コスト削減</h3>
              <p className="text-gray-600">従来の採用プロセスに比べ、コストを大幅に削減しながら、より精度の高いスキル評価を実現します。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 人材ミスマッチの課題 */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
                人材ミスマッチの課題
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              従来の採用プロセスでは、以下のような問題が発生しています
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-red-50 p-8 rounded-2xl border border-red-100">
              <h3 className="text-2xl font-bold text-red-600 mb-4">企業側の課題</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-gray-700">スキル評価の主観性による誤判断</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-gray-700">採用コストと時間の浪費</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-gray-700">早期離職による損失</span>
                </li>
              </ul>
            </div>
            <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100">
              <h3 className="text-2xl font-bold text-orange-600 mb-4">求職者側の課題</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-orange-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-gray-700">適性とスキルの不一致</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-orange-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-gray-700">キャリアパスの不明確さ</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-orange-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-gray-700">スキル評価の不透明性</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Geeknessの解決策 */}
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Geeknessがもたらす選考プロセスの答え
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Geeknessが提供する次世代の採用ソリューション
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">高速な採用プロセス</h3>
              <p className="text-gray-600">AIによる自動評価で、採用プロセスを大幅に短縮。企業と求職者の時間を節約します。</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">正確なスキル評価</h3>
              <p className="text-gray-600">AIによる客観的な評価で、求職者の実力を正確に把握。ミスマッチを防ぎます。</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">コスト削減</h3>
              <p className="text-gray-600">採用プロセスの効率化により、コストを大幅に削減。早期離職のリスクも軽減します。</p>
            </div>
          </div>
        </div>
      </section>

      {/* プラン */}
      <section className="py-20 bg-gradient-to-b from-white to-indigo-50 relative overflow-hidden">
        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                料金プラン
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              企業の規模やニーズに合わせて、最適なプランを選択できます
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden cursor-pointer"
              onClick={() => setSelectedPlan(plans.payAsYouGo)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">従量課金制</h3>
                  <p className="text-4xl font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors duration-300">¥1,000<span className="text-lg text-gray-500">/テスト</span></p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    必要な分だけ利用可能
                  </li>
                  <li className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    基本機能が利用可能
                  </li>
                  <li className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    サポート対応
                  </li>
                </ul>
                <button className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  プランを選択
                </button>
              </div>
            </div>
            <div
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-indigo-600 relative overflow-hidden cursor-pointer"
              onClick={() => setSelectedPlan(plans.monthly)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">定額プラン</h3>
                  <p className="text-4xl font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors duration-300">¥50,000<span className="text-lg text-gray-500">/月</span></p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    無制限のテスト実施
                  </li>
                  <li className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    高度な分析機能
                  </li>
                  <li className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    優先サポート
                  </li>
                </ul>
                <button className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  プランを選択
                </button>
              </div>
            </div>
            <div
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden cursor-pointer"
              onClick={() => setSelectedPlan(plans.custom)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">カスタマイズプラン</h3>
                  <p className="text-4xl font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors duration-300">要相談</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    カスタマイズ可能
                  </li>
                  <li className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    専任サポート
                  </li>
                  <li className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    導入支援
                  </li>
                </ul>
                <button className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  お問い合わせ
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* プランポップアップ */}
      <PlanPopup
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        plan={selectedPlan || plans.payAsYouGo}
      />

      {/* CTAセクション */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="group">
              <h3 className="text-xl font-bold mb-4 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">会社概要</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="group-hover:text-white transition-colors duration-300">会社名: Geekness株式会社</li>
                <li className="group-hover:text-white transition-colors duration-300">設立: 2024年</li>
                <li className="group-hover:text-white transition-colors duration-300">所在地: 東京都渋谷区</li>
                <li className="group-hover:text-white transition-colors duration-300">事業内容: AIを活用した採用プラットフォームの開発・運営</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-indigo-400">サービス</h3>
              <ul className="space-y-2 text-gray-300">
                <li>実技テスト自動生成</li>
                <li>AIスコアリング</li>
                <li>人材マッチング</li>
                <li>採用管理システム</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-indigo-400">サポート</h3>
              <ul className="space-y-2 text-gray-300">
                <li>ご利用ガイド</li>
                <li>よくある質問</li>
                <li>お問い合わせ</li>
                <li>プライバシーポリシー</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-indigo-400">お問い合わせ</h3>
              <div className="space-y-4">
                <p className="text-gray-300">お気軽にご連絡ください</p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 transform hover:-translate-y-1">
                  無料相談を予約
                </button>
                <div className="mt-4 text-gray-300">
                  <p>メール: contact@geekness.co.jp</p>
                  <p>電話: 03-XXXX-XXXX</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2024 Geekness株式会社 All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
