// frontend/src/data/mockPosts.js
export const hoaAnnouncements = [
  {
    id: "post1",
    author: {
      id: "hoa1",
      name: "HOA Main Office",
      avatar: "https://ui-avatars.com/api/?name=HOA&background=F98300&color=fff&size=40",
      role: "officer"
    },
    content: {
      text: "📢 MONTHLY DUES REMINDER: Kindly settle your monthly association dues by July 25, 2026 to avoid penalties. Payments can be made at the HOA office or online via our payment portal.",
      images: [],
      embedUrl: null
    },
    engagement: {
      likes: 45,
      comments: 8,
      views: 234,
      isLiked: false
    },
    metadata: {
      createdAt: "2026-07-15T10:30:00Z",
      isPinned: true,
      category: "announcement",
      source: "office"
    }
  },
  {
    id: "post2",
    author: {
      id: "hoa2",
      name: "HOA Events Committee",
      avatar: "https://ui-avatars.com/api/?name=Events&background=F98300&color=fff&size=40",
      role: "officer"
    },
    content: {
      text: "🎉 ANNUAL GENERAL ASSEMBLY: Join us on August 5, 2026 at the Clubhouse. Important community matters will be discussed. See you there!",
      images: [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop"
      ],
      embedUrl: null
    },
    engagement: {
      likes: 67,
      comments: 15,
      views: 412,
      isLiked: false
    },
    metadata: {
      createdAt: "2026-07-14T14:00:00Z",
      isPinned: false,
      category: "event",
      source: "office"
    }
  },
  {
    id: "post3",
    author: {
      id: "hoa3",
      name: "HOA Engineering Dept",
      avatar: "https://ui-avatars.com/api/?name=Engr&background=F98300&color=fff&size=40",
      role: "officer"
    },
    content: {
      text: "🛣️ ROAD REPAIR ADVISORY: Road repairs along Main Street will start on July 22-25, 2026. Please expect delays and use alternate routes. We apologize for the inconvenience.",
      images: [
        "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=400&fit=crop"
      ],
      embedUrl: null
    },
    engagement: {
      likes: 34,
      comments: 12,
      views: 189,
      isLiked: false
    },
    metadata: {
      createdAt: "2026-07-13T16:45:00Z",
      isPinned: false,
      category: "advisory",
      source: "office"
    }
  },
  {
    id: "post4",
    author: {
      id: "hoa4",
      name: "HOA Security Office",
      avatar: "https://ui-avatars.com/api/?name=Security&background=F98300&color=fff&size=40",
      role: "officer"
    },
    content: {
      text: "🔒 SECURITY UPDATE: New CCTV cameras have been installed at all entry points. Please ensure your vehicle stickers are updated. Report any suspicious activity to the security office.",
      images: [],
      embedUrl: null
    },
    engagement: {
      likes: 28,
      comments: 6,
      views: 156,
      isLiked: false
    },
    metadata: {
      createdAt: "2026-07-12T09:20:00Z",
      isPinned: false,
      category: "advisory",
      source: "office"
    }
  },
  {
    id: "post5",
    author: {
      id: "hoa5",
      name: "HOA Admin Office",
      avatar: "https://ui-avatars.com/api/?name=Admin&background=F98300&color=fff&size=40",
      role: "officer"
    },
    content: {
      text: "📋 OFFICE HOURS UPDATE: The HOA office will be closed on July 19 for a staff training. Regular operations will resume on July 20. Thank you for your understanding.",
      images: [],
      embedUrl: null
    },
    engagement: {
      likes: 19,
      comments: 4,
      views: 98,
      isLiked: false
    },
    metadata: {
      createdAt: "2026-07-11T11:30:00Z",
      isPinned: false,
      category: "announcement",
      source: "office"
    }
  },
  // Additional HOA-only posts
  {
    id: "post6",
    author: {
      id: "hoa6",
      name: "HOA Treasurer's Office",
      avatar: "https://ui-avatars.com/api/?name=Treasurer&background=F98300&color=fff&size=40",
      role: "officer"
    },
    content: {
      text: "💰 FINANCIAL REPORT: The Q2 2026 financial report is now available at the HOA office. Members may request a copy during office hours.",
      images: [],
      embedUrl: null
    },
    engagement: {
      likes: 15,
      comments: 3,
      views: 87,
      isLiked: false
    },
    metadata: {
      createdAt: "2026-07-10T08:00:00Z",
      isPinned: false,
      category: "announcement",
      source: "office"
    }
  },

  {
    id: "post7",
    author: {
      id: "hoa7",
      name: "HOA Community Relations",
      avatar: "https://ui-avatars.com/api/?name=Community&background=F98300&color=fff&size=40",
      role: "officer"
    },
    content: {
      text: "We're planning community events for the upcoming quarter. Which day works best for you?",
      images: [],
      embedUrl: null
    },
    engagement: {
      likes: 23,
      comments: 8,
      views: 156,
      isLiked: false
    },
    metadata: {
      createdAt: "2026-07-09T09:00:00Z",
      isPinned: false,
      category: "event",
      source: "office"
    },
    // Poll data
    poll: {
      question: "Which day works best for community events?",
      options: ["Saturday Morning", "Saturday Afternoon", "Sunday Morning", "Sunday Afternoon"],
      votes: [12, 8, 5, 3],
      totalVotes: 28,
      hasVoted: false,
      selectedOption: null
    }
  }
];  