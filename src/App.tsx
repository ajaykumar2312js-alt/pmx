import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AppRouter } from './routes';
import { ToastHost } from './components/common/ui/Toast/ToastHost';

function App() {
  return (
    <Provider store={store}>
      <ToastHost />
      <AppRouter />
    </Provider>
  );
}

export default App;
