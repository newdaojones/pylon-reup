/* eslint-disable @next/next/no-sync-scripts */
"use client"

import Layout from "@src/components/layout";
import '../app/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-phone-number-input/style.css'

import { ToastContainer } from 'react-toastify';
import { AuthProvider } from "@src/context/auth";
import { CheckoutProvider } from "@src/context/checkout";
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from "@src/services";
import Head from "next/head";


export default function MyApp({ Component, pageProps }: any) {
  return (
    <Layout>
      <Head>
        <script src="https://cdn.checkout.com/js/framesv2.min.js" />
      </Head>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <CheckoutProvider>
            <ToastContainer />
            <div className="max-w-lg w-full">
              <Component {...pageProps} />
            </div>
          </CheckoutProvider>
        </AuthProvider>
      </ApolloProvider>
    </Layout >
  )
}