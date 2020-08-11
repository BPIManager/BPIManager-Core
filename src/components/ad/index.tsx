import React, { useEffect } from "react";
declare global {
    interface Window {
        adsbygoogle: any,
    }
}

export default function AdsCard() {
    useEffect(() => {
        if (window.adsbygoogle && process.env.NODE_ENV !== "development") {
            window.adsbygoogle.push({});
        }
    }, [])

    return (
      <ins className="adsbygoogle"
        style={{display:"block",margin:"0 auto"}}
        data-ad-client="ca-pub-9237861069664679"
        data-ad-slot="5844744770"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    );
}
