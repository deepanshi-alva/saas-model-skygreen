import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import "flatpickr/dist/themes/light.css";
import DirectionProvider from "@/provider/direction.provider";
import StoreProvider from "@/provider/StoreProvider";
import "@/config/axios.config";
import AuthProvider from "@/provider/auth.provider";
import AuthWrapper from "@/provider/AuthWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({ children, params: { lang } }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang={lang}>
      <StoreProvider>
        <AuthWrapper session={session}>
          <AuthProvider>
            <TanstackProvider>
              <Providers>
                <DirectionProvider lang={lang}>{children}</DirectionProvider>
              </Providers>
            </TanstackProvider>
          </AuthProvider>
        </AuthWrapper>
      </StoreProvider>
    </html>
  );
}
