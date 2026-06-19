import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // FORM MODAL CONTROLS
  const [modalOpen, setModalOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null); // If null -> Add, else Edit
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [image, setImage] = useState('');

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadServicesList();
  }, []);

  const loadServicesList = async () => {
    setLoading(true);
    try {
      const response = await api.getProviderServices();
      setServices(response.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditTargetId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setDuration('60');
    setImage('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (srv) => {
    setEditTargetId(srv.id);
    setTitle(srv.title);
    setDescription(srv.description);
    setPrice(srv.price);
    setDuration(String(srv.duration));
    setImage(srv.image || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Wipe this service listing permanently from client portals?')) return;
    try {
      await api.deleteService(id);
      alert('Service listing permanently deleted.');
      loadServicesList();
    } catch (err) {
      alert(err.message || 'Error occurred deleting service.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description || !price || !duration) {
      setFormError('Mandatory specifications are missing.');
      return;
    }

    setFormLoading(true);

    try {
      if (editTargetId) {
        await api.updateService(editTargetId, {
          title,
          description,
          price,
          duration,
          image: image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600'
        });
        alert('Service specifications saved successfully!');
      } else {
        await api.createService({
          title,
          description,
          price,
          duration,
          image: image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600'
        });
        alert('New service successfully published to clients!');
      }

      setModalOpen(false);
      loadServicesList();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Error saving service details.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left" id="provider-services-manager">
      
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Services catalogue</h1>
          <p className="text-xs text-gray-400">Add, edit, or wipe custom household services offered to customers</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/10 flex items-center space-x-1.5 cursor-pointer"
          id="add-new-service-btn"
        >
          <Plus size={16} />
          <span>Add New Service Listing</span>
        </button>
      </div>

      {/* SERVICES LIST DISPLAY */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-gray-50 rounded-2xl"></div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 max-w-sm mx-auto space-y-4">
          <Layers size={44} className="text-emerald-500/30 mx-auto animate-pulse" />
          <div>
            <h3 className="font-extrabold text-gray-900 text-sm">No services listed yet</h3>
            <p className="text-xs text-gray-400 px-6 mt-1">
              You haven't listed any household specialties. Click the add button to expose services to customer searches.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-emerald-650 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div key={srv.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-100 hover:shadow-lg transition-all" id={`provider-srv-item-${srv.id}`}>
              <div className="h-36 overflow-hidden relative">
                <img
                  src={srv.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600'}
                  alt={srv.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white rounded">
                  {srv.duration} mins
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-black text-gray-950 text-xs truncate">{srv.title}</h3>
                  <p className="text-[11px] text-gray-400 line-clamp-2 min-h-[1.5rem] leading-relaxed">{srv.description}</p>
                </div>

                <div className="flex justify-between items-center border-t border-gray-50 pt-2.5">
                  <span className="text-base font-black text-gray-900">${srv.price}</span>
                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => openEditModal(srv)}
                      className="p-2 border border-gray-150 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/20 transition-all cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-2 border border-gray-150 rounded-lg text-gray-400 hover:border-red-500 hover:text-red-600 hover:bg-red-50/20 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODALPOPUP */}
      <Modal isOpen={modalOpen} onClose={() => setFormLoading(false) || setModalOpen(false)} title={editTargetId ? 'Edit Service Specification' : 'Add New Service Specialty'}>
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          
          {formError && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-xl text-xs text-red-600 border border-red-100 font-semibold">
              <AlertCircle size={16} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Service Title</label>
            <input
              type="text"
            
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Split AC Deep jet cleanup repair"
              className="w-full bg-transparent px-3.5 py-2.5 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
              id="spec-title"
            />
          </div>

          {/* Pricing + Duration row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Billed Rate Price ($)</label>
              <input
                type="number"
                step="0.01"
              
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="49.00"
                className="w-full bg-transparent px-3.5 py-2.5 text-xs text-gray-850 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                id="spec-price"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Duration (Minutes)</label>
              <input
                type="number"
              
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                className="w-full bg-transparent px-3.5 py-2.5 text-xs text-gray-850 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                id="spec-duration"
              />
            </div>
          </div>

          {/* Service Image File Upload */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Service Image</label>
            <div className="flex items-center space-x-4 mt-1">
              <div className="w-16 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                {image ? (
                  <img src={image} alt="Service Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] text-gray-450 uppercase font-black">No Image</span>
                )}
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-emerald-600 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-3xs inline-block">
                  Upload Image File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setImage(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <p className="text-[9px] text-gray-450">JPG, PNG or WEBP formats</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-705 block">Broad description guidelines</label>
            <textarea
            
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide clean bullet parameters on what the servicing includes e.g. 'jet flush wash, thermostat diagnostics reports, indoor cabinet cleaning'..."
              className="w-full bg-transparent p-3 text-xs text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              id="spec-description"
            ></textarea>
          </div>

          {/* CTA panel */}
          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-450 hover:bg-gray-100 rounded-xl"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
              id="confirm-submit-spec"
            >
              {formLoading ? 'Publishing...' : 'Publish Specifications'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
}
