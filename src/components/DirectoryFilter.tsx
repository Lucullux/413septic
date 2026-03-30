import { useState, useMemo } from 'react';

interface Contractor {
  name: string;
  slug: string;
  tier: 'free' | 'claimed' | 'featured';
  location: string;
  phone?: string | null;
  services: string[];
  townsServed: string[];
  emergencyService: boolean;
  multiSourceVerified: boolean;
  status: string;
  flagged: boolean;
  yearsInBusiness?: number | null;
  description?: string | null;
}

interface Props {
  contractors: Contractor[];
  towns: string[];
  serviceOptions: { slug: string; name: string }[];
}

const serviceLabels: Record<string, string> = {
  'septic-pumping': 'Pumping',
  'title-5-inspection': 'Title 5 Inspection',
  'perc-test': 'Perc Test',
  'system-replacement': 'System Replacement',
  'emergency-service': 'Emergency Service',
  'cesspool-conversion': 'Cesspool Conversion',
  'new-system-installation': 'New Installation',
  'septic-inspection': 'Inspection',
  'leach-field-repair': 'Leach Field Repair',
  'pump-replacement': 'Pump Replacement',
  'mound-system': 'Mound System',
  'ia-system-maintenance': 'I/A Maintenance',
  'effluent-filter-cleaning': 'Filter Cleaning',
  'baffle-repair': 'Baffle Repair',
  'distribution-box-repair': 'D-Box Repair',
  'tank-lid-riser-installation': 'Tank Lid/Riser',
  'pipe-repair': 'Pipe Repair',
  'bedroom-addition-compliance': 'Bedroom Addition',
  'adu-septic-compliance': 'ADU Compliance',
  'high-water-table-response': 'High Water Table',
  'line-jetting': 'Line Jetting',
  'septic-system-design': 'System Design',
};

function ContractorCard({ c }: { c: Contractor }) {
  const tierBadge = c.tier === 'featured'
    ? <span style={{ background: '#ea6c0a', color: 'white', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '6px' }}>Featured</span>
    : c.tier === 'claimed'
    ? <span style={{ background: '#316d33', color: 'white', fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', marginRight: '6px' }}>Verified</span>
    : null;

  return (
    <div style={{
      background: 'white',
      border: c.tier === 'featured' ? '1.5px solid #ea6c0a' : '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div>
          <div style={{ marginBottom: '2px' }}>{tierBadge}
            {c.multiSourceVerified && c.tier === 'free' && (
              <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 7px', borderRadius: '4px' }}>✓ Multi-source</span>
            )}
          </div>
          <a href={`/directory/${c.slug}/`} style={{ fontSize: '17px', fontWeight: 700, color: '#28572a', textDecoration: 'none' }}>
            {c.name}
          </a>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{c.location}, MA</div>
        </div>
      </div>

      {c.description && (
        <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {c.description}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {c.services.slice(0, 6).map(s => (
          <span key={s} style={{ background: '#faf7f2', border: '1px solid #e4d5bf', color: '#5e402d', fontSize: '11px', padding: '2px 8px', borderRadius: '999px' }}>
            {serviceLabels[s] ?? s}
          </span>
        ))}
        {c.services.length > 6 && <span style={{ fontSize: '11px', color: '#9ca3af' }}>+{c.services.length - 6} more</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f3f4f6', marginTop: 'auto' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {c.emergencyService && <span style={{ color: '#dc2626', fontWeight: 600 }}>⚡ 24/7 Emergency</span>}
          {c.yearsInBusiness && <span>{c.yearsInBusiness}+ yrs</span>}
          <span>{c.townsServed.length} towns</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {c.phone && (
            <a href={`tel:${c.phone.replace(/\D/g, '')}`} style={{ fontSize: '13px', fontWeight: 600, color: '#316d33', textDecoration: 'none' }}>{c.phone}</a>
          )}
          <a href={`/directory/${c.slug}/`} style={{ fontSize: '12px', background: '#315c33', color: 'white', padding: '5px 12px', borderRadius: '5px', fontWeight: 500, textDecoration: 'none' }}>
            View Profile
          </a>
        </div>
      </div>

      {(c.flagged || c.status === 'possibly-closed') && (
        <p style={{ fontSize: '11px', color: c.status === 'possibly-closed' ? '#b91c1c' : '#92400e', background: c.status === 'possibly-closed' ? '#fef2f2' : '#fffbeb', border: `1px solid ${c.status === 'possibly-closed' ? '#fecaca' : '#fde68a'}`, borderRadius: '4px', padding: '4px 8px', margin: 0 }}>
          {c.status === 'possibly-closed' ? '⚠ May be closed — verify before calling' : '⚠ Status unconfirmed — verify before calling'}
        </p>
      )}
    </div>
  );
}

export default function DirectoryFilter({ contractors, towns, serviceOptions }: Props) {
  const [townFilter, setTownFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return contractors.filter(c => {
      if (townFilter && !c.townsServed.includes(townFilter)) return false;
      if (serviceFilter && !c.services.includes(serviceFilter)) return false;
      if (emergencyOnly && !c.emergencyService) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.location.toLowerCase().includes(q) &&
          !c.services.some(s => (serviceLabels[s] ?? s).toLowerCase().includes(q))
        ) return false;
      }
      return true;
    });
  }, [contractors, townFilter, serviceFilter, emergencyOnly, search]);

  const featured = filtered.filter(c => c.tier === 'featured');
  const rest = filtered.filter(c => c.tier !== 'featured');

  const inputStyle = {
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '7px 11px',
    fontSize: '13px',
    background: 'white',
    color: '#374151',
    outline: 'none',
  };

  return (
    <div>
      {/* Filter bar */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search contractors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, minWidth: '160px', flex: '1 1 160px' }}
        />
        <select value={townFilter} onChange={e => setTownFilter(e.target.value)} style={{ ...inputStyle, flex: '1 1 140px' }}>
          <option value="">All towns</option>
          {towns.map(t => (
            <option key={t} value={t}>{t.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
        <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} style={{ ...inputStyle, flex: '1 1 160px' }}>
          <option value="">All services</option>
          {serviceOptions.map(s => (
            <option key={s.slug} value={s.slug}>{s.name}</option>
          ))}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input
            type="checkbox"
            checked={emergencyOnly}
            onChange={e => setEmergencyOnly(e.target.checked)}
            style={{ accentColor: '#dc2626', width: '15px', height: '15px' }}
          />
          24/7 emergency only
        </label>
        {(townFilter || serviceFilter || emergencyOnly || search) && (
          <button
            onClick={() => { setTownFilter(''); setServiceFilter(''); setEmergencyOnly(false); setSearch(''); }}
            style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', textDecoration: 'underline' }}
          >
            Clear filters
          </button>
        )}
        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
          No contractors match these filters. Try broadening your search or <a href="/directory/" style={{ color: '#316d33' }}>view all listings</a>.
        </p>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c45c08', marginBottom: '10px' }}>Featured Listings</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {featured.map(c => <ContractorCard key={c.slug} c={c} />)}
          </div>
        </div>
      )}

      {/* All */}
      {rest.length > 0 && (
        <div>
          {featured.length > 0 && <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: '10px' }}>All Listings</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {rest.map(c => <ContractorCard key={c.slug} c={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
