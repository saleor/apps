import { NextPage } from "next";
import { useRouter } from "next/router";

// this should be secure,
const ConnectLinkPage: NextPage = () => {
  const router = useRouter()
  const params = router.query

  return (
    <button onClick={async () => {
      const res = await fetch("/api/connect/link", {
        method: "POST",
        body: JSON.stringify({
          account: params.account,
          configId: params.configId,
          saleorApiUrl: params.saleorApiUrl,
        }),
      })

      const json = await res.json()

      window.location.href = json.redirectUrl;


    }}>Connect {params.account}</button>
  )
};

export default ConnectLinkPage;
