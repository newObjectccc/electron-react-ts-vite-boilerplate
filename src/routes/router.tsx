import { createHashRouter } from 'react-router-dom';
import MainView from '../renderer/main-view/main-view';

const router = createHashRouter([
  {
    path: '/',
    element: <MainView title={'Hello World!'} />
  }
]);

export default router;
