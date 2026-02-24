import { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";

export const COMMODITIES = ["Maize DDGS", "M DOC", "Soya"];

export const useFreightManager = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState(COMMODITIES[0]);
  const [editingId, setEditingId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [freights, setFreights] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingFreight, setViewingFreight] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState("");
  const [creators, setCreators] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [formData, setFormData] = useState({
    company: "",
    location: "",
    deliveryCompany: "",
    deliveryLocation: "",
    freightRate: "",
  });

  const checkCommodityMatch = useCallback((companyCommodities, selected) => {
    if (!companyCommodities || !Array.isArray(companyCommodities)) return false;
    
    const selectedLower = selected.toLowerCase();
    
    // For "Soya" tab
    if (selectedLower === 'soya') {
      return companyCommodities.some(c => {
         const cLower = c.toLowerCase();
         // Match Soya, SBM, or specific variations like "SBM 48%"
         return cLower.includes('soya') || cLower.includes('sbm');
      });
    }
    
    // For "Maize DDGS" tab
    if (selectedLower.includes('ddgs')) {
       return companyCommodities.some(c => c.toLowerCase().includes('ddgs'));
    }

    // For "M DOC" tab
    if (selectedLower === 'm doc') {
      return companyCommodities.some(c => {
        const cLower = c.toLowerCase();
        return cLower.includes('mdoc') || cLower.includes('m doc');
      });
    }
    
    return companyCommodities.some(c => c.toLowerCase() === selectedLower);
  }, []);

  const sellerCompanies = useMemo(() => {
    return companies.filter(c => 
      c.type?.includes('seller') && 
      checkCommodityMatch(c.commodities, selectedCommodity)
    );
  }, [companies, selectedCommodity, checkCommodityMatch]);

  const buyerCompanies = useMemo(() => {
    return companies.filter(c => 
      c.type?.includes('buyer') && 
      checkCommodityMatch(c.commodities, selectedCommodity)
    );
  }, [companies, selectedCommodity, checkCommodityMatch]);

  const resetForm = useCallback(() => {
    setFormData({
      company: "",
      location: "",
      deliveryCompany: "",
      deliveryLocation: "",
      freightRate: "",
    });
    setEditingId(null);
    setIsEditModalOpen(false);
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/managecompany?limit=1000");
      if (response.data && response.data.companies) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    }
  };

  const fetchCreators = async () => {
    try {
      const response = await axiosInstance.get("/freight?getCreators=true");
      if (response.data.success) {
        setCreators(response.data.creators);
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
    }
  };

  const fetchFreights = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/freight", {
        params: {
          commodity: selectedCommodity,
          commodity: selectedCommodity,
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          createdBy: selectedCreator || undefined,
        },
      });
      if (response.data.success) {
        setFreights(response.data.freights);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error feselectedCommodity, tching freights:", error);
    }
  }, [selectedCommodity, pagination.page, pagination.limit, searchTerm, selectedCreator]);

  useEffect(() => {
    if (session?.user) {
      setCurrentUser({ 
        name: session.user.name || session.user.mobile || "Unknown" 
      });
    } else if (typeof window !== "undefined") {
      const storedUserName = localStorage.getItem("userName");
      const storedUserObj = localStorage.getItem("user");
      
      if (storedUserName) {
        setCurrentUser({ name: storedUserName });
      } else if (storedUserObj) {
        try {
          const parsed = JSON.parse(storedUserObj);
          // Prioritize registeredName, then name, then mobile
          const displayName = parsed.registeredName || parsed.name || parsed.mobile;
          setCurrentUser({ name: displayName });
        } catch (e) {
          console.error("Error parsing user from storage", e);
        }
      }
    }
    fetchCompanies();
    fetchCreators();
  }, [session]);

  useEffect(() => {
    fetchFreights();
  }, [fetchFreights]);

  useEffect(() => {
    if (!editingId) {
        setFormData({
        company: "",
        location: "",
        deliveryCompany: "",
        deliveryLocation: "",
        freightRate: "",
        });
    }
  }, [selectedCommodity, editingId]);

  const downloadFreightExcel = useCallback(async () => {
    try {
      setLoading(true);
      const workbook = XLSX.utils.book_new();

      for (const commodity of COMMODITIES) {
        const response = await axiosInstance.get("/freight", {
          params: {
            commodity,
            page: 1,
            limit: 100000,
          },
        });

        if (
          !response.data ||
          !response.data.success ||
          !Array.isArray(response.data.freights) ||
          response.data.freights.length === 0
        ) {
          continue;
        }

        const rows = [];
        rows.push(["Source Location", "Destination Location", "Freight Rate"]);

        response.data.freights.forEach((item) => {
          rows.push([
            item.location || "",
            item.deliveryLocation || "",
            item.freightRate != null ? item.freightRate : "",
          ]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        let sheetName = commodity;
        if (sheetName.length > 31) {
          sheetName = sheetName.slice(0, 31);
        }
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        toast.warn("No freight data available to export");
        return;
      }

      XLSX.writeFile(workbook, "freight_rates.xlsx");
    } catch (error) {
      console.error("Error exporting freight excel:", error);
      toast.error("Failed to download freight Excel");
    } finally {
      setLoading(false);
    }
  }, []);

  const allSourceLocations = useMemo(() => {
    const locations = new Set();
    sellerCompanies.forEach(c => {
      if (Array.isArray(c.location)) {
        c.location.forEach(loc => {
          if (loc) locations.add(loc);
        });
      }
    });
    return Array.from(locations).sort();
  }, [sellerCompanies]);

  const allDeliveryLocations = useMemo(() => {
    const locations = new Set();
    buyerCompanies.forEach(c => {
      if (Array.isArray(c.location)) {
        c.location.forEach(loc => {
          if (loc) locations.add(loc);
        });
      }
    });
    return Array.from(locations).sort();
  }, [buyerCompanies]);

  const handleSourceLocationChange = (location) => {
    const company = sellerCompanies.find(c => c.location.includes(location));
    setFormData(prev => ({
      ...prev,
      location: location,
      company: company ? company._id : ""
    }));
  };

  const handleDeliveryLocationChange = (location) => {
    const company = buyerCompanies.find(c => c.location.includes(location));
    setFormData(prev => ({
      ...prev,
      deliveryLocation: location,
      deliveryCompany: company ? company._id : ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.location || !formData.deliveryCompany || !formData.deliveryLocation || !formData.freightRate || !selectedCommodity) {
      toast.error("Please fill in all fields including Commodity");
      return;
    }

    if (formData.location === formData.deliveryLocation) {
      toast.error("Source Location and Destination Location are same");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        commodity: selectedCommodity,
        company: formData.company,
        location: formData.location,
        deliveryCompany: formData.deliveryCompany,
        deliveryLocation: formData.deliveryLocation,
        freightRate: Number(formData.freightRate),
        createdBy: currentUser?.name || "Unknown",
      };

      let response;
      if (editingId) {
        response = await axiosInstance.put(`/freight/${editingId}`, payload);
      } else {
        response = await axiosInstance.post("/freight", payload);
      }

      if (response.data.success) {
        toast.success(
          editingId ? "Freight updated successfully!" : "Freight added successfully!"
        );
        resetForm();
        setIsEditModalOpen(false);
        fetchFreights();
      }
    } catch (error) {
      console.error("Error saving freight:", error);
      toast.error(error.response?.data?.error || "Failed to save freight");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (freight) => {
    if (!confirm("Are you sure you want to edit this freight entry?")) return;
    
    // Use _id from freight object
    const id = freight._id || freight.id;
    if (!id) {
        toast.error("Freight ID missing");
        return;
    }

    // Set commodity first to ensure locations list is correct
    if (freight.commodity && freight.commodity !== selectedCommodity) {
        setSelectedCommodity(freight.commodity);
    }

    setFormData({
      company: freight.company?._id || freight.company,
      location: freight.location,
      deliveryCompany: freight.deliveryCompany?._id || freight.deliveryCompany,
      deliveryLocation: freight.deliveryLocation,
      freightRate: freight.freightRate,
    });
    setEditingId(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
        toast.error("Freight ID missing");
        return;
    }
    if (!confirm("Are you sure you want to delete this freight entry?")) return;
    try {
      const response = await axiosInstance.delete(`/freight/${id}`);
      if (response.data.success) {
        toast.success("Freight deleted successfully");
        fetchFreights();
      }
    } catch (error) {
      console.error("Delete error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to delete freight");
    }
  };

  return {
    loading,
    companies,
    selectedCommodity,
    setSelectedCommodity,
    editingId,
    setEditingId,
    isEditModalOpen,
    setIsEditModalOpen,
    freights,
    pagination,
    setPagination,
    searchTerm,
    setSearchTerm,
    selectedCreator,
    setSelectedCreator,
    creators,
    viewingFreight,
    setViewingFreight,
    formData,
    setFormData,
    sellerCompanies,
    buyerCompanies,
    allSourceLocations,
    allDeliveryLocations,
    handleSourceLocationChange,
    handleDeliveryLocationChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    downloadFreightExcel,
  };
};
