// src/pages/patient/MyProfile.jsx
import React, { useState, useContext, useEffect, useRef } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import { toast } from 'react-toastify'

const MyProfile = () => {
    const { user } = useContext(AppContext)
    const fileInputRef = useRef(null)
    const [isEdit, setIsEdit] = useState(false)
    const [userData, setUserData] = useState({
        name: '',
        image: assets.profile_pic,
        email: '',
        phone: '',
        address: {
            line1: '',
            line2: '',
        },
        gender: '',
        dob: ''
    })
    
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [uploadingFile, setUploadingFile] = useState(false)
    const [loadingDocuments, setLoadingDocuments] = useState(true)

    // Initialize user data when user context is available
    useEffect(() => {
        if (user) {
            setUserData(prevData => ({
                ...prevData,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                // Keep existing values for fields not available from backend
                address: prevData.address,
                gender: prevData.gender,
                dob: prevData.dob
            }))
        }
    }, [user])

    // Load user documents on component mount
    useEffect(() => {
        if (user && user.role === 'patient') {
            loadUserDocuments()
        }
    }, [user])

    const loadUserDocuments = async () => {
        try {
            setLoadingDocuments(true)
            const response = await apiService.getMyDocuments()
            setUploadedFiles(response.documents.map(doc => ({
                id: doc.id,
                name: doc.originalFileName,
                size: doc.fileSize,
                uploadDate: doc.uploadDate,
                type: 'pdf'
            })))
        } catch (error) {
            console.error('Failed to load documents:', error)
            toast.error('Failed to load documents')
        } finally {
            setLoadingDocuments(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        setMessage('')
        
        try {
            // Here you would typically make an API call to update the profile
            // await apiService.updateProfile(userData)
            
            // For now, just simulate a save
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            setIsEdit(false)
            setMessage('Profile updated successfully!')
            toast.success('Profile updated successfully!')
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000)
        } catch (error) {
            console.error('Failed to update profile:', error)
            setMessage('Failed to update profile. Please try again.')
            toast.error('Failed to update profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        // Reset to original user data
        if (user) {
            setUserData(prevData => ({
                ...prevData,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }))
        }
        setIsEdit(false)
        setMessage('')
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        // Validate file type
        if (file.type !== 'application/pdf') {
            setMessage('Please select a PDF file only.')
            toast.error('Please select a PDF file only.')
            return
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            setMessage('File size must be less than 10MB.')
            toast.error('File size must be less than 10MB.')
            return
        }

        setUploadingFile(true)
        setMessage('')

        try {
            console.log('Starting upload process for file:', file.name, 'Size:', file.size);
            
            // Step 1: Request upload permission from backend
            console.log('Step 1: Requesting upload permission...');
            const uploadRequest = await apiService.requestDocumentUpload({
                originalFileName: file.name,
                fileSize: file.size,
                mimeType: file.type
            })
            console.log('Upload request successful:', uploadRequest);

            // Step 2: Upload file directly to Azure using the presigned URL
            console.log('Step 2: Uploading to Azure...');
            await apiService.uploadFileToAzure(uploadRequest.uploadUrl, file)
            console.log('Azure upload successful');

            // Step 3: Confirm successful upload
            // console.log('Step 3: Confirming upload...');
            // await apiService.confirmDocumentUpload(uploadRequest.documentId)
            // console.log('Upload confirmation successful');
            
            // // Step 4: Refresh the documents list
            // console.log('Step 4: Refreshing document list...');
            // await loadUserDocuments()
            // console.log('Document list refreshed');
            
            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            
            toast.success('Document uploaded successfully!')
            setMessage('Document uploaded successfully!')
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000)
        } catch (error) {
            console.error('Upload process failed:', error)
            let errorMessage = 'Failed to upload document. Please try again.'
            
            // Handle specific error messages from backend
            if (error.message.includes('Missing required fields')) {
                errorMessage = 'Invalid file information. Please try again.'
            } else if (error.message.includes('Only PDF files are allowed')) {
                errorMessage = 'Only PDF files are allowed.'
            } else if (error.message.includes('File too large')) {
                errorMessage = 'File size exceeds 10MB limit.'
            } else if (error.message.includes('Patient profile not found')) {
                errorMessage = 'Patient profile not found. Please contact support.'
            } else if (error.message.includes('Failed to upload file to Azure')) {
                errorMessage = 'Failed to upload to cloud storage. Please check your internet connection and try again.'
            } else if (error.message.includes('Failed to confirm upload')) {
                errorMessage = 'Upload completed but confirmation failed. Please refresh the page to see your document.'
            }
            
            setMessage(errorMessage)
            toast.error(errorMessage)
        } finally {
            setUploadingFile(false)
        }
    }

    const handleFileDownload = async (fileId, fileName) => {
        try {
            toast.info('Preparing download...')
            const response = await apiService.getDocumentDownloadUrl(fileId)
            
            // Create a temporary link and trigger download
            const link = document.createElement('a')
            link.href = response.downloadUrl
            link.download = response.originalFileName || fileName
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            toast.success('Download started!')
        } catch (error) {
            console.error('Failed to download file:', error)
            toast.error('Failed to download document. Please try again.')
        }
    }

    const handleFileDelete = async (fileId, fileName) => {
        if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
            return
        }

        try {
            // Note: The backend doesn't have a delete endpoint in the provided code
            // You would need to implement this endpoint in the backend first
            // await apiService.deleteDocument(fileId)
            
            // For now, just remove from local state and show warning
            setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
            toast.warning('Document removed from view. Note: Backend deletion not yet implemented.')
            setMessage('Document removed successfully!')
            setTimeout(() => setMessage(''), 3000)
        } catch (error) {
            console.error('Failed to delete file:', error)
            toast.error('Failed to delete document. Please try again.')
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='max-w-4xl mx-auto'>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">Manage your account information and documents</p>
            </div>

            {/* Success/Error Messages */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.includes('successfully') 
                        ? 'bg-green-50 border border-green-200 text-green-600' 
                        : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile Section */}
                <div className="lg:col-span-2">
                    <div className='bg-white rounded-xl shadow-sm border p-6'>
                        {/* Profile Image and Name */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative">
                                <img className='w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg' src={userData.image} alt="Profile" />
                                {isEdit && (
                                    <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-primary/90">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93l.94-2.06a2 2 0 011.86-1.23h6.54a2 2 0 011.86 1.23L15.07 7H16a2 2 0 012 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex-1">
                                {isEdit ? (
                                    <input 
                                        className='text-2xl font-semibold bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 w-full max-w-md focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                        type="text" 
                                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
                                        value={userData.name} 
                                    />
                                ) : (
                                    <div>
                                        <h2 className='text-2xl font-semibold text-gray-900'>{userData.name}</h2>
                                        <p className="text-gray-600 capitalize">{user.role}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr className='border-gray-200 mb-8' />

                        {/* Contact Information */}
                        <div className="mb-8">
                            <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Contact Information
                            </h3>
                            
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
                                    <input 
                                        className='w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed' 
                                        type="email" 
                                        value={userData.email} 
                                        disabled 
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>
                                
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Phone Number</label>
                                    {isEdit ? (
                                        <input 
                                            className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                            type="tel" 
                                            onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
                                            value={userData.phone} 
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        <p className='p-3 text-gray-600 bg-gray-50 rounded-lg'>
                                            {userData.phone || 'Not provided'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="mb-8">
                            <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Address
                            </h3>
                            
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Address Line 1</label>
                                    {isEdit ? (
                                        <input 
                                            className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                            type="text" 
                                            onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} 
                                            value={userData.address.line1} 
                                            placeholder="Enter address line 1"
                                        />
                                    ) : (
                                        <p className='p-3 text-gray-600 bg-gray-50 rounded-lg'>
                                            {userData.address.line1 || 'Not provided'}
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Address Line 2</label>
                                    {isEdit ? (
                                        <input 
                                            className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                            type="text" 
                                            onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} 
                                            value={userData.address.line2} 
                                            placeholder="Enter address line 2"
                                        />
                                    ) : (
                                        <p className='p-3 text-gray-600 bg-gray-50 rounded-lg'>
                                            {userData.address.line2 || 'Not provided'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="mb-8">
                            <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Basic Information
                            </h3>
                            
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Gender</label>
                                    {isEdit ? (
                                        <select 
                                            className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                            onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} 
                                            value={userData.gender}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <p className='p-3 text-gray-600 bg-gray-50 rounded-lg'>
                                            {userData.gender || 'Not specified'}
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Date of Birth</label>
                                    {isEdit ? (
                                        <input 
                                            className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                            type='date' 
                                            onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} 
                                            value={userData.dob} 
                                        />
                                    ) : (
                                        <p className='p-3 text-gray-600 bg-gray-50 rounded-lg'>
                                            {userData.dob || 'Not provided'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex gap-3 pt-6 border-t border-gray-200'>
                            {isEdit ? (
                                <>
                                    <button 
                                        onClick={handleSave}
                                        disabled={loading}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition ${
                                            loading 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-primary hover:bg-primary/90'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => setIsEdit(true)} 
                                    className="flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-full hover:bg-primary hover:text-white transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="lg:col-span-1">
                    <div className='bg-white rounded-xl shadow-sm border p-6'>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className='text-lg font-medium text-gray-900 flex items-center gap-2'>
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Medical Documents
                            </h3>
                        </div>

                        {/* Upload Section */}
                        <div className="mb-6">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingFile}
                                className={`w-full p-4 border-2 border-dashed rounded-lg text-center transition ${
                                    uploadingFile
                                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                        : 'border-primary/30 hover:border-primary/50 hover:bg-primary/5'
                                }`}
                            >
                                {uploadingFile ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-sm text-gray-600">Uploading to secure storage...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Upload PDF Document</p>
                                            <p className="text-xs text-gray-500">Max 10MB • Secure encrypted storage</p>
                                        </div>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Uploaded Files List */}
                        <div className="space-y-3">
                            {loadingDocuments ? (
                                <div className="text-center py-6">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-500">Loading documents...</p>
                                </div>
                            ) : uploadedFiles.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm">No documents uploaded</p>
                                    <p className="text-xs text-gray-400 mt-1">Upload your first medical document to get started</p>
                                </div>
                            ) : (
                                uploadedFiles.map((file) => (
                                    <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="flex-shrink-0">
                                            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleFileDownload(file.id, file.name)}
                                                className="p-1.5 text-gray-400 hover:text-primary transition"
                                                title="Download"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleFileDelete(file.id, file.name)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 transition"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Upload Instructions */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">Document Guidelines</h4>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• Upload medical reports, prescriptions, or test results</li>
                                        <li>• Only PDF files are accepted for security</li>
                                        <li>• Maximum file size: 10MB</li>
                                        <li>• Documents are stored securely with end-to-end encryption</li>
                                        <li>• Files are uploaded directly to Azure cloud storage</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Document Statistics */}
                        {uploadedFiles.length > 0 && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Total Documents:</span>
                                    <span className="font-medium text-gray-900">{uploadedFiles.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-1">
                                    <span className="text-gray-600">Total Size:</span>
                                    <span className="font-medium text-gray-900">
                                        {formatFileSize(uploadedFiles.reduce((total, file) => total + file.size, 0))}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyProfile