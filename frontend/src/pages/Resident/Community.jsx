import React, { useState } from 'react';
import { Search, PlusCircle, Users, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import CommunityGroup from "../../assets/CommunityGroup.jpg";
import { motion } from 'framer-motion';


const initialCommunities = [
  { id: 1, name: 'Pet Pals United', description: 'For animal lovers in the city.', members: 70, joined: false, image: '/community-hero.jpg' },
  { id: 2, name: 'City Cyclists', description: 'Group rides and route sharing.', members: 52, joined: true, image: '/community-hero.jpg' },
  { id: 3, name: 'Downtown Gardeners', description: 'Community green space development.', members: 38, joined: false, image: '/community-hero.jpg' },
  { id: 4, name: 'Tech Innovators Hub', description: 'Weekly workshops and brainstorming.', members: 125, joined: false, image: '/community-hero.jpg' },
  { id: 5, name: 'Local Bookworms', description: 'Monthly book discussions.', members: 45, joined: true, image: '/community-hero.jpg' },
  { id: 6, name: 'Sunday Hikers', description: 'Exploring local trails.', members: 89, joined: false, image: '/community-hero.jpg' },
  { id: 7, name: 'Moms & Tots Playgroup', description: 'Weekday meetups at the park.', members: 31, joined: false, image: '/community-hero.jpg' },
  { id: 8, name: 'Coffee Connoisseurs', description: 'Tasting local cafes.', members: 28, joined: true, image: '/community-hero.jpg' },
  { id: 9, name: 'Photography Club', description: 'Sharpening skills together.', members: 66, joined: false, image: '/community-hero.jpg' },
  { id: 10, name: 'Yoga & Wellness', description: 'Daily sessions in the park.', members: 49, joined: false, image: '/community-hero.jpg' },
  { id: 11, name: 'Vinyl Collectors', description: 'Trading and listening sessions.', members: 19, joined: false, image: '/community-hero.jpg' },
  { id: 12, name: 'Code & Coffee', description: 'Casual co-working.', members: 33, joined: false, image: '/community-hero.jpg' },
];

const ITEMS_PER_PAGE = 6;

export default function CommunityGroups() {
  const [activeTab, setActiveTab] = useState('all');
  const [communities, setCommunities] = useState(initialCommunities);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);


  const filteredCommunities = communities.filter((community) => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'my' && community.joined);
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredCommunities.length / ITEMS_PER_PAGE);
  const paginatedCommunities = filteredCommunities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleJoinToggle = (id) => {
    setCommunities(prevCommunities =>
      prevCommunities.map(comm =>
        comm.id === id ? { ...comm, joined: !comm.joined } : comm
      )
    );
  };

  const totalCommunitiesCount = communities.length;
  const myCommunitiesCount = communities.filter(c => c.joined).length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

    <header className="bg-white py-12 px-6 md:px-12 border-b border-gray-100 mt-16">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-6">
        
        <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="text-secondary">Welcome to </span>
            <span className="text-primary">our</span><br/>
            <span className="text-secondary italic font-medium">Community Group</span>
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl font-thin ml-2">
            Where <span className='text-secondary'>interest</span> turn into communities that truly <span className='text-secondary'>thrive.</span>
            </p>
        </div>
        </div>

        <button className="bg-orange-500 hover:bg-secondary text-white font-semibold px-8 py-3 rounded-full text-lg shadow-md flex items-center gap-2 transition-all">
        <PlusCircle size={22} />
        Start a New Group
        </button>
    </div>
    </header>
    <section className="w-full overflow-hidden">
    <div className="w-full h-[350px] md:h-[500px] overflow-hidden">
        <img
        src={CommunityGroup}
        alt="Diverse group of people in a circle hugging at sunset"
        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
        />
    </div>
    </section>
      {/* --- Connect Section --- */}
      <section className="mt-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-secondary tracking-tight">
          Connect with your <br className="sm:hidden"/> Community
        </h2>
        <div className="mt-10 h-1 w-full max-w-20xl mx-auto bg-primary rounded-full"></div>
      </section>

      {/* --- Controls Section (Tabs & Search) --- */}
      <section className="mt-12 px-6 md:px-12 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="flex items-center gap-8 text-lg font-medium w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={`pb-2 border-b-4 ${activeTab === 'all' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            All Communities <span className="ml-2 bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">{totalCommunitiesCount}</span>
          </button>
          <button
            onClick={() => { setActiveTab('my'); setCurrentPage(1); }}
            className={`pb-2 border-b-4 ${activeTab === 'my' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            My Communities <span className="ml-2 bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">{myCommunitiesCount}</span>
          </button>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
          <input
            type="text"
            placeholder="Search community..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>
      </section>

      {/* --- Community Grid Section --- */}
      <section className="mt-10 px-6 md:px-12 max-w-7xl mx-auto">
        {paginatedCommunities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedCommunities.map((community) => (
              <div
                key={community.id}
                className={`bg-white p-6 rounded-3xl shadow-lg border-t-8 ${community.joined ? 'border-emerald-700' : 'border-transparent'} group hover:shadow-2xl transition-all flex flex-col`}
              >
                <div className="relative mb-6">
                  <img
                    src={community.image}
                    alt={community.name}
                    className="w-full h-56 object-cover rounded-2xl"
                  />
                  {community.joined && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-800 font-bold px-4 py-1 rounded-full text-xs shadow-sm flex items-center gap-1.5">
                      <MessageCircle size={14} /> My Feed
                    </div>
                  )}
                </div>
                <div className='flex-grow'>
                  <h3 className="text-2xl font-semibold text-gray-950">{community.name}</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed line-clamp-2">{community.description}</p>
                  <div className="mt-5 flex items-center gap-2 text-gray-500 font-medium">
                    <Users size={20} className="text-emerald-600" />
                    <span>{community.members} members</span>
                  </div>
                </div>
                <button
                  onClick={() => handleJoinToggle(community.id)}
                  className={`mt-8 w-full py-3 rounded-full text-lg font-semibold transition-all flex items-center justify-center gap-2 ${community.joined ? 'bg-emerald-700 hover:bg-emerald-800 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'}`}
                >
                  {community.joined ? (
                    <><MessageCircle size={20}/> Open Feed</>
                  ) : (
                    <><PlusCircle size={20} /> Join Community</>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-inner border border-gray-100">
            <Users size={64} className="mx-auto text-gray-300" />
            <h3 className="mt-6 text-3xl font-bold text-gray-700">No communities found</h3>
            <p className="mt-3 text-lg text-gray-500">Try adjusting your search or start your own community!</p>
          </div>
        )}
      </section>

      {/* --- Pagination Controls --- */}
      {totalPages > 1 && (
        <section className="mt-16 mb-24 px-6 md:px-12 max-w-7xl mx-auto flex justify-center items-center gap-5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`p-3 rounded-full border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
          >
            <ChevronLeft size={28} />
          </button>

          <div className='flex gap-2'>
            {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                // Simple pagination display logic - can be improved for large numbers of pages
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                   return (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-14 h-14 rounded-full border text-lg font-bold transition-all ${currentPage === page ? 'bg-emerald-700 text-white border-emerald-700 shadow-lg' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                        >
                            {page}
                        </button>
                   );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className='text-gray-400 self-end pb-2'>...</span>
                }
                return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`p-3 rounded-full border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
          >
            <ChevronRight size={28} />
          </button>
        </section>
      )}
    </div>
  );
}