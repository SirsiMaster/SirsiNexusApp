import { useState, useEffect } from 'react'
import { useParams, useRouter } from '@tanstack/react-router'
import '../../styles/admin-layout.css'
import '../../styles/contract.css'
import './styles/themes.css'

import { Sidebar } from '../layout/Sidebar'
import { AdminHeader } from '../layout/AdminHeader'
import { ContractTabs } from '../layout/ContractTabs'
import { useConfigStore, useCurrentTab } from '../../store/useConfigStore'
import { useSettings } from '../../hooks/useAdmin'

import { ExecutiveSummary } from '../tabs/ExecutiveSummary'
import { ConfigureSolution } from '../tabs/ConfigureSolution'
import { MasterAgreement } from '../tabs/MasterAgreement'
import { SirsiVault } from '../tabs/SirsiVault'

export function AgreementWorkflow() {
  const params = useParams({ strict: false }) as any
  const { projectId, userId, category, entityId, docId } = params
  const { navigate } = useRouter()
  const currentTab = useCurrentTab()
  const setProjectId = useConfigStore(s => s.setProjectId)
  const setContractId = useConfigStore(s => s.setContractId)
  const fetchContract = useConfigStore(s => s.fetchContract)
  const storeProjectId = useConfigStore(s => s.projectId)
  const setCurrentTab = useConfigStore(s => s.setCurrentTab)
  const clientName = useConfigStore(s => s.clientName)
  const setClientInfo = useConfigStore(s => s.setClientInfo)
  const setStore = useConfigStore.setState
  const { data: settings } = useSettings()
  const setSystemSettings = useConfigStore(s => s.setSystemSettings)

  // Context detection
  const isVaultContext = !!userId
  const isSignDomain = window.location.hostname === 'sign.sirsi.ai' || window.location.hostname === 'sirsi-sign.web.app'
  const isAdminPath = window.location.pathname.includes('/admin/')
  const showSidebar = !isVaultContext && !isSignDomain && isAdminPath

  const searchParams = new URLSearchParams(window.location.search)
  const isPaymentSuccess = searchParams.get('session_id') !== null && window.location.pathname.endsWith('/payment/success')

  const [isLightTheme, setIsLightTheme] = useState(false)

  // --- Effects ---

  useEffect(() => {
    const targetProjectId = entityId || projectId
    if (targetProjectId) setProjectId(targetProjectId)

    if (docId) {
      setContractId(docId)
      fetchContract(docId)
    } else {
      setContractId(null)
    }

    // Default to MSA tab when opening a specific vault document
    if ((category === 'contracts') && docId) {
      setCurrentTab('msa')
    }

    // Dynamic personalization
    const clientParam = searchParams.get('client') || (userId ? userId.charAt(0).toUpperCase() + userId.slice(1).replace(/-/g, ' ') : null)
    const emailParam = searchParams.get('email') || (userId ? `${userId}@lockhart.com` : null)
    if (clientParam || emailParam) setClientInfo(clientParam || '', emailParam || '')

    const projectParam = searchParams.get('project')
    const companyParam = searchParams.get('company')
    if (projectParam) setStore({ projectName: projectParam })
    if (companyParam) setStore({ companyName: companyParam })

    const entityParam = searchParams.get('entity')
    const cpNameParam = searchParams.get('cpName')
    const cpTitleParam = searchParams.get('cpTitle')
    if (entityParam || cpNameParam || cpTitleParam) {
      const current = useConfigStore.getState()
      current.setCounterpartyInfo(
        entityParam || current.entityLegalName,
        cpNameParam || current.counterpartyName,
        cpTitleParam || current.counterpartyTitle
      )
    }
  }, [projectId, setProjectId, setClientInfo, setStore])

  useEffect(() => {
    if (settings) {
      setSystemSettings({ multiplier: settings.sirsiMultiplier, maintenanceMode: settings.maintenanceMode })
    }
  }, [settings, setSystemSettings])

  useEffect(() => {
    document.body.classList.toggle('theme-light', isLightTheme)
  }, [isLightTheme])

  // --- Render ---

  const renderTab = () => {
    switch (currentTab) {
      case 'summary': return <ExecutiveSummary />
      case 'configure': return <ConfigureSolution />
      case 'msa': return <MasterAgreement />
      case 'vault': return <SirsiVault />
      default: return <ExecutiveSummary />
    }
  }

  const wrapperClass = `admin-wrapper${isLightTheme ? ' theme-light' : ''}${showSidebar ? ' has-sidebar' : ''}`

  return (
    <div className={wrapperClass} data-auth-protect="admin">

      {/* Sidebar — legacy admin only (App Dashboard context) */}
      {showSidebar && <Sidebar />}

      {/* Main Content */}
      <main className="main-content contract-view">

        {/* Vault: breadcrumb bar */}
        {isVaultContext && (
          <div className="vault-breadcrumb">
            <button className="vault-breadcrumb-btn" onClick={() => navigate({ to: '/vault' })}>
              ← Back to Vault
            </button>
            <div className="vault-breadcrumb-divider" />
            <span className="vault-breadcrumb-ref">
              {entityId || projectId || 'Contract'}{docId ? ` • ${docId.substring(0, 8).toUpperCase()}` : ''}
            </span>
          </div>
        )}

        {/* Admin header — legacy admin only (App Dashboard context) */}
        {showSidebar && (
          <AdminHeader isLightTheme={isLightTheme} onToggleTheme={() => setIsLightTheme(!isLightTheme)} />
        )}

        {/* Contract Content */}
        <div className="contract-immersive-wrapper">

          {/* Title */}
          <div className="contract-hero">
            <div className="contract-title-wrapper">
              <h1 className="contract-main-heading">Master Service Agreement</h1>
              <div className="contract-gold-divider" />
              <p className="contract-subtitle">
                Prepared for {clientName || 'The Client'} •{' '}
                <span id="date-proposal">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </p>
            </div>
          </div>

          {/* Tabs + Content */}
          <div className="main-card">
            {isPaymentSuccess ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '32px', color: '#C8A951', marginBottom: '1rem' }}>
                  Payment Received!
                </h2>
                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
                  Your Master Service Agreement with {storeProjectId === 'finalwishes' ? 'FinalWishes' : storeProjectId} is now ACTIVE.
                </p>
                <button onClick={() => navigate({ to: '/vault' })} className="select-plan-btn">
                  Access Your Sirsi Vault →
                </button>
              </div>
            ) : (
              <>
                <ContractTabs />
                <div className="tab-content active">
                  {renderTab()}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AgreementWorkflow
