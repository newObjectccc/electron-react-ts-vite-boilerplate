import { createHashRouter } from 'react-router-dom';
import MainView from '../renderer/main-view/mainView';

const router = createHashRouter([
  {
    path: '/',
    element: <MainView title={'Hello World!'} />
  }
]);

export default router;
