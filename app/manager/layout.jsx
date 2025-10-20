import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
const layout = async ({ children }) => {
  return (
    <>
      <DashBoardLayoutProvider>{children}</DashBoardLayoutProvider>
    </>
  );
};

export default layout;
