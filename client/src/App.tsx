import Login from './Components/Auth/Login'
import SignUp from './Components/Auth/SignUp'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './Components/Dashboard/Dashboard'
import Fridge from './Components/Dashboard/Fridge'
import ProtectedRoute from './Components/ProtectedRoute'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fridge" element={<Fridge />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
