import React from 'react'
import { createRoot } from 'react-dom/client'
import CampaignLandingPage from './components/public/CampaignLandingPage'
import './landing.css'

const dummyCampaign = {
  name: 'Biostack — launch waitlist',
  protocolIds: []
}

const root = createRoot(document.getElementById('root')!)
root.render(<CampaignLandingPage campaign={dummyCampaign as any} />)
