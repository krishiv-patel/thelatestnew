import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrderSuccess from './components/OrderSuccess'; // Import the component

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* ... existing routes ... */}
        <Route path="/order-success" element={<OrderSuccess />} />
        {/* ... existing routes ... */}
      </Routes>
    </Router>
  );
}

export default AppRoutes; 