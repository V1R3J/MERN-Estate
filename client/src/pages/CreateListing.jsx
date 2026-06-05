import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  FaHome, FaMapMarkerAlt, FaAlignLeft, FaBed, FaBath,
  FaCar, FaCouch, FaTag, FaDollarSign, FaPercent,
  FaCloudUploadAlt, FaPlusCircle, FaCheckSquare, FaStar, FaTrash,
} from 'react-icons/fa'

function CreateListing() {
  const [images, setImages] = useState([])
  const [coverIndex, setCoverIndex] = useState(0)

  const onDrop = useCallback((acceptedFiles) => {
    const newImgs = acceptedFiles.slice(0, 6 - images.length).map(file =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    )
    setImages(prev => [...prev, ...newImgs].slice(0, 6))
  }, [images])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: true,
  })

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    if (coverIndex >= i && coverIndex > 0) setCoverIndex(c => c - 1)
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-green-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
            <FaHome />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Create Listing</h1>
        </div>
        <p className="text-slate-500 pl-1">Fill in the details below to publish your property listing.</p>
      </div>

      <form className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Basic Info */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-5 flex items-center gap-2">
              <FaHome className="text-green-400" /> Basic Information
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Property Name</label>
                <input type="text" placeholder="e.g. Cozy Downtown Studio" id="name" maxLength="62" minLength="10" required
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl py-2.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <FaAlignLeft className="mr-1.5 text-slate-400 inline" /> Description
                </label>
                <textarea placeholder="Describe the property — layout, neighbourhood, nearby landmarks..." id="description" required
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl py-2.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition resize-none min-h-[100px]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <FaMapMarkerAlt className="mr-1.5 text-slate-400 inline" /> Address
                </label>
                <input type="text" placeholder="123 Main Street, City, State" id="address" required
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl py-2.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition" />
              </div>
            </div>
          </section>

          {/* Listing Options */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-5 flex items-center gap-2">
              <FaCheckSquare className="text-green-400" /> Listing Options
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'sell',      Icon: FaTag,     label: 'For Sale',      color: 'green' },
                { id: 'rent',      Icon: FaHome,    label: 'For Rent',      color: 'violet' },
                { id: 'parking',   Icon: FaCar,     label: 'Parking Spot',  color: 'amber' },
                { id: 'furnished', Icon: FaCouch,   label: 'Furnished',     color: 'emerald' },
                { id: 'offer',     Icon: FaPercent, label: 'Special Offer', color: 'rose' },
              ].map(({ id, Icon, label, color }) => (
                <label key={id} htmlFor={id}
                  className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-100 bg-slate-50 cursor-pointer hover:border-green-300 hover:bg-green-50 transition group">
                  <input type="checkbox" id={id} className="accent-green-600 w-4 h-4 rounded" />
                  <Icon className="text-green-400 group-hover:text-green-500 transition" />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Room Details */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-5 flex items-center gap-2">
              <FaBed className="text-green-400" /> Room Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'bedrooms',  Icon: FaBed,  label: 'Bedrooms',  color: 'text-green-400' },
                { id: 'bathrooms', Icon: FaBath, label: 'Bathrooms', color: 'text-violet-400' },
              ].map(({ id, Icon, label, color }) => (
                <div key={id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <label htmlFor={id} className={`flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3`}>
                    <Icon className={color} /> {label}
                  </label>
                  <input type="number" id={id} min="1" max="10" defaultValue="1" required
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-5 flex items-center gap-2">
              <FaDollarSign className="text-green-400" /> Pricing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'regularPrice',  label: 'Regular Price', bg: 'bg-green-50',  border: 'border-green-100', labelColor: 'text-green-600',  ring: 'focus:ring-green-500', inputBorder: 'border-green-200', dollarColor: 'text-green-400' },
                { id: 'discountPrice', label: 'Discount Price', bg: 'bg-rose-50', border: 'border-rose-100',  labelColor: 'text-rose-500',   ring: 'focus:ring-rose-400',  inputBorder: 'border-rose-200',  dollarColor: 'text-rose-400' },
              ].map(({ id, label, bg, border, labelColor, ring, inputBorder, dollarColor }) => (
                <div key={id} className={`${bg} border ${border} rounded-xl p-4`}>
                  <label className={`block text-xs font-semibold ${labelColor} uppercase tracking-wider mb-1`}>{label}</label>
                  <p className="text-xs text-slate-400 mb-3">per month</p>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-semibold ${dollarColor}`}>$</span>
                    <input type="number" id={id} min="1" max="1000000" required placeholder="0"
                      className={`w-full bg-white border ${inputBorder} rounded-lg py-2 pl-7 pr-3 text-slate-800 focus:outline-none focus:ring-2 ${ring} transition`} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-6">

          {/* Photos */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-1 flex items-center gap-2">
              <FaCloudUploadAlt className="text-green-400" /> Photos
            </h2>
            <p className="text-xs text-slate-400 mb-4">Max 6 images. Click a thumbnail to set cover.</p>

            {/* Dropzone */}
            <div {...getRootProps()} className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition
              ${isDragActive ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-green-400 hover:bg-green-50'}`}>
              <input {...getInputProps()} />
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <FaCloudUploadAlt className="text-green-500 text-lg" />
              </div>
              <p className="text-sm font-semibold text-slate-700">{isDragActive ? 'Drop here!' : 'Drag & drop or click'}</p>
              <p className="text-xs text-slate-400">PNG, JPG, WEBP · Max 6</p>
            </div>

            {/* Thumbnails */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <div key={i} onClick={() => setCoverIndex(i)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition
                      ${i === coverIndex
                        ? 'border-green-500 shadow-md col-span-3 h-40'
                        : 'border-slate-200 hover:border-green-300 h-20'}`}>
                    <img src={img.preview} alt={`upload-${i}`} className="w-full h-full object-cover" />
                    {/* Cover badge */}
                    {i === coverIndex && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FaStar className="text-yellow-300 text-[10px]" /> Cover
                      </span>
                    )}
                    {/* Set cover button (non-cover images) */}
                    {i !== coverIndex && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition text-white text-xs font-semibold">
                        Set Cover
                      </span>
                    )}
                    {/* Remove */}
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                      className="absolute top-1.5 right-1.5 bg-white/80 hover:bg-red-500 hover:text-white text-slate-600 rounded-full w-5 h-5 flex items-center justify-center shadow transition">
                      <FaTrash className="text-[9px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Submit */}
          <section className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="font-bold text-lg mb-1">Ready to publish?</h2>
            <p className="text-green-200 text-sm mb-5">Review all the details and submit your listing.</p>
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 bg-white text-green-600 hover:bg-green-50 py-3 px-4 rounded-xl font-bold text-sm shadow hover:shadow-md transition">
              <FaPlusCircle /> Create Listing
            </button>
          </section>

          {/* Tips */}
          <section className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">💡 Tips</h3>
            <ul className="text-xs text-amber-700 space-y-2 list-disc list-inside leading-relaxed">
              <li>Add at least 4 high-quality photos for better visibility.</li>
              <li>Include nearby landmarks in the description.</li>
              <li>Set a competitive discount to attract more buyers.</li>
            </ul>
          </section>
        </div>

      </form>
    </main>
  )
}

export default CreateListing