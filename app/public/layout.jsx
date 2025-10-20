import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
const layout = async ({ children }) => {
  return (
    <>
      <DashBoardLayoutProvider roleType={'ADMIN'}>{children}</DashBoardLayoutProvider>
    </>
  );
};

export default layout;
