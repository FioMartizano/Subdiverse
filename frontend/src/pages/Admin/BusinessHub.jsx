// AdminBusinessHub.jsx
import { useState, useEffect } from "react";
import {
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  MapPin,
  Phone,
  LinkIcon,
  RefreshCw,
  Trash2,
  Plus,
  Mail,
  X as XIcon,
  Upload,
  Edit,
} from "lucide-react";

import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { uploadImage } from "../../services/cloudinary"; // ✅ Using Cloudinary like Parking
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import MetricCard from "../../components/admin/MetricCard";

// Status styles
const STATUS_STYLES = {
  active: "bg-[#43A047] text-white",
  suspended: "bg-[#D32F2F] text-white",
};

const STATUS_ICONS = {
  active: CheckCircle2,
  suspended: XCircle,
};

// Category badges
const CATEGORY_STYLES = {
  "cafe-resto": "bg-amber-100 text-amber-800",
  "products-services": "bg-blue-100 text-blue-800",
  "sports-fitness": "bg-green-100 text-green-800",
  "house-rent": "bg-purple-100 text-purple-800",
  "barber-salon": "bg-pink-100 text-pink-800",
  "daycare-academy": "bg-indigo-100 text-indigo-800",
};

const CATEGORY_LABELS = {
  "cafe-resto": "Cafe & Resto",
  "products-services": "Products & Services",
  "sports-fitness": "Sports & Fitness",
  "house-rent": "House for Rent",
  "barber-salon": "Barber & Salon",
  "daycare-academy": "Daycare & Academy",
};

const CATEGORY_OPTIONS = [
  { value: "cafe-resto", label: "Cafe & Resto" },
  { value: "products-services", label: "Products & Services" },
  { value: "sports-fitness", label: "Sports & Fitness" },
  { value: "house-rent", label: "House for Rent" },
  { value: "barber-salon", label: "Barber & Salon" },
  { value: "daycare-academy", label: "Daycare & Academy" },
];

function formatDateTime(date) {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status) {
  const StatusIcon = STATUS_ICONS[status] || CheckCircle2;
  const style = STATUS_STYLES[status] || "bg-[#43A047] text-white";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-buttons text-xs capitalize ${style}`}>
      <StatusIcon size={12} />
      {status || "Active"}
    </span>
  );
}

function getCategoryBadge(category) {
  const style = CATEGORY_STYLES[category] || "bg-gray-100 text-gray-800";
  const label = CATEGORY_LABELS[category] || category;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function AdminBusinessHub() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    hours: "",
    socialMediaLink: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const itemsPerPage = 10;

  // Real-time listener for businesses
  useEffect(() => {
    const businessesQuery = query(
      collection(db, "Businesses"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      businessesQuery,
      (snapshot) => {
        const businessesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || null,
          };
        });
        setBusinesses(businessesData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore businesses error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Statistics
  const totalBusinesses = businesses.length;
  const activeBusinesses = businesses.filter((b) => b.status === "active").length;
  const suspendedBusinesses = businesses.filter((b) => b.status === "suspended").length;

  // Filter businesses
  const filtered = businesses.filter((business) => {
    const matchesSearch =
      search.trim() === "" ||
      business.name?.toLowerCase().includes(search.toLowerCase()) ||
      business.description?.toLowerCase().includes(search.toLowerCase()) ||
      business.address?.toLowerCase().includes(search.toLowerCase()) ||
      business.phone?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "all" || business.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedBusinesses = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image (JPEG or PNG).');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Business name is required";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.phone.trim()) errors.phone = "Contact number is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.hours.trim()) errors.hours = "Open hours are required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add business - Using Cloudinary like Parking
  const handleAddBusiness = async () => {
    if (!validateForm()) return;

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      let uploadedImage = null;

      // Upload image to Cloudinary if selected
      if (imageFile) {
        setUploading(true);
        uploadedImage = await uploadImage(imageFile, "businesses");
        console.log("✅ Cloudinary Upload Successful:", uploadedImage);
        setUploading(false);
      }

      const businessData = {
        ...formData,
        image: uploadedImage ? uploadedImage.secureUrl : "",
        imageInfo: uploadedImage ? {
          fileName: imageFile.name,
          fileSize: imageFile.size,
          fileType: imageFile.type,
          secureUrl: uploadedImage.secureUrl,
          publicId: uploadedImage.publicId,
          resourceType: uploadedImage.resourceType,
          uploadStatus: "uploaded",
        } : null,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "Businesses"), businessData);

      setActionSuccess("Business added successfully!");
      setTimeout(() => setActionSuccess(""), 5000);

      resetForm();
      setShowAddModal(false);

    } catch (error) {
      console.error("Error adding business:", error);
      setActionError("Could not add business. Please try again.");
    } finally {
      setActionLoading(false);
      setUploading(false);
    }
  };

  // Edit business - Using Cloudinary like Parking
  const handleEditBusiness = async () => {
    if (!validateForm() || !selectedBusiness) return;

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      let uploadedImage = null;
      let imageUrl = selectedBusiness.image || "";

      // Upload new image to Cloudinary if selected
      if (imageFile) {
        setUploading(true);
        uploadedImage = await uploadImage(imageFile, "businesses");
        console.log("✅ Cloudinary Upload Successful:", uploadedImage);
        imageUrl = uploadedImage.secureUrl;
        setUploading(false);
      }

      const businessRef = doc(db, "Businesses", selectedBusiness.id);
      const updateData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (imageUrl) {
        updateData.image = imageUrl;
        if (uploadedImage) {
          updateData.imageInfo = {
            fileName: imageFile.name,
            fileSize: imageFile.size,
            fileType: imageFile.type,
            secureUrl: uploadedImage.secureUrl,
            publicId: uploadedImage.publicId,
            resourceType: uploadedImage.resourceType,
            uploadStatus: "uploaded",
          };
        }
      }

      await updateDoc(businessRef, updateData);

      setActionSuccess("Business updated successfully!");
      setTimeout(() => setActionSuccess(""), 5000);

      resetForm();
      setShowEditModal(false);
      setSelectedBusiness(null);

    } catch (error) {
      console.error("Error updating business:", error);
      setActionError("Could not update business. Please try again.");
    } finally {
      setActionLoading(false);
      setUploading(false);
    }
  };

  // Delete business
  const handleDeleteBusiness = async (businessId) => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      await deleteDoc(doc(db, "Businesses", businessId));

      setOpenMenuId(null);
      setShowDeleteModal(false);
      setSelectedBusiness(null);

      setActionSuccess("Business deleted successfully.");
      setTimeout(() => setActionSuccess(""), 5000);

    } catch (error) {
      console.error("Error deleting business:", error);
      setActionError("Could not delete the business. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle business status (Active/Suspended)
  const toggleBusinessStatus = async (businessId, currentStatus) => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      const businessRef = doc(db, "Businesses", businessId);
      await updateDoc(businessRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      setOpenMenuId(null);
      setActionSuccess(`Business ${newStatus === "active" ? "activated" : "suspended"} successfully.`);
      setTimeout(() => setActionSuccess(""), 5000);

    } catch (error) {
      console.error("Error toggling business status:", error);
      setActionError("Could not update business status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      phone: "",
      email: "",
      address: "",
      hours: "",
      socialMediaLink: "",
    });
    setImageFile(null);
    setImagePreview("");
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (business) => {
    setSelectedBusiness(business);
    setFormData({
      name: business.name || "",
      category: business.category || "",
      description: business.description || "",
      phone: business.phone || "",
      email: business.email || "",
      address: business.address || "",
      hours: business.hours || "",
      socialMediaLink: business.socialMediaLink || "",
    });
    setImagePreview(business.image || "");
    setImageFile(null);
    setFormErrors({});
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Loading businesses...</p>
          <p className="text-sm text-muted-foreground mt-1">Please wait while we fetch real-time data.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminPageLayout
      title="Business Hub Management"
      subtitle="View and manage all business listings in the community."
      action={
        <button
          onClick={openAddModal}
          className="btn-primary !px-4 !py-2 !text-sm !font-medium w-full sm:w-auto inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Add Business
        </button>
      }
    >
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionSuccess}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          icon={Store}
          gradient="linear-gradient(135deg, #42A5F5, #1565C0)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Total Businesses"
          value={totalBusinesses.toLocaleString()}
          description="All registered businesses."
        />
        <MetricCard
          icon={CheckCircle2}
          gradient="linear-gradient(135deg, #66BB6A, #2E7D32)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Active Businesses"
          value={activeBusinesses.toLocaleString()}
          description="Currently active businesses."
        />
        <MetricCard
          icon={XCircle}
          gradient="linear-gradient(135deg, #FF8A65, #E64A19)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Suspended"
          value={suspendedBusinesses.toLocaleString()}
          description="Businesses that are suspended."
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-sm border border-input rounded-buttons px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="all">All categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="hidden sm:block flex-1" />

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search businesses..."
            className="text-sm border border-input rounded-buttons pl-9 pr-3 py-2 w-full sm:w-64 bg-card focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-cards border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground">
              <th className="text-left font-medium px-4 py-3 min-w-[200px]">Business</th>
              <th className="hidden lg:table-cell text-left font-medium px-4 py-3 min-w-[140px]">Category</th>
              <th className="hidden md:table-cell text-left font-medium px-4 py-3 min-w-[150px]">Contact</th>
              <th className="text-left font-medium px-4 py-3 min-w-[120px]">Status</th>
              <th className="min-w-[56px]" />
            </tr>
          </thead>
          <tbody>
            {paginatedBusinesses.map((business) => (
              <tr key={business.id} className="border-t border-border hover:bg-muted/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 overflow-hidden">
                      {business.image ? (
                        <img
                          src={business.image}
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        business.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{business.name || "Unnamed Business"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {business.description?.slice(0, 60) || "No description"}
                        {business.description?.length > 60 && "..."}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-4 py-3">
                  {getCategoryBadge(business.category)}
                </td>
                <td className="hidden md:table-cell px-4 py-3">
                  <div className="text-xs">
                    {business.phone && (
                      <p className="text-foreground flex items-center gap-1">
                        <Phone size={12} className="text-muted-foreground" />
                        {business.phone}
                      </p>
                    )}
                    {business.address && (
                      <p className="text-muted-foreground truncate max-w-[150px] flex items-center gap-1">
                        <MapPin size={12} className="text-muted-foreground" />
                        {business.address}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(business.status || "active")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId(openMenuId === business.id ? null : business.id);
                      }}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-buttons hover:bg-muted"
                      aria-label="More actions"
                    >
                      <MoreVertical size={16} className="text-muted-foreground" />
                    </button>

                    {openMenuId === business.id && (
                      <div className="absolute right-0 top-9 z-50 w-48 rounded-xl border border-border bg-card shadow-xl py-1 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBusiness(business);
                            setShowDetailModal(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-xs text-left hover:bg-muted flex items-center gap-2"
                        >
                          <Eye size={14} />
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(business)}
                          className="w-full px-3 py-2 text-xs text-left hover:bg-muted flex items-center gap-2"
                        >
                          <Edit size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleBusinessStatus(business.id, business.status)}
                          disabled={actionLoading}
                          className={`w-full px-3 py-2 text-xs text-left hover:bg-muted flex items-center gap-2 ${
                            business.status === "active" ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          <RefreshCw size={14} />
                          {business.status === "active" ? "Suspend" : "Activate"}
                        </button>

                        <div className="border-t border-border my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBusiness(business);
                            setShowDeleteModal(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-xs text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {paginatedBusinesses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No businesses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-sm text-muted-foreground">
        <span>
          Showing {filtered.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="w-8 h-8 rounded-buttons border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          <span>Page {safeCurrentPage} of {totalPages}</span>

          <button
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="w-8 h-8 rounded-buttons border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Add Business Modal */}
      {showAddModal && (
        <BusinessFormModal
          title="Add New Business"
          formData={formData}
          formErrors={formErrors}
          imagePreview={imagePreview}
          uploading={uploading}
          actionLoading={actionLoading}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onSubmit={handleAddBusiness}
          onCancel={() => {
            setShowAddModal(false);
            resetForm();
          }}
        />
      )}

      {/* Edit Business Modal */}
      {showEditModal && selectedBusiness && (
        <BusinessFormModal
          title="Edit Business"
          formData={formData}
          formErrors={formErrors}
          imagePreview={imagePreview}
          uploading={uploading}
          actionLoading={actionLoading}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onSubmit={handleEditBusiness}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedBusiness(null);
            resetForm();
          }}
          isEdit
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBusiness && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedBusiness.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getCategoryBadge(selectedBusiness.category)} • {getStatusBadge(selectedBusiness.status || "active")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBusiness(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedBusiness.image && (
                <div className="w-full h-48 rounded-xl overflow-hidden bg-muted">
                  <img
                    src={selectedBusiness.image}
                    alt={selectedBusiness.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Store size={16} />
                  Business Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl">
                  <DetailItem label="Business Name" value={selectedBusiness.name} />
                  <DetailItem label="Category" value={CATEGORY_LABELS[selectedBusiness.category] || selectedBusiness.category} />
                  <DetailItem label="Description" value={selectedBusiness.description} />
                  <DetailItem label="Phone" value={selectedBusiness.phone} />
                  {selectedBusiness.email && <DetailItem label="Email" value={selectedBusiness.email} />}
                  <DetailItem label="Address" value={selectedBusiness.address} />
                  <DetailItem label="Hours" value={selectedBusiness.hours || "Not specified"} />
                  {selectedBusiness.socialMediaLink && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Social Media</p>
                      <a
                        href={selectedBusiness.socialMediaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-orange-500 hover:underline font-medium mt-1"
                      >
                        <LinkIcon size={14} />
                        {selectedBusiness.socialMediaLink}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground border-t border-border pt-4">
                {selectedBusiness.createdAt && (
                  <div>
                    <span className="font-medium">Created:</span> {formatDateTime(selectedBusiness.createdAt)}
                  </div>
                )}
                {selectedBusiness.updatedAt && (
                  <div>
                    <span className="font-medium">Last Updated:</span> {formatDateTime(selectedBusiness.updatedAt)}
                  </div>
                )}
                <div className="col-span-2">
                  <span className="font-medium">Business ID:</span> {selectedBusiness.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBusiness && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <Trash2 size={24} />
              <h2 className="text-lg font-semibold">Delete Business</h2>
            </div>

            <p className="text-sm text-muted-foreground leading-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">"{selectedBusiness.name}"</span>?
              This action cannot be undone.
            </p>

            {actionError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBusiness(null);
                  setActionError("");
                }}
                className="px-4 py-2 text-sm rounded-buttons border border-border hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleDeleteBusiness(selectedBusiness.id)}
                className="px-4 py-2 text-sm font-medium rounded-buttons bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete Business"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}

// Business Form Modal Component
function BusinessFormModal({
  title,
  formData,
  formErrors,
  imagePreview,
  uploading,
  actionLoading,
  onInputChange,
  onImageUpload,
  onRemoveImage,
  onSubmit,
  onCancel,
  isEdit = false,
}) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill in the details to {isEdit ? "update" : "add a new"} business listing
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              placeholder="Enter business name"
              className={`w-full mt-1.5 px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-card ${
                formErrors.name ? "border-red-500" : "border-input"
              }`}
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={onInputChange}
              className={`w-full mt-1.5 px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-card ${
                formErrors.category ? "border-red-500" : "border-input"
              }`}
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              placeholder="Describe the business, products, or services offered..."
              rows="3"
              className={`w-full mt-1.5 px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-card resize-y ${
                formErrors.description ? "border-red-500" : "border-input"
              }`}
            />
            {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                placeholder="0917 123 4567"
                className={`w-full mt-1.5 px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-card ${
                  formErrors.phone ? "border-red-500" : "border-input"
                }`}
              />
              {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onInputChange}
                placeholder="business@email.com"
                className="w-full mt-1.5 px-4 py-2.5 border-2 border-input rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-card"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={onInputChange}
              placeholder="Blk 52 Lot 2, St. Benedict, Windward Hills Subdivision"
              className={`w-full mt-1.5 px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-card ${
                formErrors.address ? "border-red-500" : "border-input"
              }`}
            />
            {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Open Hours <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="hours"
              value={formData.hours}
              onChange={onInputChange}
              placeholder="2:00 AM - 12:00 AM, Monday-Saturday"
              className={`w-full mt-1.5 px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-card ${
                formErrors.hours ? "border-red-500" : "border-input"
              }`}
            />
            {formErrors.hours && <p className="text-xs text-red-500 mt-1">{formErrors.hours}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Social Media Link</label>
            <input
              type="url"
              name="socialMediaLink"
              value={formData.socialMediaLink}
              onChange={onInputChange}
              placeholder="https://www.facebook.com/yourbusiness"
              className="w-full mt-1.5 px-4 py-2.5 border-2 border-input rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-card"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Business Logo</label>
            <div className="mt-1.5">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Business logo preview"
                    className="w-24 h-24 rounded-xl object-cover border-2 border-border"
                  />
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-xl cursor-pointer hover:border-orange-500 transition-all bg-muted/30">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload size={32} className="text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">JPG, PNG (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                    onChange={onImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-sm rounded-xl border border-border hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={actionLoading || uploading}
              className="px-6 py-2.5 text-sm font-medium rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading || uploading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  {uploading ? "Uploading..." : "Processing..."}
                </>
              ) : (
                isEdit ? "Update Business" : "Add Business"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground mt-1">{value || "Not provided"}</p>
    </div>
  );
}

export default AdminBusinessHub;