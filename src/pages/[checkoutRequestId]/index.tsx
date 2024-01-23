import { useRouter } from "next/router"
import { useEffect } from "react";

export default function Checkout() {
  const router = useRouter();

  useEffect(() => {
    if (router.query.checkoutRequestId) {
      router.push({
        pathname: '/[checkoutRequestId]/info',
        query: router.query
      })
    }
  }, [router])

  return <></>
}
