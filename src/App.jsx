import { useState, useEffect } from "react";
import LightRays from './components/LightRays/LightRays';

const App = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMore, setShowMore] = useState(false);

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) {
        return "Tanggal tidak valid";
      }
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return "Tanggal tidak valid";
    }
  };

  // Asynchronously fetches news from multiple APIs
  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    const NEWSAPI_URL = `https://newsapi.org/v2/everything?q=artificial+intelligence&apiKey=${import.meta.env.VITE_NEWSAPI_KEY}`;
    const GNEWS_URL = `https://gnews.io/api/v4/search?q=artificial+intelligence&lang=en&token=${import.meta.env.VITE_GNEWS_KEY}`;
    const NEWSDATA_URL = `https://newsdata.io/api/1/news?apikey=${import.meta.env.VITE_NEWSDATA_KEY}&q=artificial+intelligence&language=en`;

    try {
      const [newsapiRes, gnewsRes, newsdataRes] = await Promise.all([
        fetch(NEWSAPI_URL).then(res => res.json()),
        fetch(GNEWS_URL).then(res => res.json()),
        fetch(NEWSDATA_URL).then(res => res.json())
      ]);

      const newsapiArticles = (newsapiRes.articles || []).map(a => ({
        source: { name: a.source?.name || "NewsAPI" },
        title: a.title,
        url: a.url,
        publishedAt: a.publishedAt,
        description: a.description,
        urlToImage: a.urlToImage
      }));

      const gnewsArticles = (gnewsRes.articles || []).map(a => ({
        source: { name: a.source?.name || "GNews" },
        title: a.title,
        url: a.url,
        publishedAt: a.publishedAt,
        description: a.description,
        urlToImage: a.image
      }));

      const newsdataArticles = (newsdataRes.results || []).map(a => ({
        source: { name: a.source_id || "NewsData.io" },
        title: a.title,
        url: a.link,
        publishedAt: a.pubDate,
        description: a.description,
        urlToImage: a.image_url
      }));

      const combinedNews = [...newsapiArticles, ...gnewsArticles, ...newsdataArticles]
        .filter(article => article.title && article.url && article.urlToImage)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      setNews(combinedNews);
      setFilteredNews(combinedNews);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat berita. Periksa koneksi atau API keys Anda.');
      setNews([]);
      setFilteredNews([]);
    } finally {
      setLoading(false);
    }
  };

  // Handles search input changes
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setShowMore(false); // Reset to show less when a new search begins
  };

  // Fetches news on initial component mount
  useEffect(() => {
    fetchNews();
  }, []);

  // Filters news whenever searchQuery or news changes
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const results = news.filter(article =>
      article.title?.toLowerCase().includes(lowerCaseQuery) ||
      article.description?.toLowerCase().includes(lowerCaseQuery) ||
      article.source?.name?.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredNews(results);
  }, [searchQuery, news]);

  // Article partitioning for different layouts
  const bentoArticles = filteredNews.slice(0, 5);
  const featuredArticle = bentoArticles[0];
  const secondaryArticles = bentoArticles.slice(1);
  const carouselArticles = filteredNews.slice(5, 15);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-gray-100 font-sans">

      <header className="relative overflow-hidden mb-12 min-h-[50vh] md:min-h-screen flex flex-col items-start justify-center text-left px-4 md:items-center md:justify-center md:text-center">
        <div className="absolute inset-0 z-0">
          <LightRays
            raysOrigin="top-center"
            raysColor="#00ffff"
            raysSpeed={1.5}
            lightSpread={0.8}
            rayLength={1.2}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.05}
          />
        </div>
        <div className="relative z-10 w-full max-w-xl lg:max-w-3xl mx-auto py-12">
          <h1 className="text-8xl sm:text-8xl lg:text-8xl font-bold text-white mb-4">
            Digital <span className="text-cyan-300">Hero</span>
          </h1>
          <p className="text-blue-200 text-lg sm:text-xl mb-8 leading-relaxed">
            Temukan berita terdepan tentang kecerdasan buatan dari berbagai sumber tepercaya
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari berita..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-14 pl-14 pr-6 rounded-full bg-white bg-opacity-95 text-gray-800 placeholder-gray-500 shadow-2xl border-0 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:bg-opacity-100 transition-all duration-300 text-lg"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-0">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-300 rounded-full animate-spin border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-slate-300 font-medium">Mengambil berita terbaru...</p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-16 h-16 bg-red-900 bg-opacity-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Oops! Terjadi Kesalahan</h3>
            <p className="text-slate-400">{error}</p>
          </div>
        )}

        {!loading && !error && filteredNews.length === 0 && searchQuery && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Tidak Ada Hasil</h3>
            <p className="text-slate-400 mb-4">Tidak ditemukan artikel untuk "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Lihat Semua Artikel
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {!showMore && bentoArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-100 mb-6 border-b border-slate-700 pb-2">Berita Teratas</h2>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-auto">
                  {/* Featured Article */}
                  {featuredArticle && (
                    <article className="lg:col-span-2 lg:row-span-2 group">
                      <a
                        href={featuredArticle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full"
                      >
                        <div className="bg-slate-800 rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-blue-900/50 hover:-translate-y-2 border border-slate-700 min-h-[500px]">
                          <div className="relative overflow-hidden h-64 lg:h-80">
                            <img
                              src={featuredArticle.urlToImage || 'https://placehold.co/600x400/4a5568/a0aec0?text=Gambar+Tidak+Ditemukan'}
                              alt={featuredArticle.title}
                              onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/4a5568/a0aec0?text=Gambar+Tidak+Ditemukan'; }}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                            <div className="absolute top-6 left-6">
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white backdrop-blur-sm">
                                {featuredArticle.source.name}
                              </span>
                            </div>
                            <div className="absolute top-6 right-6">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-900 bg-opacity-70 text-blue-300 backdrop-blur-sm">
                                Featured
                              </span>
                            </div>
                          </div>
                          <div className="p-8 flex flex-col flex-grow">
                            <h2 className="font-bold text-2xl lg:text-3xl mb-4 text-slate-100 group-hover:text-blue-400 transition-colors duration-300 leading-tight">
                              {featuredArticle.title}
                            </h2>
                            <p className="text-slate-300 mb-6 leading-relaxed flex-grow text-lg">
                              {featuredArticle.description}
                            </p>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-700">
                              <span className="text-sm font-medium text-blue-400">
                                {featuredArticle.source.name}
                              </span>
                              <time className="text-sm text-slate-400">
                                {formatDate(featuredArticle.publishedAt)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </a>
                    </article>
                  )}
                  {/* Secondary Articles */}
                  {secondaryArticles.slice(0, 4).map((article, index) => (
                    <article key={index} className="group">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full"
                      >
                        <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-blue-900/50 hover:-translate-y-1 border border-slate-700 min-h-[300px]">
                          <div className="relative overflow-hidden h-40">
                            <img
                              src={article.urlToImage || 'https://placehold.co/600x400/4a5568/a0aec0?text=Gambar+Tidak+Ditemukan'}
                              alt={article.title}
                              onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/4a5568/a0aec0?text=Gambar+Tidak+Ditemukan'; }}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-70"></div>
                            <div className="absolute top-3 left-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-700 bg-opacity-80 text-blue-200 backdrop-blur-sm">
                                {article.source.name}
                              </span>
                            </div>
                          </div>
                          <div className="p-5 flex flex-col flex-grow">
                            <h3 className="font-bold text-lg mb-3 text-slate-100 group-hover:text-blue-400 transition-colors duration-300 leading-tight line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-slate-300 mb-4 leading-relaxed flex-grow line-clamp-3 text-sm">
                              {article.description}
                            </p>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                              <time className="text-xs text-slate-400">
                                {formatDate(article.publishedAt)}
                              </time>
                              <div className="flex items-center gap-1 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                                <span className="text-xs font-medium">Baca</span>
                                <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Horizontal Carousel Section */}
            {!showMore && carouselArticles.length > 0 && (
              <section className="mb-12 scrollbar-hide">
                <h2 className="text-2xl font-bold text-slate-100 mb-6 border-b border-slate-700 pb-2">Jelajahi Berita Lain</h2>
                <div className="flex overflow-x-auto gap-6 pb-4 -mx-6 px-6 scroll-smooth scrollbar-hide lg:-mx-10 lg:px-10 max-w-screen w-full">
                  {carouselArticles.map((article, index) => (
                    <article key={index} className="flex-none w-72 sm:w-80 group">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full"
                      >
                        <div className="bg-slate-800 rounded-3xl shadow-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-blue-900/50 hover:-translate-y-1 border border-slate-700">
                          <div className="relative overflow-hidden h-40">
                            <img
                              src={article.urlToImage || 'https://placehold.co/600x400/4a5568/a0aec0?text=Gambar+Tidak+Ditemukan'}
                              alt={article.title}
                              onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/4a5568/a0aec0?text=Gambar+Tidak+Ditemukan'; }}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-70"></div>
                            <div className="absolute top-3 left-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-700 bg-opacity-80 text-blue-200 backdrop-blur-sm">
                                {article.source.name}
                              </span>
                            </div>
                          </div>
                          <div className="p-5 flex flex-col flex-grow">
                            <h3 className="font-bold text-lg mb-3 text-slate-100 group-hover:text-blue-400 transition-colors duration-300 leading-tight line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-slate-300 mb-4 leading-relaxed flex-grow line-clamp-3 text-sm">
                              {article.description}
                            </p>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                              <time className="text-xs text-slate-400">
                                {formatDate(article.publishedAt)}
                              </time>
                              <div className="flex items-center gap-1 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                                <span className="text-xs font-medium">Baca</span>
                                <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Regular Grid View (all articles) when "Show More" is clicked */}
            {showMore && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-100 mb-6 border-b border-slate-700 pb-2">Semua Artikel</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredNews.map((article, index) => (
                    <article key={index} className="group">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full"
                      >
                        <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-blue-900/50 hover:-translate-y-1 border border-slate-700">
                          <div className="relative overflow-hidden h-48">
                            <img
                              src={article.urlToImage || 'https://placehold.co/600x400/4a5568/a0aec0?text=Gambar+Tidak+Ditemukan'}
                              alt={article.title}
                              onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/4a5568/a0aec0?text=Gambar+Tidak+Ditemukan'; }}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-70"></div>
                            <div className="absolute top-4 left-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-700 bg-opacity-80 text-blue-200 backdrop-blur-sm">
                                {article.source.name}
                              </span>
                            </div>
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            <h3 className="font-bold text-xl mb-3 text-slate-100 group-hover:text-blue-400 transition-colors duration-300 leading-tight line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-slate-300 mb-4 leading-relaxed flex-grow line-clamp-3">
                              {article.description}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                              <span className="text-sm font-medium text-blue-400">
                                {article.source.name}
                              </span>
                              <time className="text-sm text-slate-400">
                                {formatDate(article.publishedAt)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Show More/Less Button */}
            {filteredNews.length > 5 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="px-8 py-4 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-900/50"
                >
                  {showMore ? (
                    <>
                      <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      Tampilkan Lebih Sedikit
                    </>
                  ) : (
                    <>
                      Tampilkan Lebih Banyak ({filteredNews.length - 5} lainnya)
                      <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white/55 mt-16">
            <div className="p-6 text-center">
              <p>&copy; 2024 Digital Hero. All rights reserved.</p>
            </div>
      </footer>
    </div>
  );
};

export default App;