import styles from './mainView.module.css';

interface MainViewProps {
  title: string;
}

const MainView = (props: MainViewProps) => {
  const { title } = props;
  return (
    <>
      <h1>💖 Hello World!</h1>
      <p>Welcome to your Electron application.</p>
      <div>{title}</div>
      <img className={styles['img']} src="./src/assets/logo.png" />
    </>
  );
};

export default MainView;
