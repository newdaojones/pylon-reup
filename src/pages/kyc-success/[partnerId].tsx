import React, { useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function KybSuccess() {
  const router = useRouter();
  const partnerId = useMemo(() => router.query.partnerId, [router])

  const processComplete = useCallback(() => {
    if (!partnerId) {
      return
    }

    axios.post(`${process.env.NEXT_PUBLIC_API_URI}/partners/kyb_success/${partnerId}`)
  }, [partnerId])

  useEffect(() => {
    // callback function to call when event triggers
    const onPageLoad = () => {
      window.close()
    };

    // Check if the page has already loaded
    if (document.readyState === 'complete') {
      onPageLoad();
    } else {
      window.addEventListener('load', onPageLoad, false);
      // Remove the event listener when component unmounts
      return () => window.removeEventListener('load', onPageLoad);
    }
  }, []);

  useEffect(() => {
    processComplete()
  }, [processComplete])
  return <></>
}