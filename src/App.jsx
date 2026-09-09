import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // home, search, issued, menu, aadhaarForm, aadhaarDetail, myProfile
  const [aadhaarData, setAadhaarData] = useState(null);
  
  // Custom routing for /whybro and global trolled state
  const isWhyBroPage = window.location.pathname === '/whybro';
  const [isTrolled, setIsTrolled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Global Troll State Polling via Vercel Serverless Function
  const TROLL_API = '/api/troll';

  const fetchTrollState = async () => {
    try {
      const res = await fetch(TROLL_API);
      const json = await res.json();
      if (json && json.trolled !== undefined) {
        setIsTrolled(json.trolled);
      }
    } catch (e) {
      console.error('Failed to fetch troll state');
    }
  };

  useEffect(() => {
    fetchTrollState(); // Check immediately on load
    const interval = setInterval(fetchTrollState, 60000); // Check every 1 minute to save quota
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('ligi_aadhaar_data');
    if (savedData) {
      setAadhaarData(JSON.parse(savedData));
    }
  }, []);

  const handleAadhaarClick = () => {
    if (aadhaarData) {
      setCurrentView('loading');
      setTimeout(() => {
        setCurrentView('aadhaarDetail');
      }, 800);
    } else {
      setCurrentView('aadhaarForm');
    }
  };

  const saveAadhaarData = (data) => {
    localStorage.setItem('ligi_aadhaar_data', JSON.stringify(data));
    setAadhaarData(data);
    setCurrentView('loading');
    setTimeout(() => {
      setCurrentView('aadhaarDetail');
    }, 800);
  };

  const toggleTroll = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    const newState = !isTrolled;
    try {
      await fetch(TROLL_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trolled: newState
        })
      });
      setIsTrolled(newState);
    } catch (e) {
      console.error('Failed to update troll state');
    } finally {
      setIsUpdating(false);
    }
  };

  // If user is on /whybro, show the secret toggle page
  if (isWhyBroPage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a1a', color: 'white', fontFamily: 'monospace' }}>
        <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Global Control Panel</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#333', padding: '20px', borderRadius: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>Prank Mode:</span>
          <button 
            onClick={toggleTroll}
            disabled={isUpdating}
            style={{ 
              padding: '10px 20px', 
              fontSize: '1rem', 
              fontWeight: 'bold', 
              backgroundColor: isTrolled ? '#ef4444' : '#22c55e', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.7 : 1
            }}
          >
            {isUpdating ? '...' : isTrolled ? 'ON (Visible to ALL)' : 'OFF'}
          </button>
        </div>
        <p style={{ marginTop: '20px', color: '#888', textAlign: 'center', padding: '0 20px' }}>
          When ON, the main app will be disabled for EVERYONE.
        </p>
      </div>
    );
  }

  // If prank is active and we are NOT on /whybro, show the troll view
  if (isTrolled) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#ffe4e1', textAlign: 'center', padding: '20px' }}>
        <img 
          src="https://i.pinimg.com/originals/ba/c2/06/bac206f4886b9d65d73eb803ba646e25.gif" 
          alt="Funny Gif" 
          style={{ maxWidth: '100%', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
        />
        <h2 style={{ color: '#d63384', fontFamily: 'comic sans ms, cursive, sans-serif', fontSize: '1.5rem', lineHeight: '1.5' }}>
          contact the cutie to get your scene sorted :)
        </h2>
      </div>
    );
  }

  // We only show the BottomNav on main tabs
  const isMainTab = ['home', 'search', 'issued', 'menu'].includes(currentView);

  return (
    <div className="app-container">
      {currentView === 'loading' && (
        <div className="loading-view">
          <div className="spinner"></div>
          <p>Fetching Document...</p>
        </div>
      )}
      {currentView === 'home' && <HomeView onAadhaarClick={handleAadhaarClick} onProfileClick={() => setCurrentView('myProfile')} aadhaarData={aadhaarData} />}
      {currentView === 'search' && <PlaceholderView title="Search" />}
      {currentView === 'issued' && <PlaceholderView title="Issued Documents" />}
      {currentView === 'myProfile' && <MyProfileView data={aadhaarData} onBack={() => setCurrentView('home')} onEdit={() => setCurrentView('aadhaarForm')} />}
      {currentView === 'menu' && (
        <MenuView 
          onEditAadhaar={() => setCurrentView('aadhaarForm')} 
          hasData={!!aadhaarData} 
        />
      )}
      
      {currentView === 'aadhaarForm' && (
        <AadhaarForm 
          initialData={aadhaarData}
          onSave={saveAadhaarData} 
          onBack={() => setCurrentView('home')} 
        />
      )}
      {currentView === 'aadhaarDetail' && (
        <AadhaarDetail 
          data={aadhaarData} 
          onBack={() => setCurrentView('home')} 
        />
      )}

      {isMainTab && (
        <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      )}
    </div>
  );
}

// ... (Skipping to AadhaarDetail component in next tool call) ...

function HomeView({ onAadhaarClick, onProfileClick, aadhaarData }) {
  return (
    <>
      <header className="header-container">
        <div className="top-bar">
          <div className="logo-area">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>DigiLocker</span>
          </div>
          {/* Removed status icons based on user request */}
        </div>

        <div className="welcome-section">
          <h1>Welcome, {aadhaarData ? aadhaarData.name : 'who tf ?'}</h1>
          <img 
            src={aadhaarData ? aadhaarData.photoUrl : "https://placehold.co/100x100/333/FFF?text=TF?"} 
            alt="Profile" 
            className="profile-pic clickable" 
            onClick={onProfileClick}
          />
        </div>
        
        <p className="subtitle">
          DigiLocker 'Issued Documents' are at par with original documents as per IT ACT, 2000
        </p>

        <div className="issued-header">
          <h2>Issued Document</h2>
          <button className="see-all-btn">See All</button>
        </div>
      </header>

      <section className="horizontal-scroll">
        <div className="card clickable-card" onClick={onAadhaarClick}>
          <div className="card-top">
            <img src="/Aadhaar.svg.png" alt="Aadhaar Logo" className="card-icon" style={{width: '60px', height: '60px', objectFit: 'contain'}} />
            <div className="card-info">
              <h3>Aadhaar Card</h3>
              <p>XXXX-XXXX-{aadhaarData ? aadhaarData.aadhaarSuffix : 'XXXX'}</p>
            </div>
          </div>
          <div className="card-bottom">
            Unique Identification Authority of India (UIDAI)
          </div>
        </div>

        <div className="card">
          <div className="card-top">
            <img src="/emblem.svg" alt="Ministry Logo" className="card-icon" style={{width: '50px', height: '60px', objectFit: 'contain'}} />
            <div className="card-info">
              <h3>Ministry of...</h3>
              <p>Registration No.</p>
            </div>
          </div>
          <div className="card-bottom">
            Ministry of Road Transport and Highways
          </div>
        </div>
      </section>

      <section className="umang-banner">
        <div className="banner-content">
          <h3>Access UMANG in DigiLocker</h3>
          <p>Your one-stop destination for all Government services.</p>
          <button className="access-btn">Access UMANG</button>
        </div>
        <img src="/umang.png" alt="UMANG Logo" className="banner-image" style={{width: '70px', height: '70px', objectFit: 'contain'}} />
      </section>

      <section className="utility-section">
        <h2>DigiLocker Utility</h2>
        <div className="utility-grid">
          <div className="utility-item">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
              <rect x="5" y="2" width="14" height="20" rx="3" stroke="#3b82f6" strokeWidth="1.5" />
              <rect x="9" y="8" width="6" height="5" rx="1" fill="#3b82f6" />
              <path d="M12 8V6a2 2 0 0 0-4 0" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="9" cy="18" r="1.5" fill="#f57c00" />
              <circle cx="12" cy="18" r="1.5" fill="#f57c00" />
              <circle cx="15" cy="18" r="1.5" fill="#f57c00" />
            </svg>
            <span>Authenticator</span>
          </div>
          <div className="utility-item">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
              <path d="M4 6c0-1.1.9-2 2-2h4l2 2h6c1.1 0 2 .9 2 2v2H4V6z" fill="#facc15" />
              <path d="M4 10h16v8c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-8z" fill="#fde047" />
            </svg>
            <span>Drive</span>
          </div>
          <div className="utility-item">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="2" fill="#3b82f6" />
              <circle cx="9" cy="10" r="2.5" fill="white" />
              <path d="M5 16c0-2 2.67-3 4-3s4 1 4 3v1H5v-1z" fill="white" />
              <rect x="14" y="9" width="5" height="1.5" fill="white" opacity="0.8" />
              <rect x="14" y="12" width="5" height="1.5" fill="white" opacity="0.8" />
              <rect x="14" y="15" width="5" height="1.5" fill="white" opacity="0.8" />
            </svg>
            <span>Verifiable Credential</span>
          </div>
        </div>
      </section>
    </>
  );
}

function BottomNav({ currentView, setCurrentView }) {
  return (
    <nav className="bottom-nav">
      <div className="nav-links">
        <a href="#" className={`nav-item ${currentView === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Home</span>
        </a>
        <a href="#" className={`nav-item ${currentView === 'search' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('search'); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>Search</span>
        </a>
        <a href="#" className={`nav-item ${currentView === 'issued' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('issued'); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="7"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
          </svg>
          <span>Issued</span>
        </a>
        <a href="#" className={`nav-item ${currentView === 'menu' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('menu'); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Menu</span>
        </a>
      </div>
      <button className="floating-umang">UMANG</button>
    </nav>
  );
}

function PlaceholderView({ title }) {
  return (
    <div className="placeholder-view">
      <h2>{title}</h2>
      <p>This section is under construction.</p>
    </div>
  );
}

function MenuView({ onEditAadhaar, hasData }) {
  return (
    <div className="menu-view">
      <div className="menu-header">
        <h2>Menu Options</h2>
      </div>
      <div className="menu-list">
        <button className="menu-btn" onClick={onEditAadhaar}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          {hasData ? "Edit Aadhaar Details" : "Setup Aadhaar Details"}
        </button>
      </div>
    </div>
  );
}

function AadhaarForm({ initialData, onSave, onBack }) {
  const [formData, setFormData] = useState(initialData || {
    name: 'WHO TF ?',
    dob: '2000-07-16',
    gender: 'MALE',
    address: 'enter ur address :(',
    aadhaarSuffix: '6969',
    mobile: '9876543210',
    email: 'email@example.com',
    photoUrl: 'https://placehold.co/200x250/ccc/fff?text=Photo'
  });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="form-view">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2>{initialData ? "Edit Aadhaar Data" : "Setup Aadhaar Data"}</h2>
      </div>
      
      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="form-group photo-upload">
          <img src={formData.photoUrl} alt="Preview" className="photo-preview" />
          <button type="button" onClick={() => fileInputRef.current.click()}>Upload Photo</button>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} hidden />
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <input type="text" name="dob" value={formData.dob} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        <div className="form-group">
          <label>Last 4 Digits of Aadhaar</label>
          <input type="text" name="aadhaarSuffix" value={formData.aadhaarSuffix} maxLength="4" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Mobile Number</label>
          <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email ID</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Full Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows="4" required></textarea>
        </div>

        <button type="submit" className="save-btn">Save Data</button>
      </form>
    </div>
  );
}

function AadhaarDetail({ data, onBack }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  if (!data) return null;

  const flipData = `<PrintLetterBarcodeData uid="xxxxxxxx${data.aadhaarSuffix}" name="${data.name}" gender="${data.gender ? data.gender.charAt(0) : 'M'}" dob="${data.dob}" address="${data.address}"/>`;
  
  return (
    <div className="detail-view">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2>Aadhaar Card</h2>
        <img 
          src={data.photoUrl} 
          alt="Profile" 
          className="header-profile-pic clickable" 
          onClick={() => setShowProfileModal(true)}
        />
      </div>

      {/* Profile Modal Overlay */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="profile-modal">
            <button className="close-modal-btn" onClick={() => setShowProfileModal(false)}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
              </svg>
            </button>
            <div className="modal-header-curve"></div>
            <img src={data.photoUrl} alt="User Photo" className="modal-profile-pic" />
            <h3 className="modal-name">{data.name}</h3>
            <p className="modal-info">DOB : {data.dob} | Gender : {data.gender}</p>
            <img src="/unknown2.png" alt="DigiLocker Badge" className="modal-badge-logo" />
          </div>
        </div>
      )}

      {/* Main Card Container with Flip */}
      <div className={`aadhaar-flip-container ${isFlipped ? 'flipped' : ''}`}>
        <div className="aadhaar-flipper">
          
          {/* Front of Card */}
          <div className="aadhaar-document-card aadhaar-front">
            {/* Top Logos Image */}
            <div className="aadhaar-card-header-exact">
              <img src="/unknown.png" alt="Aadhaar Top Logos" className="exact-top-logos" />
            </div>

            {/* Identity Section */}
            <div className="aadhaar-identity">
              <img src={data.photoUrl} alt="User Photo" className="user-photo" />
              <div className="user-details">
                <h3 className="user-name">{data.name}</h3>
                <p className="user-dob">{data.dob}</p>
                <p className="user-gender">{data.gender}</p>
                <h2 className="user-aadhaar-number">xxxxxxxx{data.aadhaarSuffix}</h2>
              </div>
            </div>

            <hr className="divider" />

            {/* Address Section */}
            <div className="aadhaar-address">
              <h4>Address</h4>
              <p>{data.address}</p>
            </div>

            <hr className="divider-light" />

            {/* Bottom Section */}
            <div className="aadhaar-footer">
              <div className="digilocker-badge-exact">
                 <img src="/unknown2.png" alt="Powered by DigiLocker" className="exact-badge-logo" />
              </div>
              
              <div className="qr-section" onClick={() => setIsFlipped(true)} style={{cursor: 'pointer'}}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(data.name)}`} alt="QR Code" className="qr-code" />
                <span>Tap to Zoom</span>
              </div>
            </div>

            <div className="aadhaar-slogan-exact">
               <img src="/unknown3.png" alt="Mera Aadhaar Meri Pehchaan" className="exact-slogan-image" onError={(e) => {
                 e.target.style.display = 'none';
                 e.target.nextSibling.style.display = 'block';
               }} />
               <div style={{display: 'none', textAlign: 'center', fontSize: '1.1rem', fontWeight: '600', marginTop: '10px'}}>
                  मेरा <span className="red-text">आधार</span>, मेरी पहचान
               </div>
            </div>
          </div>

          {/* Back of Card */}
          <div className="aadhaar-document-card aadhaar-back">
            <div className="aadhaar-back-header">
               <h3>Document Details</h3>
               <button className="close-flip-btn" onClick={() => setIsFlipped(false)}>✖</button>
            </div>
            <div className="aadhaar-back-qr-container">
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(flipData)}`} alt="Full Details QR" className="large-qr" />
            </div>
            <p className="aadhaar-back-text">Scan this QR to view full Aadhaar details</p>
          </div>

        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <p className="info-title">Did you know?</p>
        <p className="info-desc">Indian Railways and Airports accept Digital Aadhaar through DigiLocker as valid identity proof.</p>
      </div>

      {/* Share Box */}
      <div className="share-box">
        <span className="share-text">Tell your friends and family about DigiLocker</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </div>

      {/* Simple Bottom Nav for Detail view */}
      <div className="simple-bottom-nav">
        <svg viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
    </div>
  );
}

function MyProfileView({ data, onBack, onEdit }) {
  if (!data) return null;

  return (
    <div className="my-profile-view">
      <div className="profile-header-bg">
        <div className="profile-header-top">
          <button className="back-btn-white" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h2>My Profile</h2>
          <div className="header-right-icons">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.34-11.14l4.5 4.5" />
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-main-info">
          <img src={data.photoUrl} alt="User Photo" className="large-profile-pic" />
          <h2 className="profile-name">{data.name}</h2>
          <div className="verified-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Verified
          </div>
          <button className="vcard-btn">
            Generate vCard 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{marginLeft: '8px'}}>
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
        </div>

        <div className="profile-details-card">
          <div className="detail-row">
            <span className="detail-label">DOB</span>
            <span className="detail-value">{data.dob}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Gender</span>
            <span className="detail-value">{data.gender}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Mobile</span>
            <span className="detail-value flex-between">
              {data.mobile}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="edit-icon" onClick={onEdit}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value flex-between">
              {data.email}
              <button className="add-email-btn" onClick={onEdit}>Edit Email &rsaquo;</button>
            </span>
          </div>
        </div>

        <div className="quick-links-section">
          <h3>Quick Links</h3>
          <div className="quick-links-grid">
            <button className="quick-link-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" width="18" height="18">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              My Account
            </button>
            <button className="quick-link-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" width="18" height="18">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Nominee
            </button>
            <button className="quick-link-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" width="18" height="18">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              My Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
