import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Chat from './pages/Chat'
import Coaches from './pages/Coaches'
import Bookings from './pages/Bookings'

function AppInner() {
  const { pathname } = useLocation()
  return (
    <>
      {pathname !== '/' && pathname !== '/chat' && <Navbar />}
      <Routes>
        <Route path="/"         element={<Landing />}  />
        <Route path="/chat"     element={<Chat />}     />
        <Route path="/coaches"  element={<Coaches />}  />
        <Route path="/bookings" element={<Bookings />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
