import Layout from "@src/components/layout";
import '../app/globals.css'


export default function MyApp({ Component, pageProps }: any) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}