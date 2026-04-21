import { useState, useEffect } from 'react';
import { videoAPI } from '../../services/api';
import VideoCard from '../../components/video/VideoCard';
import { FiSearch, FiVideo } from 'react-icons/fi';

const BrowseVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [page]);

  const fetchVideos = async () => {
    try {
      const res = await videoAPI.getAll({ page, limit: 12, search });
      setVideos(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    fetchVideos();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="section-title">Browse Lectures</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11 pr-24"
            placeholder="Search by title, topic, or tag..."
          />
          <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-primary px-4 py-1.5 text-sm">
            Search
          </button>
        </div>
      </form>

      {/* Grid */}
      {videos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    p === page
                      ? 'gradient-bg text-white shadow-neon'
                      : 'bg-surface-800/50 text-surface-400 hover:text-white hover:bg-surface-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-12 text-center">
          <FiVideo className="w-12 h-12 text-surface-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Videos Found</h3>
          <p className="text-surface-400">Try different search terms or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default BrowseVideos;
