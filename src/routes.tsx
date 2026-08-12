import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import DadosCadastrais from './pages/DadosCadastrais/DadosCadastrais'
import Dashboard from './pages/Dashboard/Dashboard'
import NovoECG from './pages/NovoECG/NovoECG'
import ConfigECG from './pages/ConfigECG/ConfigECG'
import PosicionarDerivacoes from './pages/PosicionarDerivacoes/PosicionarDerivacoes'
import AjustesImagem from './pages/AjustesImagem/AjustesImagem'
import DadosPaciente from './pages/DadosPaciente/DadosPaciente'
import ECGViewer from './pages/ECGViewer/ECGViewer'
import Laudo from './pages/Laudo/Laudo'
import PlanosPagamento from './pages/PlanosPagamento/PlanosPagamento'
import Feedback from './pages/Feedback/Feedback'
import NotFound from './pages/NotFound/NotFound'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dados-cadastrais" element={<DadosCadastrais />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/novo-ecg" element={<ProtectedRoute><NovoECG /></ProtectedRoute>} />
      <Route path="/config-ecg" element={<ProtectedRoute><ConfigECG /></ProtectedRoute>} />
      <Route path="/posicionar-derivacoes" element={<ProtectedRoute><PosicionarDerivacoes /></ProtectedRoute>} />
      <Route path="/ajustes-imagem" element={<ProtectedRoute><AjustesImagem /></ProtectedRoute>} />
      <Route path="/dados-paciente" element={<ProtectedRoute><DadosPaciente /></ProtectedRoute>} />
      <Route path="/ecg-viewer" element={<ProtectedRoute><ECGViewer /></ProtectedRoute>} />
      <Route path="/laudo" element={<ProtectedRoute><Laudo /></ProtectedRoute>} />
      <Route path="/laudo/:examId" element={<ProtectedRoute><Laudo /></ProtectedRoute>} />
      <Route path="/planos" element={<ProtectedRoute><PlanosPagamento /></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
