import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Coffee,
  X,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { adminApi, MenuItem } from '../../services/adminApi';

export const MenuManagement: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeMenuType, setActiveMenuType] = useState<'poured' | 'plated'>('poured');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Item Form State
  const [formData, setFormData] = useState<{
    name: string;
    price: string | number;
    description: string;
    tag: MenuItem['tag'];
    categoryId: string;
    categoryTitle: string;
    menuType: 'poured' | 'plated';
    inStock: boolean;
  }>({
    name: '',
    price: '',
    description: '',
    tag: 'Specialty',
    categoryId: 'signatures',
    categoryTitle: 'SIGNATURES',
    menuType: 'poured',
    inStock: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getMenuItems();
      setItems(res.items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleToggleStock = async (id: string) => {
    try {
      const res = await adminApi.toggleStock(id);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? res.item : item))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle stock status.');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Item name is required.');
      return;
    }
    if (formData.price === '' || formData.price === undefined) {
      setFormError('Item price is required.');
      return;
    }

    try {
      setFormLoading(true);
      if (itemToEdit) {
        const res = await adminApi.updateMenuItem(itemToEdit.id, formData);
        setItems((prev) =>
          prev.map((i) => (i.id === itemToEdit.id ? res.item : i))
        );
        setItemToEdit(null);
      } else {
        const res = await adminApi.addMenuItem(formData);
        setItems((prev) => [...prev, res.item]);
        setAddModalOpen(false);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save menu item.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await adminApi.deleteMenuItem(itemToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete menu item.');
    }
  };

  const openEditModal = (item: MenuItem) => {
    setItemToEdit(item);
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description || '',
      tag: item.tag,
      categoryId: item.categoryId,
      categoryTitle: item.categoryTitle,
      menuType: item.menuType,
      inStock: item.inStock,
    });
  };

  const openAddModal = () => {
    setItemToEdit(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      tag: 'Specialty',
      categoryId: activeMenuType === 'poured' ? 'signatures' : 'daybreak',
      categoryTitle: activeMenuType === 'poured' ? 'SIGNATURES' : 'DAYBREAK & FRENCH TOASTS',
      menuType: activeMenuType,
      inStock: true,
    });
    setAddModalOpen(true);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (item.menuType !== activeMenuType) return false;
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Extract unique categories for current menu type
  const availableCategories = Array.from(
    new Set(
      items
        .filter((i) => i.menuType === activeMenuType)
        .map((i) => JSON.stringify({ id: i.categoryId, title: i.categoryTitle }))
    )
  ).map((str) => JSON.parse(str));

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCCBB4]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#873A35] uppercase tracking-widest mb-1">
            <span>CULINARY &amp; EXTRACTION</span>
            <span>✦</span>
            <span>CATALOG &amp; STOCK</span>
          </div>
          <h1 className="font-editorial-display text-2xl sm:text-3xl text-[#292723] font-medium tracking-tight">
            Menu Items &amp; Stock Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 bg-[#873A35] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-full hover:bg-[#70452D] transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Add Menu Item</span>
          </button>

          <button
            onClick={fetchMenu}
            title="Refresh Menu"
            className="p-2.5 border border-[#DCCBB4] rounded-full text-[#70452D] hover:bg-white transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Primary Menu Type Toggle (POURED vs PLATED) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setActiveMenuType('poured');
            setSelectedCategory('all');
          }}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xs font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer border ${
            activeMenuType === 'poured'
              ? 'bg-[#873A35] text-[#FFF3DF] border-[#873A35] shadow-xs'
              : 'bg-[#FFF3DF] text-[#70452D] border-[#DCCBB4] hover:border-[#873A35]'
          }`}
        >
          <span>POURED (Beverages &amp; Coffee)</span>
        </button>

        <button
          onClick={() => {
            setActiveMenuType('plated');
            setSelectedCategory('all');
          }}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xs font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer border ${
            activeMenuType === 'plated'
              ? 'bg-[#873A35] text-[#FFF3DF] border-[#873A35] shadow-xs'
              : 'bg-[#FFF3DF] text-[#70452D] border-[#DCCBB4] hover:border-[#873A35]'
          }`}
        >
          <span>PLATED (Food &amp; Dining)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFF3DF] border border-[#DCCBB4] p-4 rounded-xs shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder={`Search ${activeMenuType} items by name or ingredients...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-sans bg-white border border-[#DCCBB4] rounded-xs pl-9 pr-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-[#70452D]/60 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#70452D] uppercase text-[11px]">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35] uppercase text-xs cursor-pointer max-w-xs truncate"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={24} className="text-[#873A35] animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-widest text-[#70452D]">
              Querying menu items from database...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center space-y-3 bg-[#F1E9DC]/30">
            <UtensilsCrossed size={36} className="text-[#70452D]/40 mx-auto" />
            <h3 className="font-editorial-display text-xl text-[#292723]">No Menu Items Found</h3>
            <p className="text-xs text-[#70452D] font-light max-w-sm mx-auto leading-relaxed">
              No items matched your current filter criteria in {activeMenuType.toUpperCase()}.
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#F1E9DC] border-b border-[#DCCBB4] font-mono text-[11px] text-[#70452D] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (₹)</th>
                    <th className="py-3 px-4">Diet / Tag</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCCBB4]/60">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#292723] whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#70452D] whitespace-nowrap">
                        {item.categoryTitle}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#873A35] whitespace-nowrap">
                        ₹{item.price}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.tag ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#DCCBB4]/40 text-[#70452D] border border-[#DCCBB4]">
                            {item.tag}
                          </span>
                        ) : (
                          <span className="text-[#70452D]/60">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#70452D] max-w-xs truncate">
                        {item.description || '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStock(item.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border cursor-pointer transition-colors ${
                            item.inStock
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                          }`}
                          title="Click to toggle availability"
                        >
                          {item.inStock ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              <span>Out of Stock</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-[#70452D] hover:text-[#292723] rounded hover:bg-[#DCCBB4]/40 transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 text-[#70452D] hover:text-red-700 rounded hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (<768px) */}
            <div className="block md:hidden divide-y divide-[#DCCBB4]/60">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 bg-white/50 hover:bg-white/80 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-medium text-sm text-[#292723]">{item.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-[#70452D] bg-[#DCCBB4]/40 px-2 py-0.5 rounded-xs border border-[#DCCBB4]/60">
                          {item.categoryTitle}
                        </span>
                        {item.tag && (
                          <span className="text-[10px] font-mono text-[#873A35] bg-[#873A35]/10 px-2 py-0.5 rounded-xs font-semibold">
                            {item.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-mono font-bold text-base text-[#873A35] mr-2">
                        ₹{item.price}
                      </span>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-[#70452D] hover:text-[#292723] rounded hover:bg-[#DCCBB4]/30"
                        title="Edit Item"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                        title="Delete Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-[#70452D] font-light leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#DCCBB4]/30 flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#70452D]">Availability:</span>
                    <button
                      onClick={() => handleToggleStock(item.id)}
                      className={`min-h-[38px] inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border cursor-pointer transition-colors ${
                        item.inStock
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                      }`}
                    >
                      {item.inStock ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          <span>Out of Stock</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
      {(addModalOpen || itemToEdit) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#DCCBB4]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#873A35] font-semibold block">
                  {itemToEdit ? 'EDIT MENU RECORD' : 'CREATE MENU ITEM'}
                </span>
                <h3 className="font-editorial-display text-2xl font-medium text-[#292723]">
                  {itemToEdit ? itemToEdit.name : 'New Item Details'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setItemToEdit(null);
                }}
                className="p-1.5 text-[#70452D] hover:text-[#292723] rounded-full hover:bg-[#DCCBB4]/40 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-800 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-700" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Cold Brew or Honey Nutmeg French Toast"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Price (₹ or multiple format) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 360 or 360 / 490"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Menu Type *
                  </label>
                  <select
                    value={formData.menuType}
                    onChange={(e) => {
                      const mType = e.target.value as 'poured' | 'plated';
                      setFormData({
                        ...formData,
                        menuType: mType,
                        categoryId: mType === 'poured' ? 'signatures' : 'daybreak',
                        categoryTitle: mType === 'poured' ? 'SIGNATURES' : 'DAYBREAK & FRENCH TOASTS',
                      });
                    }}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  >
                    <option value="poured">POURED (Beverages)</option>
                    <option value="plated">PLATED (Food)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const titleMap: Record<string, string> = {
                        signatures: 'SIGNATURES',
                        'slow-brewed': 'SLOW BREWED',
                        grounded: 'GROUNDED & SHIFTED',
                        'matcha-tea': 'MATCHA, HOJICHA & TEAS',
                        daybreak: 'DAYBREAK & FRENCH TOASTS',
                        'salads-tapas': 'SALADS & TAPAS PLATES',
                        'kneaded-gathered': 'KNEADED & GATHERED',
                        'sweet-ends': 'SWEET ENDS',
                      };
                      setFormData({
                        ...formData,
                        categoryId: id,
                        categoryTitle: titleMap[id] || id.toUpperCase(),
                      });
                    }}
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  >
                    {formData.menuType === 'poured' ? (
                      <>
                        <option value="signatures">SIGNATURES</option>
                        <option value="slow-brewed">SLOW BREWED</option>
                        <option value="grounded">GROUNDED &amp; SHIFTED</option>
                        <option value="matcha-tea">MATCHA, HOJICHA &amp; TEAS</option>
                      </>
                    ) : (
                      <>
                        <option value="daybreak">DAYBREAK &amp; FRENCH TOASTS</option>
                        <option value="salads-tapas">SALADS &amp; TAPAS PLATES</option>
                        <option value="kneaded-gathered">KNEADED &amp; GATHERED</option>
                        <option value="sweet-ends">SWEET ENDS</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                    Dietary / Specialty Tag
                  </label>
                  <select
                    value={formData.tag || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tag: (e.target.value as MenuItem['tag']) || undefined,
                      })
                    }
                    className="w-full font-mono bg-white border border-[#DCCBB4] rounded-xs px-3 py-2 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                  >
                    <option value="">None</option>
                    <option value="Specialty">Specialty</option>
                    <option value="Caffeinated">Caffeinated</option>
                    <option value="Non-Caffeinated">Non-Caffeinated</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Vegetarian">Vegetarian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#70452D] mb-1">
                  Description / Tasting Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Ingredients, origin notes, botanical extractions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-[#DCCBB4] rounded-xs p-2.5 text-[#292723] focus:outline-hidden focus:border-[#873A35]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="rounded text-[#873A35] focus:ring-[#873A35] cursor-pointer"
                />
                <label htmlFor="inStockCheck" className="text-xs text-[#292723] font-medium cursor-pointer">
                  Available in Stock (Uncheck to mark Out of Stock)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#DCCBB4]">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setItemToEdit(null);
                  }}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#70452D] hover:text-[#292723] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-mono uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-xs"
                >
                  {formLoading ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-editorial-sans text-xl font-medium text-[#292723]">
              Confirm Deletion
            </h3>
            <p className="text-xs text-[#70452D] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#292723]">{itemToDelete.name}</strong> from the {itemToDelete.categoryTitle} menu?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#70452D] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-red-800 text-white hover:bg-red-900 rounded-full cursor-pointer"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
