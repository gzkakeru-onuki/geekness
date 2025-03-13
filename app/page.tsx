import Image from "next/image";
import Link from "next/link";

export default function Geekness() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* ヒーローセクション */}
      <section className="relative h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/path/to/hero-image.jpg)' }}>
        <div className="container mx-auto px-6">
          <div className="text-center text-gray-900">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              エンジニアの実力を正確に評価する
            </h1>
            <p className="text-2xl md:text-3xl mb-8">
              採用支援プラットフォーム「Geekness」
            </p>
            <Link className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg" href="/auth/signup">
              無料で始める
            </Link>
            <Link className="ml-4 bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg" href="/auth/login">
              ログイン
            </Link>
          </div>
        </div>
        <div className="absolute bottom-10 w-full text-center">
          <div>
            <span className="text-gray-900 text-xl font-bold">詳しく見る</span>
            <div className="mt-2">↓</div>
          </div>
        </div>
      </section>

      {/* プラットフォームの機能 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            プラットフォームの機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">実技テストの自動生成</h3>
              <p className="text-gray-700 mb-4">AIが企業のニーズに基づいた実技テストを自動生成し、エンジニアの実力を正確に評価します。</p>
            </div>
            <div className="p-6 bg-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">スコアリングとマッチング</h3>
              <p className="text-gray-700 mb-4">AIによる自動スコアリングで、エンジニアのスキルを客観的に評価し、企業のニーズに合った人材をマッチングします。</p>
            </div>
            <div className="p-6 bg-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">コスト削減</h3>
              <p className="text-gray-700 mb-4">従来の採用プロセスに比べ、コストを大幅に削減しながら、より精度の高いスキル評価を実現します。</p>
            </div>
          </div>
        </div>
      </section>

      {/* プラン */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            プラン
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">従量課金制</h3>
              <p className="text-gray-700 mb-4">テスト実施回数に応じた課金で、必要な分だけ利用可能。</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">定額プラン</h3>
              <p className="text-gray-700 mb-4">月額固定で無制限に利用可能。採用コストを一定に保ちたい企業に最適。</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">カスタマイズプラン</h3>
              <p className="text-gray-700 mb-4">企業独自の評価基準を実装し、特定のニーズに応じたカスタマイズが可能。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4">会社概要</h3>
              <ul className="space-y-2">
                <li>会社名: Geekness株式会社</li>
                <li>設立: 2024年</li>
                <li>所在地: 東京都渋谷区</li>
                <li>事業内容: AIを活用した採用プラットフォームの開発・運営</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">サービス</h3>
              <ul className="space-y-2">
                <li>実技テスト自動生成</li>
                <li>AIスコアリング</li>
                <li>人材マッチング</li>
                <li>採用管理システム</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">サポート</h3>
              <ul className="space-y-2">
                <li>ご利用ガイド</li>
                <li>よくある質問</li>
                <li>お問い合わせ</li>
                <li>プライバシーポリシー</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">お問い合わせ</h3>
              <div className="space-y-4">
                <p>お気軽にご連絡ください</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
                  無料相談を予約
            </button>
                <div className="mt-4">
                  <p>メール: contact@geekness.co.jp</p>
                  <p>電話: 03-XXXX-XXXX</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-700 text-center">
            <p>© 2024 Geekness株式会社 All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
