import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { CarryPage } from '../pages/CarryPage'
import { HomePage } from '../pages/HomePage'
import { Love10Page } from '../pages/Love10Page'
import { PlaceValuePage } from '../pages/PlaceValuePage'
import { ProgressPage } from '../pages/ProgressPage'
import { SettingsPage } from '../pages/SettingsPage'
import { SprintPage } from '../pages/SprintPage'
import { ZerlegenPage } from '../pages/ZerlegenPage'

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="mode/love10" element={<Love10Page />} />
        <Route path="mode/placevalue" element={<PlaceValuePage />} />
        <Route path="mode/carry" element={<CarryPage />} />
        <Route path="mode/sprint" element={<SprintPage />} />
        <Route path="mode/zerlegen" element={<ZerlegenPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
