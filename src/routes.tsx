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
import ECGViewer2 from './pages/ECGViewer2/ECGViewer2'
import Laudo from './pages/Laudo/Laudo'
import PlanosPagamento from './pages/PlanosPagamento/PlanosPagamento'
import Feedback from './pages/Feedback/Feedback'
import NotFound from './pages/NotFound/NotFound'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dados-cadastrais" element={<DadosCadastrais />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/novo-ecg" element={<NovoECG />} />
      <Route path="/config-ecg" element={<ConfigECG />} />
      <Route path="/posicionar-derivacoes" element={<PosicionarDerivacoes />} />
      <Route path="/ajustes-imagem" element={<AjustesImagem />} />
      <Route path="/dados-paciente" element={<DadosPaciente />} />
      <Route path="/ecg-viewer" element={<ECGViewer />} />
      <Route path="/ecg-viewer-2" element={<ECGViewer2 />} />
      <Route path="/laudo" element={<Laudo />} />
      <Route path="/planos" element={<PlanosPagamento />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
