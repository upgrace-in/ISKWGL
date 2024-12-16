'use client'

export default function DirectDonation() {

    const copyLink = (clipboardData) => {
        const element = document.createElement("textarea");
        element.value = clipboardData;
        document.body.appendChild(element);
        element.select();
        document.execCommand("copy");
        document.body.removeChild(element);
        alert("📋 Copied to clipboard!");
    };

    return (
        <section class="campaign-main-sec py-5" id="quick-donate">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <div class="campaign-benefits py-4 mb-5">
                            <div class="campaign-benefits-wrap">
                                <span><img src="/index_files/bottom.png" alt="" /></span>
                                <div class="benefits-content py-5">
                                    <h4>
                                        AVAIL 80G BENEFITS ON ALL THE DONATIONS MADE TO ISKCON
                                        Warangal
                                    </h4>
                                    <p>
                                        &quot;Exemption order ref no. AAATI0017PF2021901 dated
                                        24/09/2021 valid upto 31/03/2026&quot;
                                    </p>
                                </div>
                                <span><img src="/index_files/top.png" alt="" /></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="row m-0 mb-5">
                            <div class="col-lg-6 mb-5 mb-lg-0">
                                <div class="payment-gateways">
                                    <div class="gateway-header">
                                        <h4 class="mb-0">Donation Through Bank (NEFT/RTGS)</h4>
                                    </div>
                                    <div class="gateway-content">
                                        <div class="key-value">
                                            <span>Bank Name -</span> ICICI Bank<button onClick={() => {
                                                copyLink("ICICI Bank");
                                            }}>Copy</button>
                                        </div>
                                        <div class="key-value">
                                            <span>Account Name -</span> ISKCON<button onClick={() => {
                                                copyLink("ISKCON");
                                            }}>Copy</button>
                                        </div>
                                        <div class="key-value">
                                            <span>Account Number -</span> 092201002821<button onClick={() => {
                                                copyLink("092201002821");
                                            }}>
                                                Copy
                                            </button>
                                        </div>
                                        <div class="key-value">
                                            <span>IFSC Code -</span> ICIC0000922<button onClick={() => {
                                                copyLink("ICIC0000922");
                                            }}>
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <div class="col-lg-4 mb-5 mb-lg-0">
                                <div class="payment-gateways">
                                    <div class="gateway-header">
                                        <h4 class="mb-0">Donate using Paytm</h4>
                                    </div>
                                    <div class="gateway-content grid">
                                        <div class="content">
                                            <div class="paytm-logo">
                                                <img src="/index_files/paytm-logo.png" alt="" /><span>(ISKCON)</span>
                                            </div>
                                            <div class="key-value">
                                                <span>Link-</span> https://paytm.me/Onr-Zsr<button onClick={() => {
                                                    copyLink("https://paytm.me/Onr-Zsr");
                                                }}>
                                                    Copy
                                                </button>
                                            </div>
                                            <div class="gateway-btn">
                                                <a href="https://paytm.me/Onr-Zsr" target="_blank">donate now</a>
                                            </div>
                                        </div>
                                        <figure class="mb-0">
                                            <img src="/donateForIMGs/qrCode.jpg" alt="" />
                                        </figure>
                                    </div>
                                </div>
                            </div> */}
                            <div class="col-lg-6 mb-5 mb-lg-0">
                                <div class="payment-gateways">
                                    <div class="gateway-header">
                                        <h4 class="mb-0">Donate through UPI</h4>
                                    </div>
                                    <div class="gateway-content grid">
                                        <div class="content">
                                            <div class="upi-logo">
                                                <img src="/index_files/upi-logo.png" alt="" /><span>(ISKCON)</span>
                                            </div>
                                            <div class="key-value">
                                                <span>UPI ID-</span> donate.iskcon@icici<button onClick={() => {
                                                    copyLink("donate.iskcon@icici");
                                                }}>
                                                    Copy
                                                </button>
                                            </div>
                                            <span class="short-note">(Use for Google Pay, BHIM, PhonePe, Paytm and other
                                                UPI Apps)</span>
                                        </div>
                                        <figure class="mb-0">
                                            <img src="/donateForIMGs/qrCode.jpg" alt="" />
                                        </figure>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="campaign-request mb-5 py-4">
                            <p>
                                Gentle Request! While doing Paytm/UPI App Payments or Bank
                                (NEFT/RTGS) please send us a screenshot along with complete
                                address and PAN details on our Whatsapp number -
                                <a target="_blank" href="https://wa.me/9515673115">+91 95156 73115</a>
                                or to our email ID -<a target="_blank"
                                    href="mailto:warangaliskcon@gmail.com">warangaliskcon@gmail.com</a>. You may
                                also call on this number for other queries.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}