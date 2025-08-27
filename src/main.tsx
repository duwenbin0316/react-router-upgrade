import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.tsx'
import { store } from './store'
import { history } from './store/history'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
)
