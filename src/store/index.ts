import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { thunk } from 'redux-thunk'
import { history } from './history'

const rootReducer = combineReducers({
  router: connectRouter(history),
})

export type RootState = ReturnType<typeof rootReducer>

// Redux DevTools support if available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(routerMiddleware(history), thunk))
)


