interface MainViewProps {
  title: string;
}

const MainView = (props: MainViewProps) => {
  const { title } = props;
  return (
    <>
      <h1 className="h-40 font-bold text-2xl">💖 {title}</h1>
      <img className="size-14 m-2" src="./src/assets/logo.png" />
      <p>Welcome to your Electron application.</p>
    </>
  );
};

export default MainView;
